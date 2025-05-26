/**
 * 样式监控器
 * 提供实时性能监控、变化追踪、内存使用监控等功能
 */

import { find } from "@xihan-ui/utils/dom";
import type { PerformanceReport, MemoryUsage, StyleSnapshot, DebugConfig } from "./types";
import type { StyleObject } from "../css-in-js/types";

/**
 * 监控事件类型
 */
export interface MonitorEvent {
  type: "style-injected" | "style-removed" | "performance-warning" | "memory-warning";
  timestamp: number;
  data: any;
}

/**
 * 监控配置
 */
export interface MonitorConfig extends DebugConfig {
  performanceThreshold: number;
  memoryThreshold: number;
  sampleInterval: number;
  maxSnapshots: number;
}

/**
 * 样式监控器类
 */
export class StyleMonitor {
  private config: MonitorConfig;
  private isMonitoring = false;
  private snapshots: StyleSnapshot[] = [];
  private performanceData: PerformanceEntry[] = [];
  private memoryData: MemoryUsage[] = [];
  private listeners: Map<string, ((event: MonitorEvent) => void)[]> = new Map();
  private intervalId?: number;
  private observer?: MutationObserver;

  constructor(config: Partial<MonitorConfig> = {}) {
    this.config = {
      enabled: true,
      logLevel: "info",
      showPerformance: true,
      showConflicts: true,
      showUnused: true,
      autoAnalyze: false,
      performanceThreshold: 100, // ms
      memoryThreshold: 50 * 1024 * 1024, // 50MB
      sampleInterval: 5000, // 5s
      maxSnapshots: 100,
      ...config,
    };
  }

  /**
   * 开始监控
   */
  start(): void {
    if (this.isMonitoring || !this.config.enabled) return;

    this.isMonitoring = true;
    this.setupPerformanceMonitoring();
    this.setupMemoryMonitoring();
    this.setupDOMObserver();
    this.startSampling();

    this.log("info", "Style monitoring started");
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    this.stopSampling();
    this.teardownDOMObserver();

    this.log("info", "Style monitoring stopped");
  }

  /**
   * 添加事件监听器
   */
  on(eventType: MonitorEvent["type"], callback: (event: MonitorEvent) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  /**
   * 移除事件监听器
   */
  off(eventType: MonitorEvent["type"], callback: (event: MonitorEvent) => void): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 获取实时性能报告
   */
  getRealtimePerformance(): PerformanceReport {
    const now = performance.now();
    const recentEntries = this.performanceData.filter(
      entry => now - entry.startTime < 60000, // 最近1分钟
    );

    const totalStyles = this.getTotalStylesCount();
    const averageCompilation = this.calculateAverageTime(recentEntries, "compilation");
    const averageInjection = this.calculateAverageTime(recentEntries, "injection");
    const memoryUsage = this.getCurrentMemoryUsage();

    return {
      totalStyles,
      compilationTime: averageCompilation,
      injectionTime: averageInjection,
      cacheHitRate: this.calculateCacheHitRate(),
      memoryUsage,
      renderTime: 0,
      recommendations: this.generatePerformanceRecommendations({
        totalStyles,
        compilationTime: averageCompilation,
        injectionTime: averageInjection,
        memoryUsage,
      }),
    };
  }

  /**
   * 获取内存使用趋势
   */
  getMemoryTrend(): MemoryUsage[] {
    return [...this.memoryData];
  }

  /**
   * 获取性能趋势
   */
  getPerformanceTrend(): PerformanceEntry[] {
    return [...this.performanceData];
  }

  /**
   * 创建性能快照
   */
  createSnapshot(): StyleSnapshot {
    const timestamp = Date.now();
    const styles = this.collectCurrentStyles();
    const performance = this.getRealtimePerformance();
    const conflicts: any[] = []; // 简化实现

    const snapshot: StyleSnapshot = {
      timestamp,
      styles,
      performance,
      conflicts,
    };

    this.snapshots.push(snapshot);

    // 限制快照数量
    if (this.snapshots.length > this.config.maxSnapshots) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  /**
   * 获取所有快照
   */
  getSnapshots(): StyleSnapshot[] {
    return [...this.snapshots];
  }

  /**
   * 清除监控数据
   */
  clearData(): void {
    this.snapshots = [];
    this.performanceData = [];
    this.memoryData = [];
  }

  /**
   * 记录样式注入事件
   */
  recordStyleInjection(styleId: string, styles: StyleObject, duration: number): void {
    if (!this.isMonitoring) return;

    // 记录性能数据
    this.performanceData.push({
      name: "style-injection",
      entryType: "measure",
      startTime: performance.now() - duration,
      duration,
      detail: { styleId, propertyCount: Object.keys(styles).length },
    } as any);

    // 检查性能阈值
    if (duration > this.config.performanceThreshold) {
      this.emit({
        type: "performance-warning",
        timestamp: Date.now(),
        data: {
          operation: "style-injection",
          duration,
          threshold: this.config.performanceThreshold,
          styleId,
        },
      });
    }

    // 发送样式注入事件
    this.emit({
      type: "style-injected",
      timestamp: Date.now(),
      data: { styleId, styles, duration },
    });
  }

  /**
   * 记录样式移除事件
   */
  recordStyleRemoval(styleId: string): void {
    if (!this.isMonitoring) return;

    this.emit({
      type: "style-removed",
      timestamp: Date.now(),
      data: { styleId },
    });
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<MonitorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 私有方法

  private setupPerformanceMonitoring(): void {
    // 监听 Performance API
    if ("PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          this.performanceData.push(...entries);

          // 限制数据量
          if (this.performanceData.length > 1000) {
            this.performanceData = this.performanceData.slice(-500);
          }
        });

        observer.observe({ entryTypes: ["measure", "navigation", "paint"] });
      } catch (e) {
        this.log("warn", "Performance monitoring not available");
      }
    }
  }

