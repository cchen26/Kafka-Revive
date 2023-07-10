import { ConsumerMessageHandler, ConsumerSubscriptionOptions } from "./Interfaces";
export declare class KafkaConsumerWrapper {
    private client;
    private topic;
    private callback?;
    constructor(client: any, topic: string, callback?: (message: any) => boolean);
    connect(groupId: {
        groupId: string;
    }): any;
    subscribe(consumer: any, input?: ConsumerSubscriptionOptions): any;
    run(consumer: any, input: ConsumerMessageHandler): void;
    disconnect(): any;
}
