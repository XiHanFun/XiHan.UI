// 本文件不加 @vitest-environment，跑在默认的 node 环境里：无 window 的宿主。
import { describe, expect, it, vi } from 'vitest'
import { createEnvSignals, createVisualEnvironmentController } from '../src/runtime'

describe('无 window 的宿主', () => {
  it('createEnvSignals 不抛，四个系统轴回落基线', () => {
    expect(globalThis.window).toBeUndefined()
    expect(() => createEnvSignals()).not.toThrow()

    const env = createEnvSignals()
    expect(env.systemMode()).toBe('light')
    expect(env.systemContrast()).toBe('default')
    expect(env.systemMotion()).toBe('default')
    expect(env.systemTransparency()).toBe('default')
    expect(() => env.subscribe(() => {})()).not.toThrow()
  })

  it('visualEnvironmentController 可在 SSR 中更新纯状态', () => {
    const controller = createVisualEnvironmentController({ initial: { mode: 'dark' } })
    expect(controller.getState().mode).toBe('dark')
    controller.setPreference({ contrast: 'more' })
    expect(controller.getState().contrast).toBe('more')
    controller.dispose()
  })

  it('ssr 启用 storageKey 时显式报告 read/write 不可用', () => {
    const errors: Array<{ operation: string, key: string }> = []
    const controller = createVisualEnvironmentController({
      storageKey: 'xh-visual',
      onStorageError: detail => errors.push(detail),
    })
    controller.setPreference({ mode: 'dark' })
    expect(errors).toEqual([
      expect.objectContaining({ operation: 'read', key: 'xh-visual' }),
      expect.objectContaining({ operation: 'write', key: 'xh-visual' }),
    ])
    controller.dispose()
  })
})

describe('显式传入窗口', () => {
  it('四条平台媒体查询各自回答，订阅与退订都打到 mql 上', () => {
    const add = vi.fn()
    const remove = vi.fn()
    const mqls: Record<string, { matches: boolean, addEventListener: typeof add, removeEventListener: typeof remove }> = {
      '(prefers-color-scheme: dark)': { matches: true, addEventListener: add, removeEventListener: remove },
      '(prefers-contrast: more)': { matches: false, addEventListener: add, removeEventListener: remove },
      '(prefers-reduced-motion: reduce)': { matches: true, addEventListener: add, removeEventListener: remove },
      '(prefers-reduced-transparency: reduce)': { matches: true, addEventListener: add, removeEventListener: remove },
    }
    const win = { matchMedia: (q: string) => mqls[q] } as unknown as Window

    const env = createEnvSignals(win)
    expect(env.systemMode()).toBe('dark')
    expect(env.systemContrast()).toBe('default')
    expect(env.systemMotion()).toBe('reduce')
    expect(env.systemTransparency()).toBe('reduce')

    const off = env.subscribe(() => {})
    expect(add).toHaveBeenCalledTimes(4)
    off()
    expect(remove).toHaveBeenCalledTimes(4)
  })
})
