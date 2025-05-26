/**
 * 主题系统类型定义
 * 包含所有主题相关的类型接口和工具类型
 */

import type { InjectionKey, Ref } from "vue";

// 前向声明，避免循环依赖
export interface ThemePreset {
  name: string;
  displayName: string;
  description: string;
  config: ThemeConfig;
  preview: {
    colors: string[];
    image?: string;
  };
  tags?: string[];
  author?: string;
  version?: string;
}

export interface ThemeValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ThemeMixOptions {
  ratio?: number;
  preserveStructure?: boolean;
  mixColors?: boolean;
  mixSpacing?: boolean;
  mixTypography?: boolean;
}

/**
 * 颜色配置接口
 */
export interface ColorConfig {
  primary: string;
  secondary?: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  white: string;
  black: string;
  [key: string]: string | Record<string, string> | undefined;
}

/**
 * 扩展颜色配置接口
 */
export interface ExtendedColorConfig extends ColorConfig {
  gray?: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  text?: {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
  };
  background?: {
    default: string;
    paper: string;
    elevated: string;
  };
  border?: {
    light: string;
    medium: string;
    dark: string;
  };
}

/**
 * 字体大小配置接口
 */
export interface FontSizeConfig {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  "4xl"?: string;
  "5xl"?: string;
  [key: string]: string | undefined;
}

/**
 * 字体权重配置接口
 */
export interface FontWeightConfig {
  light: number;
  regular: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold?: number;
  [key: string]: number | undefined;
}

/**
 * 行高配置接口
 */
export interface LineHeightConfig {
  none: number;
  tight: number;
  normal: number;
  loose: number;
  relaxed?: number;
  [key: string]: number | undefined;
}

/**
 * 间距配置接口
 */
export interface SpacingConfig {
  "0": string;
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  "4xl"?: string;
  "5xl"?: string;
  [key: string]: string | undefined;
}

/**
 * 圆角配置接口
 */
export interface BorderRadiusConfig {
  none: string;
  sm: string;
  base: string;
  md?: string;
  lg: string;
  xl: string;
  "2xl"?: string;
  round: string;
  circle: string;
  [key: string]: string | undefined;
}

/**
 * 断点配置接口
 */
export interface BreakpointConfig {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  [key: string]: string | undefined;
}

/**
 * 层级配置接口
 */
export interface ZIndexConfig {
  dropdown: number;
  sticky: number;
  fixed: number;
  modalBackdrop: number;
  modal: number;
  popover: number;
  tooltip: number;
  notification?: number;
  [key: string]: number | undefined;
}

/**
 * 阴影配置接口
 */
export interface ShadowConfig {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  "2xl"?: string;
  inner?: string;
  [key: string]: string | undefined;
}

/**
 * 主题过渡配置接口
 */
export interface ThemeTransitionConfig {
  duration: string;
  timing: string;
  fast?: string;
  slow?: string;
  [key: string]: string | undefined;
}

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  colors: ExtendedColorConfig;
  fontSizes: FontSizeConfig;
  fontWeights: FontWeightConfig;
  lineHeights: LineHeightConfig;
  spacings: SpacingConfig;
  borderRadius: BorderRadiusConfig;
  breakpoints: BreakpointConfig;
  zIndexes: ZIndexConfig;
  shadows: ShadowConfig;
  transitions: ThemeTransitionConfig;
}

/**
 * 主题模式类型
 */
export type ThemeMode = "light" | "dark";

/**
 * 主题接口
 */
export interface Theme extends ThemeConfig {
  mode: ThemeMode;
  cssVars: Record<string, string>;
}

/**
 * 简化的主题类型
 */
export interface SimpleTheme {
  colors: Record<string, string>;
  fontSizes: Record<string, string>;
  spacings: Record<string, string>;
  borderRadius: Record<string, string>;
  [key: string]: any;
}

/**
 * 样式函数类型
 */
export type SimpleStyleFunction<T = any> = (theme: SimpleTheme, props?: T) => any;

/**
 * 主题上下文接口
 */
