import type { ColorMode, Contrast } from './types'

// 系统媒体查询信号：prefers-color-scheme 与 prefers-contrast。
export interface EnvSignals {
  systemMode: () => ColorMode
  systemContrast: () => Contrast
  subscribe: (fn: () => void) => () => void
}

export function createEnvSignals(win: Window = window): EnvSignals {
  const hasMM = typeof win?.matchMedia === 'function'
  const dark = hasMM ? win.matchMedia('(prefers-color-scheme: dark)') : null
  const more = hasMM ? win.matchMedia('(prefers-contrast: more)') : null

  return {
    systemMode: () => (dark?.matches ? 'dark' : 'light'),
    systemContrast: () => (more?.matches ? 'more' : 'base'),
    subscribe(fn) {
      dark?.addEventListener('change', fn)
      more?.addEventListener('change', fn)
      return () => {
        dark?.removeEventListener('change', fn)
        more?.removeEventListener('change', fn)
      }
    },
  }
}

/** SSR 回退：无媒体查询，一律浅色/基线对比度。 */
export const SSR_ENV: EnvSignals = {
  systemMode: () => 'light',
  systemContrast: () => 'base',
  subscribe: () => () => {},
}
