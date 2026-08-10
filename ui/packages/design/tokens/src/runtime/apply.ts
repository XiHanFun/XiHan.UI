import type { ThemeAttrs, ThemeState } from './types'

/** 五维状态 → DOM 属性集合。 */
export function toThemeAttrs(state: ThemeState): ThemeAttrs {
  return {
    'data-theme': state.mode,
    'data-brand': state.brand,
    'data-density': state.density,
    'data-contrast': state.contrast,
    'dir': state.dir,
  }
}

/** 幂等地把五个属性写到元素上；仅在值真正变化时触碰 DOM。 */
export function applyThemeAttrs(el: Element, state: ThemeState): void {
  const attrs = toThemeAttrs(state)
  for (const [name, value] of Object.entries(attrs)) {
    if (el.getAttribute(name) !== value)
      el.setAttribute(name, value)
  }
}
