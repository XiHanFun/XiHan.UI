/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 apply 相关实现。

import type {
  ThemeAttrs,
  ThemeState,
  VisualEnvironmentAttrs,
  VisualEnvironmentState,
} from './types'

export const VISUAL_ENVIRONMENT_ATTRIBUTES = [
  'data-theme',
  'data-brand',
  'data-density',
  'data-contrast',
  'data-motion',
  'data-transparency',
  'data-material',
  'dir',
] as const satisfies ReadonlyArray<keyof VisualEnvironmentAttrs>

/** 八轴状态 → Portal 可桥接的 DOM 属性。 */
export function toVisualEnvironmentAttrs(state: VisualEnvironmentState): VisualEnvironmentAttrs {
  return {
    'data-theme': state.mode,
    'data-brand': state.brand,
    'data-density': state.density,
    'data-contrast': state.contrast,
    'data-motion': state.motion,
    'data-transparency': state.transparency,
    'data-material': state.material,
    'dir': state.dir,
  }
}

/** 幂等投影八轴；一次 set 的所有轴在一次同步提交里落到同一个 scope。 */
export function applyVisualEnvironmentAttrs(el: Element, state: VisualEnvironmentState): void {
  const attrs = toVisualEnvironmentAttrs(state)
  for (const name of VISUAL_ENVIRONMENT_ATTRIBUTES) {
    const value = attrs[name]
    if (el.getAttribute(name) !== value)
      el.setAttribute(name, value)
  }
}

/** 五轴兼容视图的纯投影。 */
export function toThemeAttrs(state: ThemeState): ThemeAttrs {
  const attrs = toVisualEnvironmentAttrs({
    ...state,
    motion: 'default',
    transparency: 'default',
    material: 'standard',
  })
  return {
    'data-theme': attrs['data-theme'],
    'data-brand': attrs['data-brand'],
    'data-density': attrs['data-density'],
    'data-contrast': attrs['data-contrast'],
    'dir': attrs.dir,
  }
}

/** 旧的五轴 DOM helper 保持五轴边界，不覆盖局部 motion / transparency / material。 */
export function applyThemeAttrs(el: Element, state: ThemeState): void {
  const attrs = toThemeAttrs(state)
  for (const [name, value] of Object.entries(attrs)) {
    if (el.getAttribute(name) !== value)
      el.setAttribute(name, value)
  }
}
