/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 visual environment 模块的公共接口。

export {
  applyThemeAttrs,
  applyVisualEnvironmentAttrs,
  toThemeAttrs,
  toVisualEnvironmentAttrs,
  VISUAL_ENVIRONMENT_ATTRIBUTES,
} from './apply'
export type { EnvSignals } from './env'
export { createEnvSignals, SSR_ENV } from './env'
export { trackLiquidSurface } from './liquid/surface'
export { pickThemeState, resolveTheme, resolveVisualEnvironment } from './resolve'
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
} from './types'
export { BASELINE_THEME, BASELINE_VISUAL_ENVIRONMENT, brandId } from './types'
export type {
  MotionOverrideSetter,
  VisualEnvironmentController,
  VisualEnvironmentControllerOptions,
  VisualEnvironmentStorageError,
  VisualMotionSink,
} from './visual-controller'
export { createMotionOverrideSink, createVisualEnvironmentController } from './visual-controller'
