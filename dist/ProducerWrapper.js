"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProducerWrapper = void 0;
const ErrorHandling_1 = require("./ErrorHandling");
class ProducerWrapper {
    constructor(retry, kafkaJSClient) {
        this.retry = retry;
        this.kafkaJSClient = kafkaJSClient;
        this.successEventHandlers = [];
    }
    connect() {
        return this.kafkaJSClient.producer().connect();
    }
    disconnect() {
        return this.kafkaJSClient.producer().disconnect();
    }
    send(message) {
        const producer = this.kafkaJSClient.producer({
            retry: {
                retries: this.retry,
            },
        });
        const className = this.constructor.name;
        return producer
            .send(message)
            .then((result) => {
            this.emitSuccessEvent(result);
            return result;
        })
            .catch((e) => {
            producer.disconnect();
            throw new ErrorHandling_1.ErrorHandling(e, className, "send");
        });
    }
    onSuccess(handler) {
        this.successEventHandlers.push(handler);
    }
    emitSuccessEvent(result) {
        this.successEventHandlers.forEach((handler) => {
            handler(result);
        });
    }
}
exports.ProducerWrapper = ProducerWrapper;
