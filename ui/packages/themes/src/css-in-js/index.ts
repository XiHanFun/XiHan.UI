/**
 * CSS-in-JS 系统模块
 * 提供完整的 CSS-in-JS 功能，基于 @utils/dom 构建
 */

// 主题系统
export {
  createTheme,
  useTheme,
  ThemeProvider,
  createThemeContext,
  provideTheme,
  defaultThemeConfig,
  darkThemeConfig,
} from "../theme/theme";

// CSS 工具函数
export {
  css,
  keyframes,
  injectGlobal,
  cx,
  hover,
  focus,
  active,
  disabled,
  when,
  supportsQuery,
  not,
  cond,
  combine,
  variant,
  size,
  colorScheme,
} from "./css";

// 组件样式系统
export {
  createComponentStyles,
  createStyleFunction,
  componentStyleFactories,
  styleVariants,
  animationStyles,
  keyframeAnimations,
} from "./component-styles";

// 工具函数（基于 @utils/dom）
export {
  generateHash,
  styleObjectToCSS,
  mergeStyles,
  flattenObject,
  createCSSVars,
  cssVar,
  rgba,
  hexToRgba,
  rgbaToHex,
  pseudoClass,
  pseudoElement,
  childSelector,
  normalizeStyleValue,
  conditionalStyles,
  domStyleUtils,
  cssVarUtils,
} from "./utils";

// DOM 集成工具（基于 @utils/dom）
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

// 响应式工具（基于 @utils/dom）
export {
  ResponsiveManager,
  responsiveManager,
  mediaQuery,
  containerQuery,
  responsive,
  createResponsiveStyles,
  createResponsiveManager,
  useResponsiveValue,
  responsiveUtils,
  responsivePresets,
  defaultBreakpoints,
  type Breakpoint,
  type ResponsiveStyleConfig,
} from "./responsive";

// 简化版系统（仅导出非重复的功能）
export {
  createSimpleStyleFunction,
  provideSimpleTheme,
  useSimpleTheme,
  defaultTheme as simpleDefaultTheme,
  css as simpleCss,
  cx as simpleCx,
  mergeStyles as simpleMergeStyles,
  type SimpleTheme,
} from "./simple";

// 类型定义
export type { Theme, ThemeConfig, StyleObject, ComponentStylesConfig, ComponentStyleFunction } from "./types";
