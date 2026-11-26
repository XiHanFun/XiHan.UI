// @vitest-environment jsdom
// 退场闸门：可见与否跟着 presence 走，展开时按需等浮层按需块；三个适配器共用这一份。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createExitGate } from '../src/behavior/presence'

const kit = vi.hoisted(() => ({
  loaded: false,
  waiting: [] as Array<() => void>,
}))

vi.mock('../src/kernel/structure/overlay-kit', () => ({
  overlayKit: () => (kit.loaded ? {} : null),
  whenOverlayKit: (run: () => void) => {
    if (kit.loaded) {
      run()
      return () => {}
    }
    kit.waiting.push(run)
    return () => {
      kit.waiting = kit.waiting.filter(entry => entry !== run)
    }
  },
}))

function arrive(): void {
  kit.loaded = true
  for (const run of kit.waiting.splice(0)) run()
}

beforeEach(() => {
  kit.loaded = false
  kit.waiting = []
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('createExitGate', () => {
  it('建的时候就开着的不等按需块，照常可见', () => {
    const ready = vi.fn()
    const gate = createExitGate({ open: true, onExitComplete: vi.fn(), onOverlayKitReady: ready })
    gate.update(true)
    expect(gate.visible).toBe(true)
    expect(kit.waiting).toHaveLength(0)
    gate.dispose()
  })

  it('之后才展开、按需块还没到：先藏着，到了带上此刻的可见值回调宿主', () => {
    const ready = vi.fn()
    const gate = createExitGate({ open: false, onExitComplete: vi.fn(), onOverlayKitReady: ready })
    gate.update(true)
    expect(gate.presence.rendered).toBe(true)
    expect(gate.visible).toBe(false)
    arrive()
    expect(ready).toHaveBeenCalledExactlyOnceWith(true)
    expect(gate.visible).toBe(true)
    gate.dispose()
  })

  it('等按需块的途中又收起了：到了照样回调，带的可见值是 false', () => {
    const node = document.createElement('div')
    document.body.append(node)
    const ready = vi.fn()
    const gate = createExitGate({ open: false, onExitComplete: vi.fn(), onOverlayKitReady: ready })
    gate.track(node)
    gate.update(true)
    gate.update(false)
    arrive()
    expect(ready).toHaveBeenCalledExactlyOnceWith(false)
    expect(gate.visible).toBe(false)
    gate.dispose()
  })

  it('收起过一次就撤掉建闸门时的豁免，再展开时照常等', () => {
    const gate = createExitGate({ open: true, onExitComplete: vi.fn(), onOverlayKitReady: vi.fn() })
    gate.update(false)
    gate.update(true)
    expect(gate.visible).toBe(false)
    expect(kit.waiting).toHaveLength(1)
    gate.dispose()
  })

  it('hold 只做按需块的判定，展开那一帧渲染之前就能藏住；随后的 update 不再重复排队', () => {
    const gate = createExitGate({ open: false, onExitComplete: vi.fn(), onOverlayKitReady: vi.fn() })
    gate.hold(true)
    expect(gate.presence.rendered).toBe(false)
    expect(kit.waiting).toHaveLength(1)
    gate.update(true)
    expect(kit.waiting).toHaveLength(1)
    expect(gate.visible).toBe(false)
    gate.dispose()
  })

  it('没给 onOverlayKitReady 的浮层不等按需块', () => {
    const gate = createExitGate({ open: false, onExitComplete: vi.fn() })
    gate.update(true)
    expect(gate.visible).toBe(true)
    expect(kit.waiting).toHaveLength(0)
    gate.dispose()
  })

  it('没有退场动画的节点收起即播完，回调宿主一次', () => {
    const node = document.createElement('div')
    document.body.append(node)
    const complete = vi.fn()
    const gate = createExitGate({ open: true, onExitComplete: complete })
    gate.track(node)
    gate.update(false)
    expect(gate.visible).toBe(false)
    expect(complete).toHaveBeenCalledTimes(1)
    gate.dispose()
  })

  it('离场即结清：在排的按需块撤掉，之后的调用都是空操作，visible 归 false', () => {
    const ready = vi.fn()
    const complete = vi.fn()
    const gate = createExitGate({ open: false, onExitComplete: complete, onOverlayKitReady: ready })
    gate.update(true)
    gate.dispose()
    gate.dispose()
    expect(kit.waiting).toHaveLength(0)
    arrive()
    gate.update(false)
    expect(ready).not.toHaveBeenCalled()
    expect(complete).not.toHaveBeenCalled()
    expect(gate.visible).toBe(false)
  })
})
