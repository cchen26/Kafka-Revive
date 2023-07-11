"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DLQManager = void 0;
const ErrorHandling_1 = require("./ErrorHandling");
class DLQManager {
    constructor(client, topic, callback) {
        this.topic = topic;
        this.client = client;
        this.callback = callback;
        this.admin = this.client.admin();
    }
    createDLQ() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.admin.connect();
            try {
                yield this.admin.createTopics({
                    topics: [
                        {
                            topic: `${this.topic}.deadLetterQueue`,
                            numPartitions: 1,
                            replicationFactor: 1,
                            replicaAssignment: [{ partition: 0, replicas: [0, 1, 2] }],
                        },
                    ],
                });
            }
            catch (err) {
                console.log("Error from createDLQ", err);
            }
            finally {
                yield this.admin.disconnect();
            }
        });
    }
    producerConnect() {
        const producer = this.client.producer();
        const self = this;
        return function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield producer.connect();
                yield self.createDLQ();
            });
        };
    }
    producerDisconnect() {
        const producer = this.client.producer();
        return function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield producer.disconnect();
            });
        };
    }
    producerSend(message) {
        const producer = this.client.producer();
        return () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield producer.send(Object.assign(Object.assign({}, message), { topic: message.topic, messages: message.messages }));
            }
            catch (e) {
                yield producer.send({
                    messages: message.messages,
                    topic: `${this.topic}.DeadLetterQueue`,
                });
                yield producer.disconnect();
                const newError = new ErrorHandling_1.ErrorHandling(e, this.constructor.name, "producer.send");
                console.log(newError);
            }
        });
    }
    consumerConnect(groupId) {
        const consumer = this.client.consumer(groupId);
        const self = this;
        return function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield consumer.connect();
                yield self.createDLQ();
            });
        };
    }
    consumerSubscribe(input) {
        const consumer = this.client.consumer();
        const self = this;
        return function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield consumer.subscribe(Object.assign(Object.assign({}, input), { topic: self.topic, fromBeginning: false }));
            });
        };
    }
    consumerRun(input) {
        const consumer = this.client.consumer();
        const self = this;
        return function () {
            return __awaiter(this, void 0, void 0, function* () {
                const { eachMessage } = input;
                yield consumer.run(Object.assign(Object.assign({}, input), { eachMessage: function ({ topic, partitions, message, }) {
                        return __awaiter(this, void 0, void 0, function* () {
                            try {
                                if (self.callback && !self.callback(message)) {
                                    throw new ErrorHandling_1.ErrorHandling(new Error(), self.constructor.name, "consumer.run.try");
                                }
                                eachMessage({ topic, partitions, message });
                            }
                            catch (e) {
                                const newError = new ErrorHandling_1.ErrorHandling(e, self.constructor.name, "consumer.run");
                                console.error(newError);
                                const producerConnect = self.producerConnect();
                                const producerDisconnect = self.producerDisconnect();
                                yield producerConnect();
                                console.log("Connected to DLQ topic");
                                const producerSend = self.producerSend({
                                    topic: `${self.topic}.deadLetterQueue`,
                                    messages: [message],
                                });
                                yield producerSend();
                                console.log("Message sent to DLQ");
                                yield producerDisconnect();
                                console.log("Producer disconnected");
                            }
                        });
                    } }));
            });
        };
    }
    retryConnect() {
        const dlqConsumer = this.client.consumer({ groupId: "dlq-consumer-group" });
        return dlqConsumer.connect();
    }
    retryProcessMessages() {
        const dlqConsumer = this.client.consumer({ groupId: "dlq-consumer-group" });
        const producerConnect = this.producerConnect();
        const self = this;
        function processMessages() {
            return __awaiter(this, void 0, void 0, function* () {
                yield dlqConsumer.subscribe({
                    topic: `${self.topic}.deadLetterQueue`,
                    fromBeginning: true,
                });
                yield dlqConsumer.run({
                    eachMessage: function ({ message }) {
                        return __awaiter(this, void 0, void 0, function* () {
                            try {
                                const producerSend = self.producerSend({
                                    topic: self.topic,
                                    messages: [{ value: message.value }],
                                });
                                yield producerConnect();
                                yield producerSend();
                                console.log(`Message was successfully retried: ${message.value}`);
                                yield dlqConsumer.commitOffsets([
                                    {
                                        topic: message.topic,
                                        partition: message.partition,
                                        offset: message.offset,
                                    },
                                ]);
                                yield producerConnect();
                            }
                            catch (error) {
                                console.error(`Retry message was NOT sucessful: ${message.value}`);
                            }
                        });
                    },
                });
            });
        }
        return processMessages;
    }
}
exports.DLQManager = DLQManager;
