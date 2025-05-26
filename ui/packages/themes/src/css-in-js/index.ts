/**
 * CSS-in-JS 模块
 * 提供完整的 CSS-in-JS 功能
 */

// === 核心 CSS 功能 ===
export {
  css,
  simpleCss,
  keyframes,
  injectGlobal,
  cx,
  cond,
  responsive,
  mergeStyles,
  conditionalStyles,
  hover,
  focus,
  active,
  disabled,
  firstChild,
  lastChild,
  before,
  after,
  child,
  descendant,
  sibling,
  generalSibling,
  when,
  not,
  mediaQuery,
  containerQuery,
  supportsQuery,
  combine,
  variant,
  size,
  colorScheme,
} from "./css";

// === 工具函数 ===
export {
  generateHash,
  styleObjectToCSS,
  rgba,
  mixColor,
  cssVar,
  createCSSVars,
  flattenObject,
  normalizeStyleValue,
  createStyleVariants,
  debugStyles,
  optimizeStyles,
  addVendorPrefixes,
} from "./utils";

// === 响应式系统 ===
export {
  ResponsiveManager,
  createResponsiveManager,
  useResponsiveValue,
  createResponsiveStyles,
  responsiveUtils,
  type Breakpoint,
  type ResponsiveStyleConfig,
} from "./responsive";

// === 组件样式系统 ===
export {
  createComponentStyles,
  createStyleFunction,
  componentStyleFactories,
  styleVariants,
  animationStyles,
  keyframeAnimations,
} from "./component-styles";

// === DOM 集成 ===
export {
  DOMStyleApplier,
  domStyleApplier,
  createStyledElement,
  DynamicStyleManager,
  createDynamicStyleManager,
  styled,
  batchStyles,
  styleAnimation,
  type StyledElementOptions,
} from "./dom-integration";

// === CSS-in-JS 专有类型定义 ===
export type {
  // 样式相关类型
  StyleObject,

  // 组件相关类型
  ComponentStylesConfig,
  CSSRule,
  ComponentStyleFunction,
  StyleFactory,
  StyleVariantConfig,

  // 动画相关类型
  AnimationConfig,
  TransitionConfig,

  // 查询相关类型
  MediaQueryConfig,
  ContainerQueryConfig,

  // 其他类型
  GlobalStylesConfig,
} from "./types";
