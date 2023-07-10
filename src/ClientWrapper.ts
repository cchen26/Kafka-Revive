import {
  MessageOptions,
  ConsumerMessageHandler,
  ConsumerSubscriptionOptions,
} from "./Interfaces";
import { ErrorHandling } from "./ErrorHandling";

export class ClientWrapper {
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

  createProducer() {
    const { client, topic } = this;

    return {
      connect: async () => {
        try {
          await client.producer().connect();
        } catch (e) {
          throw new ErrorHandling(e, this.constructor.name, "producer.connect");
        }
      },
      send: async (message: MessageOptions) => {
        try {
          const { messages } = message;
          await client.producer().send({ topic, messages });
        } catch (e) {
          throw new ErrorHandling(e, this.constructor.name, "producer.send");
        }
      },
    };
  }

  createConsumer(groupId: { groupId: string }) {
    const { client, callback, topic } = this;
    const consumer = client.consumer(groupId);

    return {
      connect: consumer.connect.bind(consumer),
      subscribe: (input?: ConsumerSubscriptionOptions) =>
        consumer.subscribe({
          ...input,
          topic,
          fromBeginning: false,
        }),
      run: (input: ConsumerMessageHandler) =>
        consumer.run({
          ...input,
          eachMessage: ({ topic, partitions, message }) => {
            if (callback && !callback(message)) {
              throw new ErrorHandling(
                new Error(),
                this.constructor.name,
                "consumer.run"
              );
            } else {
              input.eachMessage({ topic, partitions, message });
            }
          },
        }),
    };
  }
}
