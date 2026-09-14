import type { EnvSignals } from '../src/runtime'
import { describe, expect, it } from 'vitest'
import {
  BASELINE_THEME,
  BASELINE_VISUAL_ENVIRONMENT,
  brandId,
  resolveTheme,
  resolveVisualEnvironment,
  toThemeAttrs,
  toVisualEnvironmentAttrs,
} from '../src/runtime'

function fakeEnv(mode: 'light' | 'dark' = 'dark', contrast: 'default' | 'more' = 'more'): EnvSignals {
  return {
    systemMode: () => mode,
    systemContrast: () => contrast,
    systemMotion: () => 'reduce',
    systemTransparency: () => 'reduce',
    subscribe: () => () => {},
  }
}

describe('resolveVisualEnvironment', () => {
  it('空偏好取七轴基线，system 只解析平台支持的四轴', () => {
    expect(resolveVisualEnvironment({}, fakeEnv())).toEqual(BASELINE_VISUAL_ENVIRONMENT)
    expect(resolveVisualEnvironment({
      mode: 'system',
      contrast: 'system',
      motion: 'system',
      transparency: 'system',
    }, fakeEnv())).toMatchObject({ mode: 'dark', contrast: 'more', motion: 'reduce', transparency: 'reduce' })
  })

  it('七轴一次投影成 PortalVisualBridge 的完整属性面', () => {
    expect(toVisualEnvironmentAttrs({
      mode: 'dark',
      brand: brandId('acme'),
      density: 'compact',
      dir: 'rtl',
      contrast: 'more',
      motion: 'reduce',
      transparency: 'reduce',
    })).toEqual({
      'data-theme': 'dark',
      'data-brand': 'acme',
      'data-density': 'compact',
      'data-contrast': 'more',
      'data-motion': 'reduce',
      'data-transparency': 'reduce',
      'dir': 'rtl',
    })
  })
})

describe('resolveTheme', () => {
  it('空偏好 → 基线', () => {
    expect(resolveTheme({}, fakeEnv())).toEqual(BASELINE_THEME)
  })

  it('undefined 维度继承父作用域', () => {
    const parent = { ...BASELINE_THEME, mode: 'dark' as const, density: 'compact' as const }
    const s = resolveTheme({ dir: 'rtl' }, fakeEnv('light'), parent)
    expect(s.mode).toBe('dark') // 继承父
    expect(s.density).toBe('compact') // 继承父
    expect(s.dir).toBe('rtl') // 显式覆盖
  })

  it('system 折算成媒体查询（仅 mode/contrast）', () => {
    const s = resolveTheme({ mode: 'system', contrast: 'system' }, fakeEnv('dark', 'more'))
    expect(s.mode).toBe('dark')
    expect(s.contrast).toBe('more')
  })

  it('显式值优先于 system', () => {
    const s = resolveTheme({ mode: 'light' }, fakeEnv('dark'))
    expect(s.mode).toBe('light')
  })

  it('toThemeAttrs 五属性恒写', () => {
    const attrs = toThemeAttrs({ mode: 'dark', brand: brandId('acme'), density: 'compact', dir: 'rtl', contrast: 'more' })
    expect(attrs).toEqual({
      'data-theme': 'dark',
      'data-brand': 'acme',
      'data-density': 'compact',
      'data-contrast': 'more',
      'dir': 'rtl',
    })
  })
})
