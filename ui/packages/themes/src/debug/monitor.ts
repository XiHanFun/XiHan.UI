/**
 * 性能监控系统
 */

import type { PerformanceMetrics, DebugEvent } from "../foundation/types";
import { BaseEventEmitter } from "../foundation/events";

// =============================================
// 事件类型定义
// =============================================

interface PerformanceEventMap {
  "monitor:enabled": undefined;
  "monitor:disabled": undefined;
  "measure:start": { name: string };
  "measure:end": PerformanceMetrics;
  "metrics:cleared": { name?: string };
  "performance:measure": { name: string; duration: number; startTime: number };
  "performance:navigation": PerformanceEntry;
  "performance:paint": { name: string; startTime: number };
}

interface DebugEventMap {
  "debug:enabled": { level: string };
  "debug:disabled": undefined;
  "debug:log": { level: string; message: string; data?: any; timestamp: string };
}

// =============================================
// 性能监控器
// =============================================

export class PerformanceMonitor extends BaseEventEmitter<PerformanceEventMap> {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean = false;

  constructor() {
    super();
    this.setupObservers();
  }

  /**
   * 启用监控
   */
  enable(): void {
    if (this.isEnabled) return;

    this.isEnabled = true;
    this.observers.forEach(observer => {
      try {
        observer.observe({ entryTypes: ["measure", "navigation", "paint", "largest-contentful-paint"] });
      } catch (error) {
        console.warn("Performance observer not supported:", error);
      }
    });

    this.emit("monitor:enabled", undefined);
  }

  /**
   * 禁用监控
   */
  disable(): void {
    if (!this.isEnabled) return;

    this.isEnabled = false;
    this.observers.forEach(observer => observer.disconnect());
    this.emit("monitor:disabled", undefined);
  }

  /**
   * 开始性能测量
   */
  startMeasure(name: string): void {
    if (!this.isEnabled) return;

    performance.mark(`${name}-start`);
    this.emit("measure:start", { name });
  }

  /**
   * 结束性能测量
   */
  endMeasure(name: string): PerformanceMetrics | null {
    if (!this.isEnabled) return null;

    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);

      const entries = performance.getEntriesByName(name, "measure");
      const entry = entries[entries.length - 1];

      if (entry) {
        const metrics: PerformanceMetrics = {
          name,
          duration: entry.duration,
          startTime: entry.startTime,
          endTime: entry.startTime + entry.duration,
          timestamp: Date.now(),
        };

        this.metrics.set(name, metrics);
        this.emit("measure:end", metrics);
        return metrics;
      }
    } catch (error) {
      console.warn("Performance measure failed:", error);
    }

    return null;
  }

  /**
   * 获取性能指标
   */
  getMetrics(name?: string): PerformanceMetrics | PerformanceMetrics[] | null {
    if (name) {
      return this.metrics.get(name) || null;
    }
    return Array.from(this.metrics.values());
  }

  /**
   * 清除性能指标
   */
  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name);
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
    } else {
      this.metrics.clear();
      performance.clearMarks();
      performance.clearMeasures();
    }

    this.emit("metrics:cleared", { name });
  }

  /**
   * 获取页面性能信息
   */
  getPagePerformance(): Record<string, number> {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType("paint");

    const metrics: Record<string, number> = {};

    if (navigation) {
      metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      metrics.loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
      metrics.firstByte = navigation.responseStart - navigation.requestStart;
      metrics.domInteractive = navigation.domInteractive - navigation.fetchStart;
    }

    paint.forEach(entry => {
      if (entry.name === "first-paint") {
        metrics.firstPaint = entry.startTime;
      } else if (entry.name === "first-contentful-paint") {
        metrics.firstContentfulPaint = entry.startTime;
      }
    });

    return metrics;
  }

  /**
   * 监控内存使用
   */
  getMemoryUsage(): Record<string, number> | null {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  /**
   * 设置性能观察器
   */
  private setupObservers(): void {
    if (typeof PerformanceObserver === "undefined") return;

    // 测量观察器
    const measureObserver = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === "measure") {
          this.emit("performance:measure", {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      });
    });

    // 导航观察器
    const navigationObserver = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        this.emit("performance:navigation", entry);
      });
    });

    // 绘制观察器
    const paintObserver = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        this.emit("performance:paint", {
          name: entry.name,
          startTime: entry.startTime,
        });
      });
    });

    this.observers.push(measureObserver, navigationObserver, paintObserver);
  }
}

