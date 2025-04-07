/**
 * 性能指标收集工具
 */

/**
 * Web 性能指标类型
 */
export enum PerformanceMetricType {
  // 核心 Web 指标
  LCP = "LCP", // Largest Contentful Paint
  FID = "FID", // First Input Delay
  CLS = "CLS", // Cumulative Layout Shift

  // 其他重要指标
  TTFB = "TTFB", // Time to First Byte
  FCP = "FCP", // First Contentful Paint
  FP = "FP", // First Paint
  TTI = "TTI", // Time to Interactive
  TBT = "TBT", // Total Blocking Time
  DCL = "DCL", // DOMContentLoaded
  L = "L", // Load

  // 自定义性能标记
  CUSTOM = "CUSTOM",
}

/**
 * 指标收集配置
 */
export interface MetricsCollectionOptions {
  /**
   * 是否自动收集核心指标
   */
  collectCoreWebVitals?: boolean;

  /**
   * 是否自动收集导航指标
   */
  collectNavigationTiming?: boolean;

  /**
   * 性能数据上报 URL
   */
  reportingUrl?: string;

  /**
   * 上报方法 (fetch, beacon, xhr)
   */
  reportingMethod?: "fetch" | "beacon" | "xhr";

  /**
   * 采样率 (0-1)，用于抽样统计
   */
  samplingRate?: number;

  /**
   * 上报前的数据处理函数
   */
  beforeReporting?: (data: PerformanceMetrics) => PerformanceMetrics | false;

  /**
   * 上报成功回调
   */
  onReportingSuccess?: (data: PerformanceMetrics) => void;

  /**
   * 上报失败回调
   */
  onReportingError?: (error: Error, data: PerformanceMetrics) => void;
}

/**
 * 性能指标数据
 */
export interface PerformanceMetric {
  /**
   * 指标名称
   */
  name: string;

  /**
   * 指标值
   */
  value: number;

  /**
   * 指标单位
   */
  unit: "ms" | "s" | "score" | "";

  /**
   * 指标评级 (good, needs-improvement, poor)
   */
  rating?: "good" | "needs-improvement" | "poor";

  /**
   * 指标收集时间
   */
  timestamp: number;

  /**
   * 指标详情
   */
  details?: Record<string, any>;
}

/**
 * 性能指标集合
 */
export interface PerformanceMetrics {
  /**
   * 会话 ID
   */
  sessionId: string;

  /**
   * 页面 URL
   */
  url: string;

  /**
   * 用户代理
   */
  userAgent: string;

  /**
   * 设备类型
   */
  deviceType: "mobile" | "tablet" | "desktop" | "unknown";

  /**
   * 连接类型
   */
  connectionType?: string;

  /**
   * 收集时间 (timestamp)
   */
  timestamp: number;

  /**
   * 性能指标列表
   */
  metrics: PerformanceMetric[];
}

/**
 * 指标评级阈值
 */
const METRIC_THRESHOLDS = {
  [PerformanceMetricType.LCP]: { good: 2500, poor: 4000, unit: "ms" }, // 2.5s / 4s
  [PerformanceMetricType.FID]: { good: 100, poor: 300, unit: "ms" }, // 100ms / 300ms
  [PerformanceMetricType.CLS]: { good: 0.1, poor: 0.25, unit: "score" }, // 0.1 / 0.25
  [PerformanceMetricType.TTFB]: { good: 800, poor: 1800, unit: "ms" }, // 800ms / 1.8s
  [PerformanceMetricType.FCP]: { good: 1800, poor: 3000, unit: "ms" }, // 1.8s / 3s
  [PerformanceMetricType.TTI]: { good: 3800, poor: 7300, unit: "ms" }, // 3.8s / 7.3s
  [PerformanceMetricType.TBT]: { good: 200, poor: 600, unit: "ms" }, // 200ms / 600ms
};

/**
 * 判断是否支持特定的性能 API
 */
