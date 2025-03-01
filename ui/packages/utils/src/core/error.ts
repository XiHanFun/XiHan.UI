export class XiHanError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "XiHanError";
  }
}

export const throwError = (message: string, code = "UNKNOWN"): never => {
  throw new XiHanError(message, code);
};

export const assert = (condition: boolean, message: string, code = "ASSERTION"): void => {
  if (!condition) {
    throwError(message, code);
  }
};
