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
exports.KafkaClientWrapper = void 0;
const ErrorHandling_1 = require("./ErrorHandling");
class KafkaClientWrapper {
    constructor(client, topic, callback) {
        this.topic = topic;
        this.client = client;
        this.callback = callback;
        this.admin = this.client.admin();
    }
    createProducer() {
        const { client, topic } = this;
        return {
            connect: () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield client.producer().connect();
                }
                catch (e) {
                    throw new ErrorHandling_1.ErrorHandling(e, this.constructor.name, "producer.connect");
                }
            }),
            send: (message) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { messages } = message;
                    yield client.producer().send({ topic, messages });
                }
                catch (e) {
                    throw new ErrorHandling_1.ErrorHandling(e, this.constructor.name, "producer.send");
                }
            }),
        };
    }
    createConsumer(groupId) {
        const { client, callback, topic } = this;
        const consumer = client.consumer(groupId);
        return {
            connect: consumer.connect.bind(consumer),
            subscribe: (input) => consumer.subscribe(Object.assign(Object.assign({}, input), { topic, fromBeginning: false })),
            run: (input) => consumer.run(Object.assign(Object.assign({}, input), { eachMessage: ({ topic, partitions, message }) => {
                    if (callback && !callback(message)) {
                        throw new ErrorHandling_1.ErrorHandling(new Error(), this.constructor.name, "consumer.run");
                    }
                    else {
                        input.eachMessage({ topic, partitions, message });
                    }
                } })),
        };
    }
}
exports.KafkaClientWrapper = KafkaClientWrapper;
