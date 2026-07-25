// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyThemeAttrs, brandId, createThemeController } from '../src/runtime'

afterEach(() => {
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('data-brand')
  document.documentElement.removeAttribute('data-density')
  document.documentElement.removeAttribute('data-contrast')
  document.documentElement.removeAttribute('dir')
  localStorage.clear()
})

describe('applyThemeAttrs', () => {
  it('写全五属性，仅在变化时触碰 DOM', () => {
    const el = document.createElement('div')
    applyThemeAttrs(el, { mode: 'dark', brand: brandId('xihan'), density: 'comfortable', dir: 'ltr', contrast: 'base' })
    expect(el.getAttribute('data-theme')).toBe('dark')
    expect(el.getAttribute('data-brand')).toBe('xihan')
    expect(el.getAttribute('dir')).toBe('ltr')

    const spy = vi.spyOn(el, 'setAttribute')
    applyThemeAttrs(el, { mode: 'dark', brand: brandId('xihan'), density: 'comfortable', dir: 'ltr', contrast: 'base' })
    expect(spy).not.toHaveBeenCalled() // 值未变，不触碰 DOM
  })
})

describe('createThemeController', () => {
  it('初始应用到根 + setPreference 更新 + subscribe', () => {
    const changes: string[] = []
    const c = createThemeController({ initial: { mode: 'dark' } })
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    c.subscribe(s => changes.push(s.mode))
    c.setPreference({ mode: 'light' })
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(changes).toEqual(['light'])
    c.dispose()
  })

  it('偏好持久化到 storage', () => {
    const c1 = createThemeController({ storageKey: 'xh-theme', initial: { density: 'compact' } })
    c1.setPreference({ mode: 'dark' })
    c1.dispose()

    // 新控制器从 storage 恢复
    const c2 = createThemeController({ storageKey: 'xh-theme' })
    expect(c2.getState().mode).toBe('dark')
    expect(c2.getState().density).toBe('compact')
    c2.dispose()
  })
})
