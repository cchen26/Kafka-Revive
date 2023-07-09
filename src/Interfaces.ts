import { CompressionTypes } from "kafkajs";

export interface MessagePayload {
  topic: string;
  messages: object[];
  partitions?: number;
}

export interface ConsumerMessageHandler {
  eachMessage: (params: {
    topic: string;
    partitions?: number;
    message: any;
    offset?: number;
  }) => Promise<void>;
  eachBatchAutoResolve?: boolean;
}

export interface ConsumerSubscriptionOptions {
  groupId?: string;
  topic?: string;
  fromBeginning?: boolean;
}

export interface MessageOptions {
  acks?: number;
  timeout?: number;
  compression?: CompressionTypes;
  topic: string;
  messages: object[];
}
