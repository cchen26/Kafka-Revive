import * as fs from "fs";

export class ErrorHandling extends Error {
  private readonly currentTime: string;
  private readonly logFileName: string;

  constructor(
    private originalError: any,
    private className: string,
    private methodName: string = "",
    private side: string = ""
  ) {
    super();
    this.currentTime = this.getCurrentDateTime();
    this.logFileName = `error logs/${this.currentTime}.txt`;
    Error.captureStackTrace(this, ErrorHandling);
    this.logError();
  }

  private getCurrentDateTime(): string {
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

  private logError() {
    const errorMessage =
      `Error occurred at [Class: ${this.className}] | [Method: ${this.methodName}] [Side: ${this.side}]\n` +
      `Time: ${this.currentTime}\n` +
      `Stack Trace: ${this.stack ?? ""}\n` +
      `Original Error: ${this.originalError}\n` +
      `Logged! as ${this.logFileName}\n` +
      `Your message was unsuccessful. It will be sent to a Dead Letter Queue.\n`;

    console.log(errorMessage);
    fs.writeFileSync(this.logFileName, errorMessage);
  }
}
