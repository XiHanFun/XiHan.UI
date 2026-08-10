import type { EnvSignals } from './env'
import type { ThemePreference, ThemeState } from './types'
import { BASELINE_THEME } from './types'

/**
 * 把偏好折算成已定型的状态。
 * undefined 取父作用域值；'system' 折算成媒体查询结果（仅 mode/contrast）。
 */
export function resolveTheme(
  pref: ThemePreference,
  env: EnvSignals,
  parent: ThemeState = BASELINE_THEME,
): ThemeState {
  return {
    mode: pref.mode === undefined
      ? parent.mode
      : pref.mode === 'system' ? env.systemMode() : pref.mode,
    brand: pref.brand ?? parent.brand,
    density: pref.density ?? parent.density,
    dir: pref.dir ?? parent.dir,
    contrast: pref.contrast === undefined
      ? parent.contrast
      : pref.contrast === 'system' ? env.systemContrast() : pref.contrast,
  }
}