export const isPerformanceSupported = {
  /**
   * 是否支持基本的 Performance API
   */
  basic: () => typeof window !== "undefined" && "performance" in window,

  /**
   * 是否支持 Performance Observer
   */
  observer: () => typeof window !== "undefined" && "PerformanceObserver" in window,

  /**
   * 是否支持用户计时 API
   */
  userTiming: () =>
    typeof window !== "undefined" &&
    "performance" in window &&
    "mark" in window.performance &&
    "measure" in window.performance,

  /**
   * 是否支持 Navigation Timing API
   */
  navigationTiming: () =>
    typeof window !== "undefined" && "performance" in window && "getEntriesByType" in window.performance,

  /**
   * 是否支持 Resource Timing API
   */
  resourceTiming: () =>
    typeof window !== "undefined" && "performance" in window && "getEntriesByType" in window.performance,

  /**
   * 是否支持 Beacon API (用于上报数据)
   */
  beacon: () => typeof window !== "undefined" && "navigator" in window && "sendBeacon" in window.navigator,
};

/**
 * 生成唯一会话 ID
 */
function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * 获取设备类型
 */
function getDeviceType(): "mobile" | "tablet" | "desktop" | "unknown" {
  if (typeof window === "undefined" || !window.navigator) {
    return "unknown";
  }

  const ua = navigator.userAgent;

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }

  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) {
    return "mobile";
  }

  return "desktop";
}

/**
 * 获取连接类型
 */
function getConnectionType(): string {
  if (typeof window === "undefined" || !window.navigator || !("connection" in navigator)) {
    return "unknown";
  }

  const connection = (navigator as any).connection;

  if (!connection) {
    return "unknown";
  }

  return connection.effectiveType || connection.type || "unknown";
}

/**
 * 获取指标评级
 * @param type 指标类型
 * @param value 指标值
 * @returns 评级
 */
function getRating(type: string, value: number): "good" | "needs-improvement" | "poor" | undefined {
  const threshold = METRIC_THRESHOLDS[type as PerformanceMetricType];

  if (!threshold) {
    return undefined;
  }

  if (value <= threshold.good) {
    return "good";
  } else if (value <= threshold.poor) {
    return "needs-improvement";
  } else {
    return "poor";
  }
}

/**
 * 创建基本的性能指标数据结构
 */
function createMetricsData(): PerformanceMetrics {
  // 生成或复用会话 ID
  let sessionId = "";

  try {
    sessionId = sessionStorage.getItem("perf_session_id") || "";

    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem("perf_session_id", sessionId);
    }
  } catch (e) {
    sessionId = generateSessionId();
  }

  return {
    sessionId,
    url: window.location.href,
    userAgent: navigator.userAgent,
    deviceType: getDeviceType(),
    connectionType: getConnectionType(),
    timestamp: Date.now(),
    metrics: [],
  };
}

/**
 * 性能指标收集类
 */
export class PerformanceMetricsCollector {
  private options: MetricsCollectionOptions;
  private metrics: PerformanceMetrics;
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  /**
   * 构造函数
   * @param options 指标收集配置
   */
  constructor(options: MetricsCollectionOptions = {}) {
    this.options = {
      collectCoreWebVitals: true,
      collectNavigationTiming: true,
      reportingMethod: "beacon",
      samplingRate: 1.0,
      ...options,
    };

    this.metrics = createMetricsData();
  }

  /**
   * 初始化性能指标收集
   */
  public init(): void {
    if (this.isInitialized) {
      return;
    }

    // 应用采样率
    if (Math.random() > (this.options.samplingRate || 1.0)) {
      return;
    }

    // 检查支持的 API
    if (!isPerformanceSupported.basic()) {
      console.warn("Performance API is not supported in this browser");
      return;
    }

    // 收集核心 Web 指标
    if (this.options.collectCoreWebVitals && isPerformanceSupported.observer()) {
      this.collectCoreWebVitals();
    }

    // 收集导航计时指标
    if (this.options.collectNavigationTiming && isPerformanceSupported.navigationTiming()) {
      this.collectNavigationTiming();
    }

    // 收集 DOMContentLoaded 和 Load 事件时间
    this.collectPageLoadEvents();

    this.isInitialized = true;
  }

