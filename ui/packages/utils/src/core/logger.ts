/**
 * 日志级别
 * @param debug 调试日志级别
 * @param info 信息日志级别
 * @param warn 警告日志级别
 * @param success 成功日志级别
 * @param error 错误日志级别
 */
export type LogLevel = "debug" | "info" | "warn" | "success" | "error";

/**
 * 日志条目接口
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any[];
  timestamp: Date;
  namespace: string;
}

/**
 * 日志配置
 * @param level 日志级别
 * @param prefix 日志前缀
 * @param showTime 是否显示时间
 * @param showLevel 是否显示日志级别
 * @param disabled 是否禁用日志
 * @param enableStorage 是否启用日志存储
 * @param maxLogs 最大日志存储数量
 */
export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  showTime?: boolean;
  showLevel?: boolean;
  disabled?: boolean;
  enableStorage?: boolean;
  maxLogs?: number;
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
  success: "color: #4caf50",
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
 * @param success 成功日志级别权重
 * @param error 错误日志级别权重
 */
const levelWeight = {
  debug: 0,
  info: 1,
  warn: 2,
  success: 3,
  error: 4,
} as const;

export type LogLevelWeight = typeof levelWeight;

/**
 * 创建日志记录器
 * @param options 日志配置
 * @returns 日志记录器
 */
export function createLogger(options: LoggerOptions = {}) {
  const {
    level = "info",
    prefix = "",
    showTime = true,
    showLevel = true,
    disabled = false,
    enableStorage = false,
    maxLogs = 1000,
  } = options;

  // 日志存储
  const logs: LogEntry[] = [];

  /**
   * 添加日志到存储
   */
  const addLogEntry = (logLevel: LogLevel, message: string, data?: any[]): void => {
    if (!enableStorage) return;

    const entry: LogEntry = {
      level: logLevel,
      message,
      data,
      timestamp: new Date(),
      namespace: prefix,
    };

    logs.push(entry);

    // 限制日志数量
    if (logs.length > maxLogs) {
      logs.splice(0, logs.length - maxLogs);
    }
  };

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
      const [prefixText, styles] = buildPrefix("debug");
      console.debug(`%c${prefixText}`, styles.join(";"), ...args);
      addLogEntry("debug", args.length > 0 ? String(args[0]) : "", args.slice(1));
    },

    /**
     * 信息日志
     * @param args 日志参数
     */
    info(...args: any[]) {
      if (!shouldLog("info")) return;
      const [prefixText, styles] = buildPrefix("info");
      console.info(`%c${prefixText}`, styles.join(";"), ...args);
      addLogEntry("info", args.length > 0 ? String(args[0]) : "", args.slice(1));
    },

    /**
     * 警告日志
     * @param args 日志参数
     */
    warn(...args: any[]) {
      if (!shouldLog("warn")) return;
      const [prefixText, styles] = buildPrefix("warn");
      console.warn(`%c${prefixText}`, styles.join(";"), ...args);
      addLogEntry("warn", args.length > 0 ? String(args[0]) : "", args.slice(1));
    },

    /**
     * 成功日志
     * @param args 日志参数
     */
    success(...args: any[]) {
      if (!shouldLog("success")) return;
      const [prefixText, styles] = buildPrefix("success");
      console.log(`%c${prefixText}`, styles.join(";"), ...args);
      addLogEntry("success", args.length > 0 ? String(args[0]) : "", args.slice(1));
    },

    /**
     * 错误日志
     * @param args 日志参数
     */
    error(...args: any[]) {
      if (!shouldLog("error")) return;
      const [prefixText, styles] = buildPrefix("error");
      console.error(`%c${prefixText}`, styles.join(";"), ...args);
      addLogEntry("error", args.length > 0 ? String(args[0]) : "", args.slice(1));
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
     * 表格日志
     * @param data 表格数据 数组或对象
     */
    table(data: any[] | object) {
      if (disabled) return;
      console.table(data);
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

    /**
     * 获取日志列表
     * @param filterLevel 可选的日志级别过滤
     * @returns 日志条目列表
     */
    getLogs(filterLevel?: LogLevel): LogEntry[] {
      if (!enableStorage) {
        console.warn("日志存储未启用，无法获取日志列表");
        return [];
      }

      if (filterLevel) {
        return logs.filter(log => log.level === filterLevel);
      }

      return [...logs];
    },

    /**
     * 清除存储的日志
     */
    clearLogs() {
      logs.length = 0;
    },

    /**
     * 导出日志为 JSON 字符串
     * @returns JSON 格式的日志字符串
     */
    exportLogs(): string {
      if (!enableStorage) {
        console.warn("日志存储未启用，无法导出日志");
        return "[]";
      }

      return JSON.stringify(logs, null, 2);
    },

    /**
     * 获取日志统计信息
     * @returns 日志统计信息
     */
    getLogStats() {
      if (!enableStorage) {
        return {
          total: 0,
          debug: 0,
          info: 0,
          warn: 0,
          success: 0,
          error: 0,
        };
      }

      const stats = {
        total: logs.length,
        debug: 0,
        info: 0,
        warn: 0,
        success: 0,
        error: 0,
      };

      logs.forEach(log => {
        stats[log.level]++;
      });

      return stats;
    },

    /**
     * 设置最大日志存储数量
     * @param max 最大数量
     */
    setMaxLogs(max: number) {
      if (max > 0 && logs.length > max) {
        logs.splice(0, logs.length - max);
      }
    },

    /**
     * 检查是否启用了日志存储
     */
    get storageEnabled(): boolean {
      return enableStorage;
    },

    /**
     * 获取当前配置
     */
    get config(): LoggerOptions {
      return {
        level,
        prefix,
        showTime,
        showLevel,
        disabled,
        enableStorage,
        maxLogs,
      };
    },
  };
}
