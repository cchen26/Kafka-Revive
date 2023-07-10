export declare class ErrorHandling extends Error {
    private originalError;
    private className;
    private methodName;
    private side;
    private readonly currentTime;
    private readonly logFileName;
    constructor(originalError: any, className: string, methodName?: string, side?: string);
    private getCurrentDateTime;
    private logError;
}