  /**
   * 收集核心 Web 指标
   */
  private collectCoreWebVitals(): void {
    try {
      // LCP (Largest Contentful Paint)
      this.observePerformanceEntry("largest-contentful-paint", entries => {
        // 只取最后一个 LCP 值
        const lastEntry = entries[entries.length - 1];
        this.addMetric({
          name: PerformanceMetricType.LCP,
          value: lastEntry.startTime,
          unit: "ms",
          timestamp: Date.now(),
          details: { element: lastEntry.element?.tagName || "unknown" },
        });
      });

      // FID (First Input Delay)
      this.observePerformanceEntry("first-input", entries => {
        const firstInput = entries[0];
        const inputDelay = firstInput.processingStart - firstInput.startTime;

        this.addMetric({
          name: PerformanceMetricType.FID,
          value: inputDelay,
          unit: "ms",
          timestamp: Date.now(),
          details: {
            type: firstInput.name,
            target: firstInput.target?.tagName || "unknown",
          },
        });
      });

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      let clsEntries: PerformanceEntry[] = [];

      this.observePerformanceEntry("layout-shift", entries => {
        for (const entry of entries) {
          // 只计算没有用户输入的布局偏移
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            clsEntries.push(entry);
          }
        }

        this.addMetric({
          name: PerformanceMetricType.CLS,
          value: clsValue,
          unit: "score",
          timestamp: Date.now(),
          details: { entries: clsEntries.length },
        });
      });

      // FCP (First Contentful Paint)
      this.observePerformanceEntry("paint", entries => {
        for (const entry of entries) {
          if (entry.name === "first-contentful-paint") {
            this.addMetric({
              name: PerformanceMetricType.FCP,
              value: entry.startTime,
              unit: "ms",
              timestamp: Date.now(),
            });
          }
        }
      });
    } catch (error) {
      console.error("Error collecting core web vitals:", error);
    }
  }

  /**
   * 观察性能条目
   * @param entryType 条目类型
   * @param callback 回调函数
   */
  private observePerformanceEntry(entryType: string, callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const observer = new PerformanceObserver(list => {
        callback(list.getEntries());
      });

      observer.observe({ type: entryType, buffered: true });
      this.observers.push(observer);
    } catch (e) {
      console.warn(`Failed to observe ${entryType} entries:`, e);
    }
  }

  /**
   * 收集导航计时指标
   */
  private collectNavigationTiming(): void {
    try {
      window.addEventListener("load", () => {
        setTimeout(() => {
          const navigationEntries = performance.getEntriesByType("navigation");

          if (navigationEntries.length === 0) {
            return;
          }

          const navTiming = navigationEntries[0] as PerformanceNavigationTiming;

          // TTFB (Time to First Byte)
          this.addMetric({
            name: PerformanceMetricType.TTFB,
            value: navTiming.responseStart,
            unit: "ms",
            timestamp: Date.now(),
          });

          // 收集其他导航指标
          const navigationMetrics = {
            dns: navTiming.domainLookupEnd - navTiming.domainLookupStart,
            tcp: navTiming.connectEnd - navTiming.connectStart,
            tls: navTiming.secureConnectionStart > 0 ? navTiming.connectEnd - navTiming.secureConnectionStart : 0,
            request: navTiming.responseStart - navTiming.requestStart,
            response: navTiming.responseEnd - navTiming.responseStart,
            dom: navTiming.domComplete - navTiming.domInteractive,
            domInteractive: navTiming.domInteractive,
            domComplete: navTiming.domComplete,
            loadEvent: navTiming.loadEventEnd - navTiming.loadEventStart,
          };

          // 添加导航计时详情
          this.addCustomMetric("NavigationTiming", 0, "", navigationMetrics);
        }, 0);
      });
    } catch (error) {
      console.error("Error collecting navigation timing:", error);
    }
  }

  /**
   * 收集页面加载事件
   */
  private collectPageLoadEvents(): void {
    const startTime = performance.now();

    // DOMContentLoaded 事件
    window.addEventListener("DOMContentLoaded", () => {
      this.addMetric({
        name: PerformanceMetricType.DCL,
        value: performance.now() - startTime,
        unit: "ms",
        timestamp: Date.now(),
      });
    });

    // Load 事件
    window.addEventListener("load", () => {
      this.addMetric({
        name: PerformanceMetricType.L,
        value: performance.now() - startTime,
        unit: "ms",
        timestamp: Date.now(),
      });

      // 页面加载完成后，自动上报性能数据
      setTimeout(() => this.report(), 1000);
    });
  }

  /**
   * 添加性能指标
   * @param metric 性能指标
   */
  public addMetric(metric: Omit<PerformanceMetric, "rating">): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      rating: getRating(metric.name, metric.value),
    };

    // 更新或添加指标
    const existingIndex = this.metrics.metrics.findIndex(m => m.name === metric.name);

    if (existingIndex >= 0) {
      this.metrics.metrics[existingIndex] = fullMetric;
    } else {
      this.metrics.metrics.push(fullMetric);
    }
  }

  /**
   * 添加自定义性能指标
   * @param name 指标名称
   * @param value 指标值
   * @param unit 单位
   * @param details 详情
   */
  public addCustomMetric(
    name: string,
    value: number,
    unit: "ms" | "s" | "score" | "" = "ms",
    details?: Record<string, any>,
  ): void {
    this.addMetric({
      name: `${PerformanceMetricType.CUSTOM}.${name}`,
      value,
      unit,
      timestamp: Date.now(),
      details,
    });
  }

  /**
   * 添加用户计时标记
   * @param name 标记名称
   */
  public mark(name: string): void {
    if (!isPerformanceSupported.userTiming()) {
      console.warn("User Timing API is not supported in this browser");
      return;
    }

    try {
      performance.mark(name);
    } catch (e) {
      console.error(`Failed to add mark '${name}':`, e);
    }
  }

  /**
   * 测量两个标记之间的时间
   * @param name 测量名称
   * @param startMark 开始标记
   * @param endMark 结束标记
   * @param shouldReport 是否应添加为指标
   */
  public measure(
    name: string,
    startMark?: string,
    endMark?: string,
    shouldReport: boolean = true,
  ): PerformanceMeasure | undefined {
    if (!isPerformanceSupported.userTiming()) {
      console.warn("User Timing API is not supported in this browser");
      return;
    }

    try {
      const measure = performance.measure(name, startMark, endMark);

      if (shouldReport) {
        this.addCustomMetric(`Measure.${name}`, measure.duration, "ms", {
          startTime: measure.startTime,
          duration: measure.duration,
        });
      }

      return measure;
    } catch (e) {
      console.error(`Failed to measure '${name}':`, e);
      return undefined;
    }
  }

  /**
   * 上报性能指标数据
   * @param url 可选的上报 URL，覆盖配置的 URL
   * @returns 返回是否上报成功
   */
  public report(url?: string): Promise<boolean> {
    const reportingUrl = url || this.options.reportingUrl;

    if (!reportingUrl) {
      console.warn("No reporting URL provided for performance metrics");
      return Promise.resolve(false);
    }

    // 处理上报前的数据
    if (this.options.beforeReporting) {
      const processedData = this.options.beforeReporting(this.metrics);

      if (processedData === false) {
        return Promise.resolve(false);
      }

      if (processedData) {
        this.metrics = processedData;
      }
    }

    // 根据配置选择上报方法
    const method = this.options.reportingMethod || "beacon";
    const data = JSON.stringify(this.metrics);

    try {
      if (method === "beacon" && isPerformanceSupported.beacon()) {
        // 使用 Beacon API (不阻塞页面卸载)
        const success = navigator.sendBeacon(reportingUrl, data);

        if (success) {
          this.options.onReportingSuccess?.(this.metrics);
        } else {
          throw new Error("Failed to send beacon");
        }

        return Promise.resolve(success);
      } else if (method === "fetch" && typeof fetch === "function") {
        // 使用 Fetch API
        return fetch(reportingUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: data,
          keepalive: true, // 在页面卸载时保持请求活跃
        })
          .then(() => {
            this.options.onReportingSuccess?.(this.metrics);
            return true;
          })
          .catch(error => {
            this.options.onReportingError?.(error, this.metrics);
            return false;
          });
      } else {
        // 回退到 XMLHttpRequest
        return new Promise(resolve => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", reportingUrl, true);
          xhr.setRequestHeader("Content-Type", "application/json");

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              this.options.onReportingSuccess?.(this.metrics);
              resolve(true);
            } else {
              const error = new Error(`HTTP error ${xhr.status}`);
              this.options.onReportingError?.(error, this.metrics);
              resolve(false);
            }
          };

          xhr.onerror = () => {
            const error = new Error("XHR request failed");
            this.options.onReportingError?.(error, this.metrics);
            resolve(false);
          };

          xhr.send(data);
        });
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.options.onReportingError?.(err, this.metrics);
      return Promise.resolve(false);
    }
  }

  /**
   * 获取已收集的指标数据
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (e) {
        // 忽略错误
      }
    });

    this.observers = [];
  }
}

/**
 * 创建默认的性能指标收集器实例
 */
