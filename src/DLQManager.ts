import {
  ConsumerMessageHandler,
  ConsumerSubscriptionOptions,
  MessagePayload,
} from "./Interfaces";
import { ErrorHandling } from "./ErrorHandling";

export class DLQManager {
  client: any;
  topic: string;
  callback?: (message: any) => boolean;
  admin: any;

  constructor(
    client: any,
    topic: string,
    callback?: (message: any) => boolean
  ) {
    this.topic = topic;
    this.client = client;
    this.callback = callback;
    this.admin = this.client.admin();
  }

  async createDLQ() {
    await this.admin.connect();
    try {
      await this.admin.createTopics({
        topics: [
          {
            topic: `${this.topic}.deadLetterQueue`,
            numPartitions: 1,
            replicationFactor: 1,
            replicaAssignment: [{ partition: 0, replicas: [0, 1, 2] }],
          },
        ],
      });
    } catch (err: any) {
      console.log("Error from createDLQ", err);
    } finally {
      await this.admin.disconnect();
    }
  }

  producerConnect() {
    const producer = this.client.producer();
    const self = this;

    return async function () {
      await producer.connect();
      await self.createDLQ();
    };
  }

  producerDisconnect() {
    const producer = this.client.producer();

    return async function () {
      await producer.disconnect();
    };
  }

  producerSend(message: MessagePayload) {
    const producer = this.client.producer();

    return async () => {
      try {
        await producer.send({
          ...message,
          topic: message.topic,
          messages: message.messages,
        });
      } catch (e: any) {
        await producer.send({
          messages: message.messages,
          topic: `${this.topic}.deadLetterQueue`,
        });
        await producer.disconnect();
        const newError = new ErrorHandling(
          e,
          this.constructor.name,
          "producer.send"
        );
        console.log(newError);
      }
    };
  }

  consumerConnect(groupId: { groupId: string }) {
    const consumer = this.client.consumer(groupId);
    const self = this;

    return async function () {
      await consumer.connect();
      await self.createDLQ();
    };
  }

  consumerSubscribe(input?: ConsumerSubscriptionOptions) {
    const consumer = this.client.consumer();
    const self = this;

    return async function () {
      await consumer.subscribe({
        ...input,
        topic: self.topic,
        fromBeginning: false,
      });
    };
  }

  consumerRun(input: ConsumerMessageHandler) {
    const consumer = this.client.consumer();
    const self = this;

    return async function () {
      const { eachMessage } = input;
      await consumer.run({
        ...input,
        eachMessage: async function ({
          topic,
          partitions,
          message,
        }: {
          topic: string;
          partitions: number;
          message: any;
        }) {
          try {
            if (self.callback && !self.callback(message)) {
              throw new ErrorHandling(
                new Error(),
                self.constructor.name,
                "consumer.run.try"
              );
            }
            eachMessage({ topic, partitions, message });
          } catch (e: any) {
            const newError = new ErrorHandling(
              e,
              self.constructor.name,
              "consumer.run"
            );
            console.error(newError);
            const producerConnect = self.producerConnect();
            const producerDisconnect = self.producerDisconnect();
            await producerConnect();
            console.log("Connected to DLQ topic");
            const producerSend = self.producerSend({
              topic: `${self.topic}.deadLetterQueue`,
              messages: [message],
            });
            await producerSend();
            console.log("Message sent to DLQ");
            await producerDisconnect();
            console.log("Producer disconnected");
          }
        },
      });
    };
  }

  retryConnect() {
    const dlqConsumer = this.client.consumer({ groupId: "dlq-consumer-group" });

    return dlqConsumer.connect();
  }

  retryProcessMessages() {
    const dlqConsumer = this.client.consumer({ groupId: "dlq-consumer-group" });
    const producerConnect = this.producerConnect();
    const self = this;

    async function processMessages() {
      await dlqConsumer.subscribe({
        topic: `${self.topic}.deadLetterQueue`,
        fromBeginning: true,
      });
      await dlqConsumer.run({
        eachMessage: async function ({ message }) {
          try {
            const producerSend = self.producerSend({
              topic: self.topic,
              messages: [{ value: message.value }],
            });
            await producerConnect();
            await producerSend();
            console.log(`Message was successfully retried: ${message.value}`);
            await dlqConsumer.commitOffsets([
              {
                topic: message.topic,
                partition: message.partition,
                offset: message.offset,
              },
            ]);
            await producerConnect();
          } catch (error) {
            console.error(`Retry message was NOT sucessful: ${message.value}`);
          }
        },
      });
    }

    return processMessages;
  }
}
