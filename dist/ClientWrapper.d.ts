import { MessageOptions, ConsumerMessageHandler, ConsumerSubscriptionOptions } from "./Interfaces";
export declare class KafkaClientWrapper {
    client: any;
    topic: string;
    callback?: (message: any) => boolean;
    admin: any;
    constructor(client: any, topic: string, callback?: (message: any) => boolean);
    createProducer(): {
        connect: () => Promise<void>;
        send: (message: MessageOptions) => Promise<void>;
    };
    createConsumer(groupId: {
        groupId: string;
    }): {
        connect: any;
        subscribe: (input?: ConsumerSubscriptionOptions) => any;
        run: (input: ConsumerMessageHandler) => any;
    };
}
