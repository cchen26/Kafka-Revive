import {
  ConsumerMessageHandler,
  ConsumerSubscriptionOptions,
} from "./Interfaces";
import { ErrorHandling } from "./ErrorHandling";

export class ConsumerWrapper {
  private client: any;
  private topic: string;
  private callback?: (message: any) => boolean;

  constructor(
    client: any,
    topic: string,
    callback?: (message: any) => boolean
  ) {
    this.client = client;
    this.topic = topic;
    this.callback = callback;
  }

  public connect(groupId: { groupId: string }) {
    const consumer = this.client.consumer(groupId);
    consumer.connect = consumer.connect.bind(consumer);
    return consumer;
  }

  public subscribe(consumer: any, input?: ConsumerSubscriptionOptions) {
    const { topic, fromBeginning, ...rest } = input || {};
    return consumer.subscribe({
      topic: this.topic,
      fromBeginning: fromBeginning || false,
      ...rest,
    });
  }

  public run(consumer: any, input: ConsumerMessageHandler) {
    const { eachMessage, ...rest } = input;
    consumer.run({
      ...rest,
      eachMessage: async (args: {
        topic: string;
        partitions: number;
        message: any;
      }) => {
        const { topic, partitions, message } = args;
        if (this.callback && !this.callback(message)) {
          throw new ErrorHandling(new Error(), this.constructor.name);
        } else {
          await eachMessage({ topic, partitions, message });
        }
      },
    });
  }

  public disconnect() {
    if (this.client) {
      return this.client.disconnect();
    }
  }
}
