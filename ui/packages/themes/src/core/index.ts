/**
 * 核心引擎模块
 * 提供样式引擎的核心功能
 */

export { BEM } from "./bem";

export { mediaQuery, container, responsive } from "./responsive";
export { type Breakpoint } from "./responsive";

export { style, cssVar } from "./css";

export {
  CSSRenderer,
  CSSRuleBuilder,
  BEMStyleBuilder,
  cssRenderer,
  createCSSRenderer,
  c,
  cB,
  cE,
  cM,
  cNotM,
  find as cssFind,
  media,
  keyframes,
  styleUtils,
  breakpoints,
  type CSSProperties,
  type CSSRule,
  type CSSRenderOptions,
} from "./css-render";

export {
  animation,
  transition,
  AnimationSequence,
  createAnimationSequence,
  animationUtils,
  type AnimationOptions,
  type TransitionOptions,
} from "./animation";

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
  simpleEngineUtils,
} from "./style-engine";

// 简化样式引擎类型
export type { SimpleEngineConfig } from "./style-engine";

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
