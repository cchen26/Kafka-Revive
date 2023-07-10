import { MessagePayload } from "./Interfaces";
import { ErrorHandling } from "./ErrorHandling";

export class ProducerWrapper {
  private successEventHandlers: Function[];

  constructor(private retry: number, private kafkaJSClient: any) {
    this.successEventHandlers = [];
  }

  public connect() {
    return this.kafkaJSClient.producer().connect();
  }

  public disconnect() {
    return this.kafkaJSClient.producer().disconnect();
  }

  public send(message: MessagePayload) {
    const producer = this.kafkaJSClient.producer({
      retry: {
        retries: this.retry,
      },
    });
    const className = this.constructor.name;
    return producer
      .send(message)
      .then((result: any) => {
        this.emitSuccessEvent(result);
        return result;
      })
      .catch((e: any) => {
        producer.disconnect();
        throw new ErrorHandling(e, className, "send");
      });
  }

  public onSuccess(handler: Function) {
    this.successEventHandlers.push(handler);
  }

  private emitSuccessEvent(result: any) {
    this.successEventHandlers.forEach((handler: Function) => {
      handler(result);
    });
  }
}
