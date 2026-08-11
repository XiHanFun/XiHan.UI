// 本文件不加 @vitest-environment，跑在默认的 node 环境里：无 window 的宿主。
import { describe, expect, it, vi } from 'vitest'
import { onReducedMotionChange, prefersReducedMotion } from '../src/reduced-motion'

describe('无 window 的宿主', () => {
  it('prefersReducedMotion 不抛，按不降级返回 false', () => {
    expect(globalThis.window).toBeUndefined()
    expect(() => prefersReducedMotion()).not.toThrow()
    expect(prefersReducedMotion()).toBe(false)
  })

  it('onReducedMotionChange 不抛，返回可安全调用的空退订', () => {
    const fn = vi.fn()
    let off: (() => void) | undefined
    expect(() => {
      off = onReducedMotionChange(fn)
    }).not.toThrow()
    expect(() => off?.()).not.toThrow()
    expect(fn).not.toHaveBeenCalled()
  })
})

describe('显式传入窗口', () => {
  it('按 matchMedia 的结果回答', () => {
    const win = { matchMedia: () => ({ matches: true }) } as unknown as Window
    expect(prefersReducedMotion(win)).toBe(true)
  })

  it('订阅与退订都打到传入窗口的 mql 上', () => {
    const add = vi.fn()
    const remove = vi.fn()
    const mql = { matches: false, addEventListener: add, removeEventListener: remove }
    const win = { matchMedia: () => mql } as unknown as Window

    const fn = vi.fn()
    const off = onReducedMotionChange(fn, win)
    expect(add).toHaveBeenCalledTimes(1)

    mql.matches = true
    add.mock.calls[0][1]()
    expect(fn).toHaveBeenCalledWith(true)

    off()
    expect(remove).toHaveBeenCalledTimes(1)
  })
})
