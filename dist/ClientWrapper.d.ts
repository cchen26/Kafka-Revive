import { MessageOptions, ConsumerMessageHandler, ConsumerSubscriptionOptions } from "./Interfaces";
export declare class ClientWrapper {
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
        connect: () => Promise<void>;
        subscribe: (input?: ConsumerSubscriptionOptions) => Promise<void>;
        run: (input: ConsumerMessageHandler) => Promise<void>;
    };
}
