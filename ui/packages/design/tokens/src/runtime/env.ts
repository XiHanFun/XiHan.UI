import type { ColorMode, Contrast, Transparency, VisualMotion } from './types'

/** 平台真实提供 media feature 的四个视觉轴。 */
export interface EnvSignals {
  systemMode: () => ColorMode
  systemContrast: () => Contrast
  systemMotion: () => VisualMotion
  systemTransparency: () => Transparency
  subscribe: (fn: () => void) => () => void
}

type MediaQueryListLike = Pick<MediaQueryList, 'matches' | 'addEventListener' | 'removeEventListener'>

const QUERIES = {
  mode: '(prefers-color-scheme: dark)',
  contrast: '(prefers-contrast: more)',
  motion: '(prefers-reduced-motion: reduce)',
  transparency: '(prefers-reduced-transparency: reduce)',
} as const

/** 每个系统轴只在这一处建立并订阅媒体查询。 */
export function createEnvSignals(win: Window | undefined = globalThis.window): EnvSignals {
  const query = (value: string): MediaQueryListLike | null =>
    typeof win?.matchMedia === 'function' ? win.matchMedia(value) : null
  const dark = query(QUERIES.mode)
  const more = query(QUERIES.contrast)
  const reducedMotion = query(QUERIES.motion)
  const reducedTransparency = query(QUERIES.transparency)
  const signals = [dark, more, reducedMotion, reducedTransparency]

  return {
    systemMode: () => (dark?.matches ? 'dark' : 'light'),
    systemContrast: () => (more?.matches ? 'more' : 'default'),
    systemMotion: () => (reducedMotion?.matches ? 'reduce' : 'default'),
    systemTransparency: () => (reducedTransparency?.matches ? 'reduce' : 'default'),
    subscribe(fn) {
      for (const signal of signals)
        signal?.addEventListener('change', fn)
      return () => {
        for (const signal of signals)
          signal?.removeEventListener('change', fn)
      }
    },
  }
}

/** SSR 回退：没有平台信号时使用七轴基线，不伪造系统能力。 */
export const SSR_ENV: EnvSignals = {
  systemMode: () => 'light',
  systemContrast: () => 'default',
  systemMotion: () => 'default',
  systemTransparency: () => 'default',
  subscribe: () => () => {},
}
