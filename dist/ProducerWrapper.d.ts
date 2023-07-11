import { MessagePayload } from "./Interfaces";
export declare class ProducerWrapper {
    private retry;
    private kafkaJSClient;
    private successEventHandlers;
    constructor(retry: number, kafkaJSClient: any);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    send(message: MessagePayload): Promise<any>;
    onSuccess(handler: Function): void;
    private emitSuccessEvent;
}
