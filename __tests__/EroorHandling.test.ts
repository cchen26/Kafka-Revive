import * as fs from "fs";
import { ErrorHandling } from "../src/ErrorHandling";

jest.mock("fs");

describe("ErrorHandling", () => {
  const mockWriteFileSync = fs.writeFileSync as jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should log the error and write to file", () => {
    const originalError = new Error("Original Error");
    const className = "TestClass";
    const methodName = "testMethod";
    const side = "testSide";
    const currentTime = "2022-01-01-[00-00-00-000]";

    jest
      .spyOn(global.Date.prototype, "toISOString")
      .mockReturnValueOnce(currentTime);

    const errorHandling = new ErrorHandling(
      originalError,
      className,
      methodName,
      side
    );

    expect(errorHandling).toBeInstanceOf(ErrorHandling);
    expect(errorHandling.stack).toBeDefined();
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      expect.stringContaining("error logs/2022-01-01-[00-00-00-000].txt"),
      expect.any(String)
    );

    const writtenContent = mockWriteFileSync.mock.calls[0][1] as string;
    expect(writtenContent).toContain(`Error occurred at [Class: ${className}]`);
    expect(writtenContent).toContain(`[Method: ${methodName}] [Side: ${side}]`);
    expect(writtenContent).toContain(`Time: ${currentTime}`);
    expect(writtenContent).toContain(`Stack Trace: ${errorHandling.stack}`);
    expect(writtenContent).toContain(`Original Error: ${originalError}`);
    expect(writtenContent).toContain(
      `Logged! as error logs/2022-01-01-[00-00-00-000].txt`
    );
    expect(writtenContent).toContain(
      "Your message was unsuccessful. It will be sent to a Dead Letter Queue."
    );
  });

  it("should log the error without method and side", () => {
    const originalError = new Error("Original Error");
    const className = "TestClass";
    const currentTime = "2022-01-01-[00-00-00-000]";

    jest
      .spyOn(global.Date.prototype, "toISOString")
      .mockReturnValueOnce(currentTime);

    const errorHandling = new ErrorHandling(originalError, className);

    expect(errorHandling).toBeInstanceOf(ErrorHandling);
    expect(errorHandling.stack).toBeDefined();
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      expect.stringContaining("error logs/2022-01-01-[00-00-00-000].txt"),
      expect.any(String)
    );

    const writtenContent = mockWriteFileSync.mock.calls[0][1] as string;
    expect(writtenContent).toContain(`Error occurred at [Class: ${className}]`);
    expect(writtenContent).toContain(`[Method: ] [Side: ]`);
    expect(writtenContent).toContain(`Time: ${currentTime}`);
    expect(writtenContent).toContain(`Stack Trace: ${errorHandling.stack}`);
    expect(writtenContent).toContain(`Original Error: ${originalError}`);
    expect(writtenContent).toContain(
      `Logged! as error logs/2022-01-01-[00-00-00-000].txt`
    );
    expect(writtenContent).toContain(
      "Your message was unsuccessful. It will be sent to a Dead Letter Queue."
    );
  });
});