export interface ThemeContext {
  theme: Ref<Theme>;
  setTheme: (config: Partial<ThemeConfig>) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

/**
 * 主题变体配置
 */
export interface ThemeVariant {
  name: string;
  baseTheme: string;
  overrides: Partial<ThemeConfig>;
}

/**
 * CSS 变量生成选项
 */
export interface CSSVarOptions {
  prefix?: string;
  includeColors?: boolean;
  includeFontSizes?: boolean;
  includeSpacings?: boolean;
  includeBorderRadius?: boolean;
  includeBreakpoints?: boolean;
  includeZIndexes?: boolean;
  includeShadows?: boolean;
  includeTransitions?: boolean;
}

/**
 * 主题工具函数接口
 */
export interface ThemeUtils {
  getColor: (theme: SimpleTheme, colorName: string) => string;
  getFontSize: (theme: SimpleTheme, sizeName: string) => string;
  getSpacing: (theme: SimpleTheme, spacingName: string) => string;
  getBorderRadius: (theme: SimpleTheme, radiusName: string) => string;
  createThemeVars: (theme: SimpleTheme, prefix?: string) => Record<string, string>;
  injectThemeVars: (theme: SimpleTheme, target?: HTMLElement, prefix?: string) => void;
}

/**
 * 主题预设工具函数接口
 */
export interface PresetUtils {
  createVariant: (baseTheme: ThemeConfig, overrides: Partial<ThemeConfig>) => ThemeConfig;
  mixThemes: (theme1: ThemeConfig, theme2: ThemeConfig, options?: ThemeMixOptions) => ThemeConfig;
  generateDarkVariant: (lightTheme: ThemeConfig) => ThemeConfig;
  validateTheme: (theme: ThemeConfig) => ThemeValidationResult;
  generateCSSVars: (theme: ThemeConfig, options?: CSSVarOptions) => Record<string, string>;
}

/**
 * 主题注入键类型声明
 */
export declare const THEME_KEY: InjectionKey<ThemeContext>;
export declare const SIMPLE_THEME_KEY: InjectionKey<Ref<SimpleTheme>>;

/**
 * 主题事件类型
 */
export interface ThemeEvents {
  "theme-changed": (theme: Theme) => void;
  "mode-changed": (mode: ThemeMode) => void;
  "preset-loaded": (preset: ThemePreset) => void;
}

/**
 * 主题配置选项
 */
export interface ThemeOptions {
  enableCSSVars?: boolean;
  enableDOMInjection?: boolean;
  prefix?: string;
  watchSystemTheme?: boolean;
  persistTheme?: boolean;
  storageKey?: string;
}

/**
 * 响应式主题配置
 */
export interface ResponsiveThemeConfig {
  breakpoint: keyof BreakpointConfig;
  config: Partial<ThemeConfig>;
}

/**
 * 主题动画配置
 */
export interface ThemeAnimationConfig {
  duration?: string;
  easing?: string;
  properties?: string[];
}

/**
 * 主题切换选项
 */
export interface ThemeTransitionOptions {
  animation?: ThemeAnimationConfig;
  beforeSwitch?: () => void | Promise<void>;
  afterSwitch?: (theme: Theme) => void | Promise<void>;
}

/**
 * 主题组件属性类型
 */
export interface ThemeProviderProps {
  theme?: Partial<ThemeConfig>;
  mode?: ThemeMode;
  options?: ThemeOptions;
}

/**
 * 主题钩子返回类型
 */
export interface UseThemeReturn extends ThemeContext {
  isLight: Ref<boolean>;
  isDark: Ref<boolean>;
  cssVars: Ref<Record<string, string>>;
}

/**
 * 简化主题钩子返回类型
 */
export interface UseSimpleThemeReturn {
  theme: Ref<SimpleTheme>;
  setTheme: (theme: Partial<SimpleTheme>) => void;
  utils: ThemeUtils;
}

/**
 * 主题管理器接口
 */
export interface ThemeManager {
  currentTheme: Ref<Theme>;
  availablePresets: Ref<ThemePreset[]>;
  loadPreset: (name: string) => Promise<void>;
  savePreset: (preset: ThemePreset) => Promise<void>;
  deletePreset: (name: string) => Promise<void>;
  exportTheme: (theme: Theme) => string;
  importTheme: (data: string) => Promise<Theme>;
}

/**
 * 主题存储接口
 */
export interface ThemeStorage {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

/**
 * 工具类型：深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 工具类型：主题配置的深度部分类型
 */
export type PartialThemeConfig = DeepPartial<ThemeConfig>;

/**
 * 工具类型：提取颜色键
 */
export type ColorKeys = keyof ColorConfig;

/**
 * 工具类型：提取字体大小键
 */
export type FontSizeKeys = keyof FontSizeConfig;

/**
 * 工具类型：提取间距键
 */
export type SpacingKeys = keyof SpacingConfig;

/**
 * 工具类型：提取圆角键
 */
export type BorderRadiusKeys = keyof BorderRadiusConfig;

/**
 * 工具类型：提取断点键
 */
export type BreakpointKeys = keyof BreakpointConfig;

/**
 * 工具类型：主题值类型
 */
export type ThemeValue<T extends keyof ThemeConfig> = ThemeConfig[T][keyof ThemeConfig[T]];

/**
 * 工具类型：CSS 属性值
 */
export type CSSValue = string | number;

/**
 * 工具类型：主题样式对象
 */
export type ThemeStyleObject = Record<string, CSSValue>;

/**
 * 工具类型：响应式主题样式对象
 */
export type ResponsiveThemeStyleObject = ThemeStyleObject | Record<BreakpointKeys, ThemeStyleObject>;