// =============================================
// 调试管理器
// =============================================

export class DebugManager extends BaseEventEmitter<DebugEventMap> {
  private performanceMonitor: PerformanceMonitor;
  private isDebugMode: boolean = false;
  private debugLevel: "error" | "warn" | "info" | "debug" = "warn";

  constructor() {
    super();
    this.performanceMonitor = new PerformanceMonitor();
    this.setupDebugMode();
  }

  /**
   * 启用调试模式
   */
  enableDebug(level: "error" | "warn" | "info" | "debug" = "debug"): void {
    this.isDebugMode = true;
    this.debugLevel = level;
    this.performanceMonitor.enable();
    this.emit("debug:enabled", { level });
  }

  /**
   * 禁用调试模式
   */
  disableDebug(): void {
    this.isDebugMode = false;
    this.performanceMonitor.disable();
    this.emit("debug:disabled", undefined);
  }

  /**
   * 记录调试信息
   */
  log(level: "error" | "warn" | "info" | "debug", message: string, data?: any): void {
    if (!this.isDebugMode) return;

    const levels = ["error", "warn", "info", "debug"];
    const currentLevelIndex = levels.indexOf(this.debugLevel);
    const messageLevelIndex = levels.indexOf(level);

    if (messageLevelIndex <= currentLevelIndex) {
      const timestamp = new Date().toISOString();
      const logData = {
        level,
        message,
        data,
        timestamp,
      };

      console[level](`[XiHan UI Debug] ${timestamp} [${level.toUpperCase()}] ${message}`, data);
      this.emit("debug:log", logData);
    }
  }

  /**
   * 错误日志
   */
  error(message: string, data?: any): void {
    this.log("error", message, data);
  }

  /**
   * 警告日志
   */
  warn(message: string, data?: any): void {
    this.log("warn", message, data);
  }

  /**
   * 信息日志
   */
  info(message: string, data?: any): void {
    this.log("info", message, data);
  }

  /**
   * 调试日志
   */
  debug(message: string, data?: any): void {
    this.log("debug", message, data);
  }

  /**
   * 获取性能监控器
   */
  getPerformanceMonitor(): PerformanceMonitor {
    return this.performanceMonitor;
  }

  /**
   * 性能测量装饰器
   */
  measurePerformance<T extends (...args: any[]) => any>(target: T, name?: string): T {
    const measureName = name || target.name || "anonymous";

    return ((...args: any[]) => {
      this.performanceMonitor.startMeasure(measureName);

      try {
        const result = target.apply(this, args);

        if (result instanceof Promise) {
          return result.finally(() => {
            this.performanceMonitor.endMeasure(measureName);
          });
        } else {
          this.performanceMonitor.endMeasure(measureName);
          return result;
        }
      } catch (error) {
        this.performanceMonitor.endMeasure(measureName);
        this.error(`Error in ${measureName}:`, error);
        throw error;
      }
    }) as T;
  }

  /**
   * 检查调试模式
   */
  get isEnabled(): boolean {
    return this.isDebugMode;
  }

  /**
   * 获取调试级别
   */
  get level(): string {
    return this.debugLevel;
  }

  /**
   * 设置调试模式
   */
  private setupDebugMode(): void {
    // 检查 URL 参数
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("debug") === "true") {
        this.enableDebug();
      }
    }

    // 检查环境变量
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
      this.enableDebug("debug");
    }
  }
}

// =============================================
// 全局调试实例
// =============================================

export const debugManager = new DebugManager();

// 开发环境下自动启用
if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
  debugManager.enableDebug();
}

// 导出便捷函数
export const debug = {
  enable: (level?: "error" | "warn" | "info" | "debug") => debugManager.enableDebug(level),
  disable: () => debugManager.disableDebug(),
  log: (level: "error" | "warn" | "info" | "debug", message: string, data?: any) =>
    debugManager.log(level, message, data),
  error: (message: string, data?: any) => debugManager.error(message, data),
  warn: (message: string, data?: any) => debugManager.warn(message, data),
  info: (message: string, data?: any) => debugManager.info(message, data),
  debug: (message: string, data?: any) => debugManager.debug(message, data),
  measure: <T extends (...args: any[]) => any>(target: T, name?: string) =>
    debugManager.measurePerformance(target, name),
  performance: debugManager.getPerformanceMonitor(),
};
