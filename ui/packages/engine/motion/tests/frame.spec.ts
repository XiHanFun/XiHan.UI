import { describe, expect, it, vi } from 'vitest'
import { frameLoop, frameNow } from '../src/frame'

/** 手动推进的 rAF 宿主。 */
function createHost(): {
  win: Window
  tick: () => void
  pending: () => number
  cancelled: number[]
} {
  const queue = new Map<number, () => void>()
  const cancelled: number[] = []
  let nextId = 1

  const win = {
    requestAnimationFrame: (fn: () => void) => {
      const id = nextId++
      queue.set(id, fn)
      return id
    },
    cancelAnimationFrame: (id: number) => {
      cancelled.push(id)
      queue.delete(id)
    },
  } as unknown as Window

  return {
    win,
    tick: () => {
      const entries = [...queue.entries()]
      queue.clear()
      for (const [, fn] of entries) fn()
    },
    pending: () => queue.size,
    cancelled,
  }
}

describe('frameNow', () => {
  it('有 performance 时用它', () => {
    const win = { performance: { now: () => 1234 } } as unknown as Window
    expect(frameNow(win)).toBe(1234)
  })

  it('没有 performance 时退回 Date', () => {
    const win = {} as unknown as Window
    expect(frameNow(win)).toBeTypeOf('number')
  })

  it('performance 存在但 now 不是函数时也退回 Date', () => {
    const win = { performance: {} } as unknown as Window
    expect(frameNow(win)).toBeTypeOf('number')
  })
})

describe('frameLoop', () => {
  it('逐帧回调，直到停掉', () => {
    const host = createHost()
    const onFrame = vi.fn()
    const stop = frameLoop(host.win, onFrame)

    host.tick()
    host.tick()
    expect(onFrame).toHaveBeenCalledTimes(2)

    stop()
    host.tick()
    expect(onFrame).toHaveBeenCalledTimes(2)
  })

  it('回调里当场停掉，不会再排下一帧', () => {
    const host = createHost()
    let stop = (): void => {}
    const onFrame = vi.fn(() => stop())
    stop = frameLoop(host.win, onFrame)

    host.tick()
    expect(onFrame).toHaveBeenCalledTimes(1)
    expect(host.pending()).toBe(0)

    host.tick()
    expect(onFrame).toHaveBeenCalledTimes(1)
  })

  it('重复停掉不抛', () => {
    const host = createHost()
    const stop = frameLoop(host.win, () => {})
    expect(() => {
      stop()
      stop()
    }).not.toThrow()
  })

  it('停掉后队列里不留待跑的帧', () => {
    const host = createHost()
    const stop = frameLoop(host.win, () => {})
    stop()
    expect(host.pending()).toBe(0)
  })
})
