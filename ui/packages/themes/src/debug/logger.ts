/**
 * 日志系统
 * 提供结构化的日志记录功能
 */

// =============================================
// 日志级别
// =============================================

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// =============================================
// 日志记录器
// =============================================

export class Logger {
  private level: LogLevel = LogLevel.WARN;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private namespace: string;

  constructor(namespace: string = "XiHan UI") {
    this.namespace = namespace;
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 设置最大日志数量
   */
  setMaxLogs(max: number): void {
    this.maxLogs = max;
    this.trimLogs();
  }

  /**
   * 记录错误日志
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * 记录警告日志
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * 记录信息日志
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * 记录调试日志
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * 记录日志
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (level > this.level) return;

    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      namespace: this.namespace,
    };

    this.logs.push(entry);
    this.trimLogs();

    // 输出到控制台
    this.outputToConsole(entry);
  }

  /**
   * 输出到控制台
   */
  private outputToConsole(entry: LogEntry): void {
    const levelNames = ["ERROR", "WARN", "INFO", "DEBUG"];
    const levelName = levelNames[entry.level];
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${entry.namespace}] ${timestamp} [${levelName}]`;

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.data);
        break;
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.data);
        break;
    }
  }

  /**
   * 修剪日志数量
   */
  private trimLogs(): void {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * 获取日志
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * 清除日志
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * 导出日志
   */
  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * 创建子日志记录器
   */
  child(namespace: string): Logger {
    const childLogger = new Logger(`${this.namespace}:${namespace}`);
    childLogger.setLevel(this.level);
    childLogger.setMaxLogs(this.maxLogs);
    return childLogger;
  }
}

// =============================================
// 类型定义
// =============================================

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  namespace: string;
}

// =============================================
// 全局日志实例
// =============================================

export const logger = new Logger();

// 开发环境下设置为调试级别
if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
  logger.setLevel(LogLevel.DEBUG);
}
