import { ConsumerMessageHandler, ConsumerSubscriptionOptions, MessagePayload } from "./Interfaces";
export declare class KafkaDLQManager {
    client: any;
    topic: string;
    callback?: (message: any) => boolean;
    admin: any;
    constructor(client: any, topic: string, callback?: (message: any) => boolean);
    createDLQ(): Promise<void>;
    producerConnect(): () => Promise<void>;
    producerDisconnect(): () => Promise<void>;
    producerSend(message: MessagePayload): () => Promise<void>;
    consumerConnect(groupId: {
        groupId: string;
    }): () => Promise<void>;
    consumerSubscribe(input?: ConsumerSubscriptionOptions): () => Promise<void>;
    consumerRun(input: ConsumerMessageHandler): () => Promise<void>;
    retryConnect(): any;
    retryProcessMessages(): () => Promise<void>;
}
