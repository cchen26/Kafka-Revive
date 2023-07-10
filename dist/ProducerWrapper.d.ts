import { MessagePayload } from "./Interfaces";
export declare class KafkaProducerWrapper {
    private retry;
    private kafkaJSClient;
    private successEventHandlers;
    constructor(retry: number, kafkaJSClient: any);
    connect(): any;
    disconnect(): any;
    send(message: MessagePayload): any;
    onSuccess(handler: Function): void;
    private emitSuccessEvent;
}