let defaultCollector: PerformanceMetricsCollector | null = null;

/**
 * 获取或创建默认的性能指标收集器实例
 * @param options 配置选项
 * @returns 性能指标收集器实例
 */
export function getMetricsCollector(options?: MetricsCollectionOptions): PerformanceMetricsCollector {
  if (!defaultCollector) {
    defaultCollector = new PerformanceMetricsCollector(options);
    defaultCollector.init();
  } else if (options) {
    // 如果提供了新选项但收集器已存在，发出警告
    console.warn("A metrics collector already exists. Options ignored.");
  }

  return defaultCollector;
}

/**
 * 自动初始化性能指标收集
 * 当 window.onload 事件触发时，会自动创建并初始化收集器
 * @param options 配置选项
 */
export function autoInitMetricsCollector(options?: MetricsCollectionOptions): void {
  if (typeof window !== "undefined") {
    if (document.readyState === "complete") {
      getMetricsCollector(options);
    } else {
      window.addEventListener("load", () => {
        getMetricsCollector(options);
      });
    }
  }
}

/**
 * 资源加载性能跟踪
 * @param resourceUrl 资源 URL 或正则表达式模式
 * @param type 资源类型筛选
 * @returns 匹配的资源性能条目
 */
export function trackResourceTiming(
  resourceUrl: string | RegExp,
  type?: "script" | "css" | "img" | "fetch" | "xmlhttprequest",
): PerformanceResourceTiming[] {
  if (!isPerformanceSupported.resourceTiming()) {
    console.warn("Resource Timing API is not supported in this browser");
    return [];
  }

  try {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];

    return resources.filter(entry => {
      const urlMatches =
        typeof resourceUrl === "string" ? entry.name.includes(resourceUrl) : resourceUrl.test(entry.name);

      const typeMatches = type ? entry.initiatorType === type : true;

      return urlMatches && typeMatches;
    });
  } catch (error) {
    console.error("Error tracking resource timing:", error);
    return [];
  }
}

