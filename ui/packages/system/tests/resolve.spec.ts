import type { EnvSignals } from '../src/runtime'
import { describe, expect, it } from 'vitest'
import { BASELINE_THEME, brandId, resolveTheme, toThemeAttrs } from '../src/runtime'

function fakeEnv(mode: 'light' | 'dark' = 'dark', contrast: 'base' | 'more' = 'more'): EnvSignals {
  return { systemMode: () => mode, systemContrast: () => contrast, subscribe: () => () => {} }
}

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
