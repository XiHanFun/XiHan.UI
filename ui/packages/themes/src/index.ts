// 导出原有的主题系统（向后兼容）
export {
  ThemeStyle,
  ThemeMode,
  getSystemTheme,
  watchSystemTheme,
  flattenThemeVars,
  generateCSSVars,
  createThemeManager,
  CSS_VAR_PREFIX,
} from "./theme";

// === CSS-in-JS 核心系统 ===
// 样式引擎
export { StyleEngine, createStyleEngine, useStyleEngine, provideStyleEngine } from "./css-in-js/style-engine";

// 主题系统
export { createTheme, useTheme, ThemeProvider, createThemeContext, provideTheme } from "./css-in-js/theme";

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
} from "./css-in-js/css";

// 响应式工具（优先使用响应式模块的实现）
export {
  ResponsiveManager,
  responsiveManager,
  mediaQuery,
  containerQuery,
  responsive,
  createResponsiveStyles,
  createResponsiveManager,
  defaultBreakpoints,
  type Breakpoint,
} from "./css-in-js/responsive";

// 组件样式系统
export {
  createComponentStyles,
  createStyleFunction,
  componentStyleFactories,
  styleVariants,
} from "./css-in-js/component-styles";

// 工具函数
export {
  generateHash,
  styleObjectToCSS,
  mergeStyles,
  flattenObject,
  createCSSVars,
  cssVar,
  rgba,
  mixColor,
  pseudoClass,
  pseudoElement,
  childSelector,
} from "./css-in-js/utils";

// 类型定义
export type {
  Theme,
  ThemeConfig,
  StyleObject,
  ComponentStylesConfig,
  StyleEngineConfig,
  ComponentStyleFunction,
} from "./css-in-js/types";

// === 简化版 CSS-in-JS 系统 ===
export {
  SimpleStyleEngine,
  createSimpleStyleEngine,
  provideSimpleStyleEngine,
  useSimpleStyleEngine,
  createSimpleStyleFunction,
  provideSimpleTheme,
  useSimpleTheme,
  defaultTheme as simpleDefaultTheme,
  css as simpleCss,
  cx as simpleCx,
  mergeStyles as simpleMergeStyles,
  type SimpleStyleObject,
  type SimpleTheme,
} from "./css-in-js/simple";

// === 预设主题和样式 ===
// 默认主题配置
export { defaultThemeConfig, darkThemeConfig } from "./css-in-js/theme";

// 动画样式
export { animationStyles, keyframeAnimations } from "./css-in-js/component-styles";
