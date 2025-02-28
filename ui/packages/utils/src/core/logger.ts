/**
 * 日志工具集
 */

// 日志级别
export type LogLevel = "debug" | "info" | "warn" | "error";

// 日志配置
export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  showTime?: boolean;
  showLevel?: boolean;
  disabled?: boolean;
}

// 日志样式
const logStyles = {
  debug: "color: #8a8a8a",
  info: "color: #2196f3",
  warn: "color: #ff9800",
  error: "color: #f44336",
  time: "color: #9e9e9e",
  prefix: "color: #673ab7",
} as const;

/**
 * 创建日志记录器
 */
export const createLogger = (options: LoggerOptions = {}) => {
  const { level = "info", prefix = "", showTime = true, showLevel = true, disabled = false } = options;

  // 日志级别权重
  const levelWeight = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  // 检查是否应该记录该级别的日志
  const shouldLog = (msgLevel: LogLevel): boolean => {
    if (disabled) return false;
    return levelWeight[msgLevel] >= levelWeight[level];
  };

  // 获取当前时间字符串
  const getTimeString = (): string => {
    return new Date().toLocaleTimeString();
  };

  // 构建日志前缀
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
    debug(...args: any[]) {
      if (!shouldLog("debug")) return;
      const [prefix, styles] = buildPrefix("debug");
      console.debug(`%c${prefix}`, styles.join(";"), ...args);
    },

    info(...args: any[]) {
      if (!shouldLog("info")) return;
      const [prefix, styles] = buildPrefix("info");
      console.info(`%c${prefix}`, styles.join(";"), ...args);
    },

    warn(...args: any[]) {
      if (!shouldLog("warn")) return;
      const [prefix, styles] = buildPrefix("warn");
      console.warn(`%c${prefix}`, styles.join(";"), ...args);
    },

    error(...args: any[]) {
      if (!shouldLog("error")) return;
      const [prefix, styles] = buildPrefix("error");
      console.error(`%c${prefix}`, styles.join(";"), ...args);
    },

    // 分组日志
    group(label: string, collapsed = false) {
      if (disabled) return;
      collapsed ? console.groupCollapsed(label) : console.group(label);
    },

    groupEnd() {
      if (disabled) return;
      console.groupEnd();
    },

    // 计时日志
    time(label: string) {
      if (disabled) return;
      console.time(label);
    },

    timeEnd(label: string) {
      if (disabled) return;
      console.timeEnd(label);
    },

    // 清空控制台
    clear() {
      if (disabled) return;
      console.clear();
    },
  };
};

// 创建默认日志记录器
export const logger = createLogger();
