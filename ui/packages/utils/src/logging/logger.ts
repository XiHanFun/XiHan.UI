/**
 * 日志级别
 * @param debug 调试日志级别
 * @param info 信息日志级别
 * @param warn 警告日志级别
 * @param error 错误日志级别
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * 日志配置
 * @param level 日志级别
 * @param prefix 日志前缀
 * @param showTime 是否显示时间
 * @param showLevel 是否显示日志级别
 * @param disabled 是否禁用日志
 */
export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  showTime?: boolean;
  showLevel?: boolean;
  disabled?: boolean;
}

/**
 * 日志样式
 * @param debug 调试日志样式
 * @param info 信息日志样式
 * @param warn 警告日志样式
 * @param error 错误日志样式
 * @param time 计时日志样式
 * @param prefix 日志前缀样式
 */
const logStyles = {
  debug: "color: #8a8a8a",
  info: "color: #2196f3",
  warn: "color: #ff9800",
  error: "color: #f44336",
  time: "color: #9e9e9e",
  prefix: "color: #673ab7",
} as const;

export type LogStyles = typeof logStyles;

/**
 * 日志级别权重
 * @param debug 调试日志级别权重
 * @param info 信息日志级别权重
 * @param warn 警告日志级别权重
 * @param error 错误日志级别权重
 */
const levelWeight = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

export type LogLevelWeight = typeof levelWeight;

/**
 * 创建日志记录器
 * @param options 日志配置
 * @returns 日志记录器
 */
export const createLogger = (options: LoggerOptions = {}) => {
  const { level = "info", prefix = "", showTime = true, showLevel = true, disabled = false } = options;

  /**
   * 检查是否应该记录该级别的日志
   * @param msgLevel 日志级别
   * @returns 是否应该记录该级别的日志
   */
  const shouldLog = (msgLevel: LogLevel): boolean => {
    if (disabled) return false;
    return levelWeight[msgLevel] >= levelWeight[level];
  };

  /**
   * 获取当前时间字符串
   * @returns 当前时间字符串
   */
  const getTimeString = (): string => {
    return new Date().toLocaleTimeString();
  };

  /**
   * 构建日志前缀
   * @param msgLevel 日志级别
   * @returns 日志前缀
   */
  const buildPrefix = (msgLevel: LogLevel): [string, string[]] => {
    const parts: string[] = [];
    const styles: string[] = [];

    if (showTime) {
      parts.push(`[${getTimeString()}]`);
      styles.push(logStyles.time);
    }

    if (prefix) {
      parts.push(`[${prefix}]`);
      styles.push(logStyles.prefix);
    }

    if (showLevel) {
      parts.push(`[${msgLevel.toUpperCase()}]`);
      styles.push(logStyles[msgLevel]);
    }

    return [parts.join(" "), styles];
  };

  return {
    /**
     * 调试日志
     * @param args 日志参数
     */
    debug(...args: any[]) {
      if (!shouldLog("debug")) return;
      const [prefix, styles] = buildPrefix("debug");
      console.debug(`%c${prefix}`, styles.join(";"), ...args);
    },

    /**
     * 信息日志
     * @param args 日志参数
     */
    info(...args: any[]) {
      if (!shouldLog("info")) return;
      const [prefix, styles] = buildPrefix("info");
      console.info(`%c${prefix}`, styles.join(";"), ...args);
    },

    /**
     * 警告日志
     * @param args 日志参数
     */
    warn(...args: any[]) {
      if (!shouldLog("warn")) return;
      const [prefix, styles] = buildPrefix("warn");
      console.warn(`%c${prefix}`, styles.join(";"), ...args);
    },

    /**
     * 错误日志
     * @param args 日志参数
     */
    error(...args: any[]) {
      if (!shouldLog("error")) return;
      const [prefix, styles] = buildPrefix("error");
      console.error(`%c${prefix}`, styles.join(";"), ...args);
    },

    /**
     * 分组日志
     * @param label 日志标签
     * @param collapsed 是否折叠
     */
    group(label: string, collapsed = false) {
      if (disabled) return;
      collapsed ? console.groupCollapsed(label) : console.group(label);
    },

    /**
     * 结束分组日志
     */
    groupEnd() {
      if (disabled) return;
      console.groupEnd();
    },

    /**
     * 计时日志
     * @param label 日志标签
     */
    time(label: string) {
      if (disabled) return;
      console.time(label);
    },

    /**
     * 结束计时日志
     * @param label 日志标签
     */
    timeEnd(label: string) {
      if (disabled) return;
      console.timeEnd(label);
    },

    /**
     * 清空控制台
     */
    clear() {
      if (disabled) return;
      console.clear();
    },
  };
};
