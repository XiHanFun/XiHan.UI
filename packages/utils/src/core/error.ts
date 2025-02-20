export class XihanError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "XihanError";
  }
}

export const throwError = (message: string, code = "UNKNOWN"): never => {
  throw new XihanError(message, code);
};

export const assert = (condition: boolean, message: string, code = "ASSERTION"): void => {
  if (!condition) {
    throwError(message, code);
  }
};
