// 粗指针探测共用一个 MediaQueryList：订阅方再多，窗口里也只有一个媒体查询与一个 change 监听。
import { describe, expect, it, vi } from 'vitest'
import { watchCoarsePointer } from '../src/shared/coarse-pointer'

function fakeWindow(matches = false) {
  const listeners = new Set<() => void>()
  const query = {
    matches,
    addEventListener: vi.fn((_: string, fn: () => void) => listeners.add(fn)),
    removeEventListener: vi.fn((_: string, fn: () => void) => listeners.delete(fn)),
  }
  const win = { matchMedia: vi.fn(() => query) } as unknown as Window
  const change = (next: boolean): void => {
    query.matches = next
    for (const fn of [...listeners]) fn()
  }
  return { win, query, listeners, change }
}

describe('watchCoarsePointer', () => {
  it('订阅即同步报一次当前值', () => {
    const { win } = fakeWindow(true)
    const seen: boolean[] = []
    watchCoarsePointer(win, coarse => seen.push(coarse))
    expect(seen).toEqual([true])
  })

  it('多个订阅方共用一个媒体查询与一个 change 监听，设备切换时一起收到', () => {
    const { win, query, listeners, change } = fakeWindow(false)
    const a: boolean[] = []
    const b: boolean[] = []
    watchCoarsePointer(win, coarse => a.push(coarse))
    watchCoarsePointer(win, coarse => b.push(coarse))
    expect((win.matchMedia as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(1)
    expect(query.addEventListener).toHaveBeenCalledTimes(1)
    expect(listeners.size).toBe(1)
    change(true)
    expect(a).toEqual([false, true])
    expect(b).toEqual([false, true])
  })

  it('最后一个订阅方撤走时摘掉 change 监听，下次订阅重新建', () => {
    const { win, listeners } = fakeWindow()
    const stopA = watchCoarsePointer(win, () => {})!
    const stopB = watchCoarsePointer(win, () => {})!
    stopA()
    expect(listeners.size).toBe(1)
    stopB()
    expect(listeners.size).toBe(0)
    watchCoarsePointer(win, () => {})
    expect((win.matchMedia as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(2)
  })

  it('没有 matchMedia 的环境返回 null', () => {
    expect(watchCoarsePointer({} as Window, () => {})).toBeNull()
  })
})
