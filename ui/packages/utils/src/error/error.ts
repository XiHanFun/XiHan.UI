/**
 * 错误码常量
 */
const ErrorCodes = {
  // 通用错误
  UNKNOWN: "UNKNOWN",
  ASSERTION: "ASSERTION",
  TYPE_ERROR: "TYPE_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",

  // 组件相关错误
  PROP_VALIDATION: "PROP_VALIDATION",
  COMPONENT_MISSING: "COMPONENT_MISSING",
  COMPONENT_RENDER: "COMPONENT_RENDER",

  // 指令相关错误
  DIRECTIVE_ERROR: "DIRECTIVE_ERROR",

  // 配置相关错误
  CONFIG_ERROR: "CONFIG_ERROR",

  // 主题相关错误
  THEME_ERROR: "THEME_ERROR",

  // 国际化相关错误
  I18N_ERROR: "I18N_ERROR",
} as const;

export type ErrorCode = keyof typeof ErrorCodes;

/**
 * 曦寒错误类
 * @param message 错误信息
 * @param code 错误代码
 * @param details 错误详情
 * @returns 错误实例
 */
export class XiHanError extends Error {
  constructor(
    message: string,
    public code: ErrorCode = "UNKNOWN",
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = "XiHanError";

    // 确保 Error 的堆栈追踪正常工作
    // @ts-ignore Node.js 环境中存在此属性
    if (Error.captureStackTrace) {
      // @ts-ignore
      Error.captureStackTrace(this, XiHanError);
    }
  }

  /**
   * 获取格式化的错误信息
   */
  format(): string {
    return formatError(this);
  }

  /**
   * 添加额外详情
   * @param details 额外详情
   */
  withDetails(details: Record<string, any>): this {
    this.details = { ...this.details, ...details };
    return this;
  }
}

/**
 * 抛出错误
 * @param message 错误信息
 * @param code 错误代码
 * @param details 错误详情
 */
export const throwError = (message: string, code: ErrorCode = "UNKNOWN", details?: Record<string, any>): never => {
  throw new XiHanError(message, code, details);
};

/**
 * 断言
 * @param condition 条件
 * @param message 错误信息
 * @param code 错误代码
 * @param details 错误详情
 */
export const assert = (
  condition: boolean,
  message: string,
  code: ErrorCode = "ASSERTION",
  details?: Record<string, any>,
): void => {
  if (!condition) {
    throwError(message, code, details);
  }
};

/**
 * 类型断言
 * @param value 要检查的值
 * @param type 期望的类型
 * @param message 自定义错误信息
 */
export const assertType = (value: any, type: string, message?: string): void => {
  const actualType = typeof value;
  if (actualType !== type) {
    throwError(message || `期望类型为 ${type}，实际为 ${actualType}`, "TYPE_ERROR", {
      expectedType: type,
      actualType,
      value,
    });
  }
};

/**
 * 必须值断言
 * @param value 要检查的值
 * @param message 自定义错误信息
 */
export const assertRequired = (value: any, message?: string): void => {
  if (value === undefined || value === null) {
    throwError(message || "值不能为空", "ASSERTION", { value });
  }
};

/**
 * 捕获并处理错误
 * @param fn 要执行的函数
 * @param errorHandler 错误处理函数
 * @returns 函数执行结果或错误处理结果
 */
export const tryCatch = <T>(fn: () => T, errorHandler?: (err: Error) => T): T => {
  try {
    return fn();
  } catch (err) {
    if (errorHandler) {
      return errorHandler(err instanceof Error ? err : new Error(String(err)));
    }
    throw err;
  }
};

/**
 * 异步捕获并处理错误
 * @param fn 要执行的异步函数
 * @param errorHandler 错误处理函数
 * @returns Promise
 */
export const tryCatchAsync = async <T>(
  fn: () => Promise<T>,
  errorHandler?: (err: Error) => Promise<T> | T,
): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
    if (errorHandler) {
      return errorHandler(err instanceof Error ? err : new Error(String(err)));
    }
    throw err;
  }
};

/**
 * 格式化错误信息
 * @param err 错误对象
 * @returns 格式化后的错误信息
 */
export const formatError = (err: any): string => {
  if (err instanceof XiHanError) {
    return `[${err.code}] ${err.message}${err.details ? ` - 详情: ${JSON.stringify(err.details)}` : ""}`;
  }
  return err instanceof Error ? err.message : String(err);
};

/**
 * 创建带上下文的错误信息
 * @param context 上下文名称
 * @param message 错误信息
 * @returns 带上下文的错误信息
 */
export const contextError = (context: string, message: string): string => {
  return `[${context}] ${message}`;
};
