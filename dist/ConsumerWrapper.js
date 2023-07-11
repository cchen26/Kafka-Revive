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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumerWrapper = void 0;
const ErrorHandling_1 = require("./ErrorHandling");
class ConsumerWrapper {
    constructor(client, topic, callback) {
        this.client = client;
        this.topic = topic;
        this.callback = callback;
    }
    connect(groupId) {
        const consumer = this.client.consumer(groupId);
        consumer.connect = consumer.connect.bind(consumer);
        return consumer;
    }
    subscribe(consumer, input) {
        const _a = input || {}, { topic, fromBeginning } = _a, rest = __rest(_a, ["topic", "fromBeginning"]);
        return consumer.subscribe(Object.assign({ topic: this.topic, fromBeginning: fromBeginning || false }, rest));
    }
    run(consumer, input) {
        const { eachMessage } = input, rest = __rest(input, ["eachMessage"]);
        consumer.run(Object.assign(Object.assign({}, rest), { eachMessage: (args) => __awaiter(this, void 0, void 0, function* () {
                const { topic, partitions, message } = args;
                if (this.callback && !this.callback(message)) {
                    throw new ErrorHandling_1.ErrorHandling(new Error(), this.constructor.name);
                }
                else {
                    yield eachMessage({ topic, partitions, message });
                }
            }) }));
    }
    disconnect() {
        if (this.client) {
            return this.client.disconnect();
        }
    }
}
exports.ConsumerWrapper = ConsumerWrapper;
