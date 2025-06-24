/**
 * 主题系统日志
 * 基于 utils 包的日志系统，提供主题相关的日志功能
 */

import { createLogger } from "@xihan-ui/utils";
import type { LogLevel, LogEntry } from "@xihan-ui/utils";

// 直接导出 utils 的类型，保持兼容性
export type { LogLevel, LogEntry };

// =============================================
// 主题日志记录器
// =============================================

/**
 * 主题系统日志记录器类
 * 直接使用 utils 的 createLogger
 */
export class Logger {
  private utilsLogger: ReturnType<typeof createLogger>;
  private currentLevel: LogLevel = "warn";
  private namespace: string;

  constructor(namespace: string = "XiHan UI") {
    this.namespace = namespace;
    this.utilsLogger = createLogger({
      level: this.currentLevel,
      prefix: namespace,
      showTime: true,
      showLevel: true,
      disabled: false,
      enableStorage: true, // 启用日志存储
      maxLogs: 1000,
    });
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
    // 重新创建 logger 实例以应用新的级别
    this.utilsLogger = createLogger({
      level: level,
      prefix: this.namespace,
      showTime: true,
      showLevel: true,
      disabled: false,
      enableStorage: true, // 启用日志存储
      maxLogs: 1000,
    });
  }

  /**
   * 设置最大日志数量
   */
  setMaxLogs(max: number): void {
    this.utilsLogger.setMaxLogs(max);
  }

  /**
   * 记录错误日志
   */
  error(message: string, data?: any): void {
    if (data !== undefined) {
      this.utilsLogger.error(message, data);
    } else {
      this.utilsLogger.error(message);
    }
  }

  /**
   * 记录警告日志
   */
  warn(message: string, data?: any): void {
    if (data !== undefined) {
      this.utilsLogger.warn(message, data);
    } else {
      this.utilsLogger.warn(message);
    }
  }

  /**
   * 记录信息日志
   */
  info(message: string, data?: any): void {
    if (data !== undefined) {
      this.utilsLogger.info(message, data);
    } else {
      this.utilsLogger.info(message);
    }
  }

  /**
   * 记录调试日志
   */
  debug(message: string, data?: any): void {
    if (data !== undefined) {
      this.utilsLogger.debug(message, data);
    } else {
      this.utilsLogger.debug(message);
    }
  }

  /**
   * 记录成功日志
   */
  success(message: string, data?: any): void {
    if (data !== undefined) {
      this.utilsLogger.success(message, data);
    } else {
      this.utilsLogger.success(message);
    }
  }

  /**
   * 获取日志
   */
  getLogs(level?: LogLevel): LogEntry[] {
    return this.utilsLogger.getLogs(level);
  }

  /**
   * 清除日志
   */
  clear(): void {
    this.utilsLogger.clear();
    this.utilsLogger.clearLogs();
  }

  /**
   * 导出日志
   */
  export(): string {
    return this.utilsLogger.exportLogs();
  }

  /**
   * 创建子日志记录器
   */
  child(namespace: string): Logger {
    const childLogger = new Logger(`${this.namespace}:${namespace}`);
    childLogger.setLevel(this.currentLevel);
    return childLogger;
  }

  /**
   * 分组日志
   */
  group(label: string, collapsed = false): void {
    this.utilsLogger.group(label, collapsed);
  }

  /**
   * 结束分组日志
   */
  groupEnd(): void {
    this.utilsLogger.groupEnd();
  }

  /**
   * 表格日志
   */
  table(data: any[] | object): void {
    this.utilsLogger.table(data);
  }

  /**
   * 计时日志
   */
  time(label: string): void {
    this.utilsLogger.time(label);
  }

  /**
   * 结束计时日志
   */
  timeEnd(label: string): void {
    this.utilsLogger.timeEnd(label);
  }
}

// =============================================
// 全局日志实例
// =============================================

export const logger = new Logger();

// 开发环境下设置为调试级别
if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
  logger.setLevel("debug");
}
