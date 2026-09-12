export {
  applyThemeAttrs,
  applyVisualEnvironmentAttrs,
  toThemeAttrs,
  toVisualEnvironmentAttrs,
  VISUAL_ENVIRONMENT_ATTRIBUTES,
} from '@xihan-ui/core/visual-environment'
export type { BrandScale, BrandStep, RegisterBrandOptions } from './brand'
export { brandScaleCss, deriveBrandScale, registerBrand } from './brand'
export type { Oklch, PickColorOptions } from './color'
export {
  clampChroma,
  compositeColors,
  CONTRAST_MIN,
  contrastRatio,
  darken,
  formatOklch,
  inSrgbGamut,
  lighten,
  linearRgbToOklch,
  linearToSrgb,
  meetsContrast,
  mixColors,
  oklchToLinearRgb,
  ON_COLOR_CROSSOVER,
  parseColorToOklch,
  pickAwayColor,
  pickOnColor,
  relativeLuminance,
  srgbToLinear,
  withAlpha,
} from './color'
export type { ThemeController, ThemeControllerOptions } from './controller'
export { createThemeController } from './controller'
// @xihan-ui/tokens/runtime —— 兼容的主题运行时入口；实现由 Core 持有。
export type { EnvSignals } from '@xihan-ui/core/visual-environment'
export { createEnvSignals, SSR_ENV } from '@xihan-ui/core/visual-environment'
export { pickThemeState, resolveTheme, resolveVisualEnvironment } from '@xihan-ui/core/visual-environment'
export type {
  BrandId,
  ColorMode,
  Contrast,
  Density,
  Direction,
  ThemeAttrs,
  ThemePreference,
  ThemeState,
  Transparency,
  VisualEnvironmentAttrs,
  VisualEnvironmentPreference,
  VisualEnvironmentState,
  VisualMotion,
} from '@xihan-ui/core/visual-environment'
export { BASELINE_THEME, BASELINE_VISUAL_ENVIRONMENT, brandId } from '@xihan-ui/core/visual-environment'
export type {
  MotionOverrideSetter,
  VisualEnvironmentController,
  VisualEnvironmentControllerOptions,
  VisualEnvironmentStorageError,
  VisualMotionSink,
} from '@xihan-ui/core/visual-environment'
export { createMotionOverrideSink, createVisualEnvironmentController } from '@xihan-ui/core/visual-environment'
