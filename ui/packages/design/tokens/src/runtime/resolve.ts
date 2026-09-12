import type { EnvSignals } from './env'
import type {
  ThemePreference,
  ThemeState,
  VisualEnvironmentPreference,
  VisualEnvironmentState,
} from './types'
import { BASELINE_VISUAL_ENVIRONMENT } from './types'

/** undefined 继承父作用域；system 仅在平台有对应 media feature 的四个轴生效。 */
export function resolveVisualEnvironment(
  preference: VisualEnvironmentPreference,
  env: EnvSignals,
  parent: VisualEnvironmentState = BASELINE_VISUAL_ENVIRONMENT,
): VisualEnvironmentState {
  return {
    mode: preference.mode === undefined
      ? parent.mode
      : preference.mode === 'system' ? env.systemMode() : preference.mode,
    brand: preference.brand ?? parent.brand,
    density: preference.density ?? parent.density,
    dir: preference.dir ?? parent.dir,
    contrast: preference.contrast === undefined
      ? parent.contrast
      : preference.contrast === 'system' ? env.systemContrast() : preference.contrast,
    motion: preference.motion === undefined
      ? parent.motion
      : preference.motion === 'system' ? env.systemMotion() : preference.motion,
    transparency: preference.transparency === undefined
      ? parent.transparency
      : preference.transparency === 'system' ? env.systemTransparency() : preference.transparency,
  }
}

/** 五轴兼容视图委托七轴解析，不保留第二套 resolver。 */
export function resolveTheme(
  preference: ThemePreference,
  env: EnvSignals,
  parent?: ThemeState,
): ThemeState {
  const resolved = resolveVisualEnvironment(preference, env, parent && {
    ...BASELINE_VISUAL_ENVIRONMENT,
    ...parent,
  })
  return pickThemeState(resolved)
}

export function pickThemeState(state: VisualEnvironmentState): ThemeState {
  return {
    mode: state.mode,
    brand: state.brand,
    density: state.density,
    dir: state.dir,
    contrast: state.contrast,
  }
}
