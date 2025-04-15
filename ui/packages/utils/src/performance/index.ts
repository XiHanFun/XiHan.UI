/**
 * 性能优化工具集
 */

// 延迟加载工具导出
export { createLazyLoad, lazyLoad, lazyLoadImage, lazyResource } from "./lazy";
export type { LazyLoadOptions, LazyLoadResult } from "./lazy";

// 函数记忆化工具导出
export { memoize, once, debounceMemoize } from "./memoize";
export type { MemoizeOptions } from "./memoize";

// 性能指标收集工具导出
export {
  PerformanceMetricType,
  PerformanceMetricsCollector,
  getMetricsCollector,
  autoInitMetricsCollector,
  trackResourceTiming,
  calculateResourceMetrics,
  measureFunctionExecution,
  isPerformanceSupported,
} from "./metrics";
export type { MetricsCollectionOptions, PerformanceMetric, PerformanceMetrics } from "./metrics";

// requestIdleCallback 工具导出
export {
  hasIdleCallback,
  safeRequestIdleCallback,
  safeCancelIdleCallback,
  IdleTaskQueue,
  idle,
  idleDebounce,
  idleChunk,
  defaultIdleQueue,
} from "./requestIdleCallback";
export type { IdleCallbackOptions, IdleCallbackResult, IdleDeadline } from "./requestIdleCallback";

// 节流工具导出
export { throttle, simpleThrottle, createFpsThrottle, createRafThrottle } from "./throttle";
export type { ThrottleOptions } from "./throttle";
