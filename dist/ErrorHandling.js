"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandling = void 0;
const fs = require("fs");
class ErrorHandling extends Error {
    constructor(originalError, className, methodName = "", side = "") {
        super();
        this.originalError = originalError;
        this.className = className;
        this.methodName = methodName;
        this.side = side;
        this.currentTime = this.getCurrentDateTime();
        this.logFileName = `error logs/${this.currentTime}.txt`;
        Error.captureStackTrace(this, ErrorHandling);
        this.logError();
    }
    getCurrentDateTime() {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
        const day = currentDate.getDate().toString().padStart(2, "0");
        const hours = currentDate.getHours().toString().padStart(2, "0");
        const minutes = currentDate.getMinutes().toString().padStart(2, "0");
        const seconds = currentDate.getSeconds().toString().padStart(2, "0");
        const milliseconds = currentDate
            .getMilliseconds()
            .toString()
            .padStart(3, "0");
        return `${year}-${month}-${day}-[${hours}-${minutes}-${seconds}-${milliseconds}]`;
    }
    logError() {
        var _a;
        const errorMessage = `Error occurred at [Class: ${this.className}] | [Method: ${this.methodName}] [Side: ${this.side}]\n` +
            `Time: ${this.currentTime}\n` +
            `Stack Trace: ${(_a = this.stack) !== null && _a !== void 0 ? _a : ""}\n` +
            `Original Error: ${this.originalError}\n` +
            `Logged! as ${this.logFileName}\n` +
            `Your message was unsuccessful. It will be sent to a Dead Letter Queue.\n`;
        console.log(errorMessage);
        fs.writeFileSync(this.logFileName, errorMessage);
    }
}
exports.ErrorHandling = ErrorHandling;
