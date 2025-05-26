/**
 * 核心引擎模块
 * 提供样式引擎的核心功能
 */

// 完整样式引擎
export {
  StyleEngine,
  createStyleEngine,
  useStyleEngine,
  provideStyleEngine,
  globalStyleEngine,
  styleEngineUtils,
} from "./style-engine";

// 简化样式引擎
export {
  SimpleStyleEngine,
  createSimpleStyleEngine,
  provideSimpleStyleEngine,
  useSimpleStyleEngine,
  globalSimpleStyleEngine,
  type SimpleStyleObject,
} from "./simple-engine";

// 样式缓存系统
export { StyleCache, createStyleCache, globalStyleCache, cacheUtils } from "./cache";

// 样式注入器
export { StyleInjector, createStyleInjector, globalStyleInjector, injectorUtils } from "./injector";

// 核心类型
export type {
  StyleEngineConfig,
  StyleInjectorConfig,
  StyleCacheConfig,
  IStyleEngine,
  IStyleCache,
  IStyleInjector,
  CompiledStyle,
  StyleRule,
} from "./types";