/**
 * 计算资源加载性能指标
 * @param resources 资源性能条目数组
 * @returns 资源加载性能指标
 */
export function calculateResourceMetrics(resources: PerformanceResourceTiming[]): {
  totalCount: number;
  totalSize: number;
  totalDuration: number;
  averageDuration: number;
  resources: Array<{
    url: string;
    type: string;
    size: number;
    duration: number;
    details: {
      dns: number;
      connect: number;
      ssl: number;
      wait: number;
      receive: number;
    };
  }>;
} {
  let totalSize = 0;
  let totalDuration = 0;

  const resourceDetails = resources.map(resource => {
    const size = resource.transferSize || resource.decodedBodySize || 0;
    const duration = resource.responseEnd - resource.startTime;

    totalSize += size;
    totalDuration += duration;

    return {
      url: resource.name,
      type: resource.initiatorType,
      size,
      duration,
      details: {
        dns: resource.domainLookupEnd - resource.domainLookupStart,
        connect: resource.connectEnd - resource.connectStart,
        ssl: resource.secureConnectionStart > 0 ? resource.connectEnd - resource.secureConnectionStart : 0,
        wait: resource.responseStart - resource.requestStart,
        receive: resource.responseEnd - resource.responseStart,
      },
    };
  });

  return {
    totalCount: resources.length,
    totalSize,
    totalDuration,
    averageDuration: resources.length > 0 ? totalDuration / resources.length : 0,
    resources: resourceDetails,
  };
}

/**
 * 快速测量函数执行时间
 * @param fn 要测量的函数
 * @param args 函数参数
 * @returns 执行结果和耗时
 */
export function measureFunctionExecution<T, Args extends any[]>(
  fn: (...args: Args) => T,
  ...args: Args
): { result: T; duration: number } {
  const startTime = performance.now();
  const result = fn(...args);
  const duration = performance.now() - startTime;

  return { result, duration };
}

// 导出默认函数
export default getMetricsCollector;