  private setupMemoryMonitoring(): void {
    // 定期收集内存使用情况
    const collectMemory = () => {
      if (!this.isMonitoring) return;

      const memoryUsage = this.getCurrentMemoryUsage();
      this.memoryData.push(memoryUsage);

      // 限制数据量
      if (this.memoryData.length > 200) {
        this.memoryData = this.memoryData.slice(-100);
      }

      // 检查内存阈值
      if (memoryUsage.totalSize > this.config.memoryThreshold) {
        this.emit({
          type: "memory-warning",
          timestamp: Date.now(),
          data: {
            currentUsage: memoryUsage.totalSize,
            threshold: this.config.memoryThreshold,
            breakdown: memoryUsage.breakdown,
          },
        });
      }
    };

    // 立即收集一次
    collectMemory();

    // 设置定期收集
    this.intervalId = window.setInterval(collectMemory, this.config.sampleInterval);
  }

  private setupDOMObserver(): void {
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === "STYLE" && element.hasAttribute("data-xihan-ui")) {
                this.log("debug", "Style element added", element);
              }
            }
          });

          mutation.removedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === "STYLE" && element.hasAttribute("data-xihan-ui")) {
                this.log("debug", "Style element removed", element);
              }
            }
          });
        }
      });
    });

    this.observer.observe(document.head, {
      childList: true,
      subtree: true,
    });
  }

  private teardownDOMObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  private startSampling(): void {
    // 定期创建快照
    const createSnapshot = () => {
      if (!this.isMonitoring) return;
      this.createSnapshot();
    };

    // 每30秒创建一次快照
    this.intervalId = window.setInterval(createSnapshot, 30000);
  }

  private stopSampling(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private emit(event: MonitorEvent): void {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (e) {
          this.log("error", "Error in monitor event callback", e);
        }
      });
    }
  }

  private getTotalStylesCount(): number {
    let count = 0;
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        count += sheet.cssRules?.length || 0;
      } catch (e) {
        // 忽略跨域样式表
      }
    });

    // 添加注入的样式
    const injectedStyles = find.all('style[data-xihan-ui="true"]');
    count += injectedStyles.length;

    return count;
  }

  private calculateAverageTime(entries: PerformanceEntry[], operation: string): number {
    const relevantEntries = entries.filter(
      entry => entry.name.includes(operation) || (entry as any).detail?.operation === operation,
    );

    if (relevantEntries.length === 0) return 0;

    const total = relevantEntries.reduce((sum, entry) => sum + entry.duration, 0);
    return total / relevantEntries.length;
  }

  private calculateCacheHitRate(): number {
    // 这里应该从缓存系统获取实际数据
    // 暂时返回模拟数据
    return 0.85;
  }

  private getCurrentMemoryUsage(): MemoryUsage {
    const styleElements = find.all('style[data-xihan-ui="true"]');
    const totalSize = styleElements.reduce((size, el) => {
      return size + (el.textContent?.length || 0);
    }, 0);

    const domNodes = document.querySelectorAll("*").length;
    const cacheSize = 0; // 从缓存系统获取

    return {
      totalSize,
      cacheSize,
      injectedStyles: styleElements.length,
      domNodes,
      breakdown: {
        cache: cacheSize,
        dom: totalSize,
        listeners: this.listeners.size * 100, // 估算
        other: 0,
      },
    };
  }

  private collectCurrentStyles(): Record<string, StyleObject> {
    const styles: Record<string, StyleObject> = {};

    // 收集注入的样式
    const styleElements = find.all('style[data-xihan-ui="true"]');
    styleElements.forEach((el, index) => {
      const id = el.getAttribute("data-style-id") || `style-${index}`;
      styles[id] = {
        content: el.textContent || "",
        timestamp: Date.now(),
      } as any;
    });

    return styles;
  }

  private generatePerformanceRecommendations(data: any): string[] {
    const recommendations: string[] = [];

    if (data.compilationTime > 50) {
      recommendations.push("样式编译时间过长，考虑优化样式结构或启用缓存");
    }

    if (data.injectionTime > 20) {
      recommendations.push("样式注入时间过长，考虑批量注入或延迟加载");
    }

    if (data.memoryUsage.totalSize > 10 * 1024 * 1024) {
      // 10MB
      recommendations.push("样式内存使用过高，考虑清理未使用的样式");
    }

    if (data.totalStyles > 500) {
      recommendations.push("样式规则数量过多，考虑代码分割或按需加载");
    }

    return recommendations;
  }

  private log(level: string, message: string, data?: any): void {
    if (!this.config.enabled) return;

    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    const currentLevel = levels[this.config.logLevel as keyof typeof levels];
    const messageLevel = levels[level as keyof typeof levels];

    if (messageLevel <= currentLevel) {
      const logMethod = console[level as "error" | "warn" | "info" | "debug"] || console.log;
      if (typeof logMethod === "function") {
        logMethod(`[StyleMonitor] ${message}`, data);
      }
    }
  }
}

/**
 * 创建样式监控器实例
 */
export function createStyleMonitor(config?: Partial<MonitorConfig>): StyleMonitor {
  return new StyleMonitor(config);
}
