// 本文件不加 @vitest-environment，跑在默认的 node 环境里：无 window 的宿主。
import { describe, expect, it, vi } from 'vitest'
import { createEnvSignals } from '../src/runtime'

describe('无 window 的宿主', () => {
  it('createEnvSignals 不抛，回落成浅色 + 基线对比度', () => {
    expect(globalThis.window).toBeUndefined()
    expect(() => createEnvSignals()).not.toThrow()

    const env = createEnvSignals()
    expect(env.systemMode()).toBe('light')
    expect(env.systemContrast()).toBe('base')
    expect(() => env.subscribe(() => {})()).not.toThrow()
  })
})

describe('显式传入窗口', () => {
  it('两条媒体查询各自回答，订阅与退订都打到 mql 上', () => {
    const add = vi.fn()
    const remove = vi.fn()
    const mqls: Record<string, { matches: boolean, addEventListener: typeof add, removeEventListener: typeof remove }> = {
      '(prefers-color-scheme: dark)': { matches: true, addEventListener: add, removeEventListener: remove },
      '(prefers-contrast: more)': { matches: false, addEventListener: add, removeEventListener: remove },
    }
    const win = { matchMedia: (q: string) => mqls[q] } as unknown as Window

    const env = createEnvSignals(win)
    expect(env.systemMode()).toBe('dark')
    expect(env.systemContrast()).toBe('base')

    const off = env.subscribe(() => {})
    expect(add).toHaveBeenCalledTimes(2)
    off()
    expect(remove).toHaveBeenCalledTimes(2)
  })
})
