/**
 * 性能优化工具集
 */

export * from "./throttle";
export * from "./memoize";
export * from "./lazy";
export * from "./metrics";
export * from "./requestIdleCallback";

// 导出默认的空闲任务队列
export { default as idleQueue } from "./requestIdleCallback";
