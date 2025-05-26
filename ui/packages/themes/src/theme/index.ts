/**
 * 主题系统模块
 * 提供完整的主题管理功能
 */

// 导出所有主题相关功能
export {
  // 完整版主题
  createTheme,
  useTheme,
  ThemeProvider,
  createThemeContext,
  provideTheme,
  THEME_KEY,

  // 简化版主题
  createSimpleTheme,
  useSimpleTheme,
  provideSimpleTheme,
  SIMPLE_THEME_KEY,
  simpleDefaultTheme,
  createSimpleStyleFunction,
  simpleThemeUtils,
} from "./theme";

// 导出预设
export {
  defaultTheme,
  darkTheme,
  blueTheme,
  greenTheme,
  purpleTheme,
  orangeTheme,
  pinkTheme,
  themePresets,
  getThemePreset,
  getThemeConfig,
  getThemeNames,
  hasTheme,
  presetUtils,
} from "./presets";

// 导出类型
export type {
  // 基础配置接口
  ColorConfig,
  ExtendedColorConfig,
  FontSizeConfig,
  FontWeightConfig,
  LineHeightConfig,
  SpacingConfig,
  BorderRadiusConfig,
  BreakpointConfig,
  ZIndexConfig,
  ShadowConfig,
  ThemeTransitionConfig,

  // 主题核心接口
  ThemeConfig,
  ThemeMode,
  Theme,
  ThemeContext,

  // 简化主题接口
  SimpleTheme,
  SimpleStyleFunction,

  // 预设和变体接口
  ThemePreset,
  ThemeVariant,
  ThemeValidationResult,
  ThemeMixOptions,

  // 配置选项接口
  CSSVarOptions,
  ThemeOptions,
  ResponsiveThemeConfig,
  ThemeAnimationConfig,
  ThemeTransitionOptions,
  ThemeProviderProps,

  // 工具函数接口
  ThemeUtils,
  PresetUtils,

  // 钩子返回类型
  UseThemeReturn,
  UseSimpleThemeReturn,

  // 管理器和存储接口
  ThemeManager,
  ThemeStorage,

  // 事件接口
  ThemeEvents,

  // 工具类型
  DeepPartial,
  PartialThemeConfig,
  ColorKeys,
  FontSizeKeys,
  SpacingKeys,
  BorderRadiusKeys,
  BreakpointKeys,
  ThemeValue,
  CSSValue,
  ThemeStyleObject,
  ResponsiveThemeStyleObject,
} from "./types";
