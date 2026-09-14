// 本文件不加 @vitest-environment，跑在默认的 node 环境里：无 window 的宿主。
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getMotionOverride,
  getMotionPreference,
  onMotionPreferenceChange,
  onReducedMotionChange,
  prefersReducedMotion,
  resolveMotionPreference,
  setMotionOverride,
} from '../src/reduced-motion'

/** 造一个可手动翻转的 matchMedia 宿主。 */
function createHost(matches = false): {
  win: Window
  set: (value: boolean) => void
  listeners: number
} {
  const handlers = new Set<() => void>()
  const mql = {
    matches,
    addEventListener: (_: string, fn: () => void) => handlers.add(fn),
    removeEventListener: (_: string, fn: () => void) => handlers.delete(fn),
  }
  const win = { matchMedia: () => mql } as unknown as Window
  return {
    win,
    set: (value: boolean) => {
      mql.matches = value
      for (const fn of [...handlers]) fn()
    },
    get listeners() {
      return handlers.size
    },
  }
}

afterEach(() => {
  setMotionOverride(null)
})

describe('无 window 的宿主', () => {
  it('prefersReducedMotion 按不降级返回 false', () => {
    expect(globalThis.window).toBeUndefined()
    expect(prefersReducedMotion()).toBe(false)
  })

  it('getMotionPreference 同样按不降级返回 no-preference', () => {
    expect(getMotionPreference()).toBe('no-preference')
    expect(resolveMotionPreference()).toBe('no-preference')
  })

  it('onReducedMotionChange 不抛，返回可安全调用的空退订', () => {
    const fn = vi.fn()
    const off = onReducedMotionChange(fn)
    expect(() => off()).not.toThrow()
    expect(fn).not.toHaveBeenCalled()
  })
})

describe('系统偏好', () => {
  it('跟着 matchMedia 走', () => {
    expect(getMotionPreference(createHost(true).win)).toBe('reduce')
    expect(getMotionPreference(createHost(false).win)).toBe('no-preference')
  })
})

describe('应用级 override', () => {
  it('未设置时为 null，最终偏好取系统的', () => {
    const host = createHost(false)
    expect(getMotionOverride()).toBeNull()
    expect(resolveMotionPreference(host.win)).toBe('no-preference')
  })

  it('压过系统设置的两个方向', () => {
    const reduced = createHost(true)
    const normal = createHost(false)

    setMotionOverride('no-preference')
    expect(resolveMotionPreference(reduced.win)).toBe('no-preference')

    setMotionOverride('reduce')
    expect(resolveMotionPreference(normal.win)).toBe('reduce')
  })

  it('传 null 交还给系统', () => {
    const host = createHost(true)
    setMotionOverride('no-preference')
    setMotionOverride(null)
    expect(getMotionOverride()).toBeNull()
    expect(resolveMotionPreference(host.win)).toBe('reduce')
  })

  it('无 window 时 override 仍然生效', () => {
    setMotionOverride('no-preference')
    expect(resolveMotionPreference()).toBe('no-preference')
  })
})

describe('最终偏好的订阅', () => {
  it('系统翻转时回调', () => {
    const host = createHost(false)
    const fn = vi.fn()
    const off = onMotionPreferenceChange(fn, host.win)

    host.set(true)
    expect(fn).toHaveBeenCalledWith('reduce')

    off()
  })

  it('override 改动时回调', () => {
    const host = createHost(false)
    const fn = vi.fn()
    const off = onMotionPreferenceChange(fn, host.win)

    setMotionOverride('reduce')
    expect(fn).toHaveBeenCalledWith('reduce')

    off()
  })

  it('最终值没变就不回调', () => {
    const host = createHost(true)
    const fn = vi.fn()
    const off = onMotionPreferenceChange(fn, host.win)

    // override 与系统同值
    setMotionOverride('reduce')
    expect(fn).not.toHaveBeenCalled()

    // 系统翻转但被 override 压住
    host.set(false)
    expect(fn).not.toHaveBeenCalled()

    off()
  })

  it('override 压住期间的系统变化，在交还系统时才浮现', () => {
    const host = createHost(false)
    const fn = vi.fn()
    const off = onMotionPreferenceChange(fn, host.win)

    setMotionOverride('no-preference')
    host.set(true)
    expect(fn).not.toHaveBeenCalled()

    setMotionOverride(null)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('reduce')

    off()
  })

  it('退订之后系统与 override 都不再回调', () => {
    const host = createHost(false)
    const fn = vi.fn()
    const off = onMotionPreferenceChange(fn, host.win)
    off()

    expect(host.listeners).toBe(0)
    host.set(true)
    setMotionOverride('reduce')
    expect(fn).not.toHaveBeenCalled()
  })

  it('多个订阅者各自独立结算', () => {
    const host = createHost(false)
    const first = vi.fn()
    const second = vi.fn()
    const offFirst = onMotionPreferenceChange(first, host.win)
    const offSecond = onMotionPreferenceChange(second, host.win)

    offFirst()
    setMotionOverride('reduce')
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith('reduce')

    offSecond()
  })
})
