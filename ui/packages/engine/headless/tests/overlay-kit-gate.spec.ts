// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'

// 单测公共准备（tests/setup.ts）已经把 core 的浮层按需块取齐；这里每条用例都换一份新加载的 core 与浮层外壳，
// 量的是第一次打开时按需块还没到的那条路径。
type Core = typeof import('@xihan-ui/core')
type Shell = typeof import('../src/shared/overlay-shell')
type Tags = typeof import('../src/shared/selection-tags')

async function fresh(): Promise<{ core: Core, shell: Shell, tags: Tags }> {
  vi.resetModules()
  const core = await import('@xihan-ui/core')
  const shell = await import('../src/shared/overlay-shell')
  const tags = await import('../src/shared/selection-tags')
  return { core, shell, tags }
}

/** 一份可手动切换的展开态：track 收下的回调在 set 时同步重跑，与机器 tracker 一样。 */
function openState(initial: boolean): { get: () => boolean, set: (next: boolean) => void, track: (deps: unknown[], fn: () => void) => void } {
  let value = initial
  const listeners: Array<() => void> = []
  return {
    get: () => value,
    set: (next) => {
      value = next
      for (const fn of listeners) fn()
    },
    track: (_deps, fn) => {
      listeners.push(fn)
    },
  }
}

describe('浮层资源等按需块', () => {
  it('展开时按需块还没到：先不 acquire，到了按那一刻的展开态补上一次', async () => {
    const { core, shell } = await fresh()
    expect(core.overlayKit()).toBeNull()
    const open = openState(false)
    const release = vi.fn()
    const acquire = vi.fn(() => release)
    const stop = shell.trackPresenceResources({ presence: null, open: open.get, track: open.track, acquire })

    open.set(true)
    expect(acquire).not.toHaveBeenCalled()

    await core.loadOverlayKit()
    expect(acquire).toHaveBeenCalledOnce()

    open.set(false)
    expect(release).toHaveBeenCalledOnce()
    stop()
  })

  it('等的时候已经关掉：到了也不 acquire，不抢焦点', async () => {
    const { core, shell } = await fresh()
    const open = openState(false)
    const acquire = vi.fn(() => () => {})
    const stop = shell.trackPresenceResources({ presence: null, open: open.get, track: open.track, acquire })

    open.set(true)
    open.set(false)
    await core.loadOverlayKit()
    expect(acquire).not.toHaveBeenCalled()
    stop()
  })

  it('等的时候卸掉：到了不再 acquire', async () => {
    const { core, shell } = await fresh()
    const open = openState(true)
    const acquire = vi.fn(() => () => {})
    const stop = shell.trackPresenceResources({ presence: null, open: open.get, track: open.track, acquire })
    expect(acquire).not.toHaveBeenCalled()

    stop()
    await core.loadOverlayKit()
    expect(acquire).not.toHaveBeenCalled()
  })

  it('按需块已经到了：展开即同步 acquire，与静态引入时一致', async () => {
    const { core, shell } = await fresh()
    await core.loadOverlayKit()
    const open = openState(false)
    const acquire = vi.fn(() => () => {})
    const stop = shell.trackPresenceResources({ presence: null, open: open.get, track: open.track, acquire })

    open.set(true)
    expect(acquire).toHaveBeenCalledOnce()
    stop()
  })

  it('闸门：没到时 ready 为假并只排一次 retry；撤掉之后到了也不调', async () => {
    const { core, shell } = await fresh()
    const retry = vi.fn()
    const gate = shell.createOverlayKitGate(document)
    expect(gate.ready(retry)).toBe(false)
    expect(gate.ready(retry)).toBe(false)
    await core.loadOverlayKit()
    expect(retry).toHaveBeenCalledOnce()
    expect(gate.ready(retry)).toBe(true)

    const { core: again, shell: shellAgain } = await fresh()
    const cancelled = vi.fn()
    const late = shellAgain.createOverlayKitGate(document)
    expect(late.ready(cancelled)).toBe(false)
    late.dispose()
    await again.loadOverlayKit()
    expect(cancelled).not.toHaveBeenCalled()
  })

  it('建闸门即登记预取：文档上第一次有交互就在后台取，不必等到打开', async () => {
    const { core, shell } = await fresh()
    shell.createOverlayKitGate(document)
    await Promise.resolve()
    expect(core.overlayKit()).toBeNull()

    document.body.dispatchEvent(new Event('focusin', { bubbles: true }))
    await vi.waitFor(() => expect(core.overlayKit()).not.toBeNull())
  })

  it('多选标签动效：没到之前不接、不撤 data-instant，到了再接上', async () => {
    const { core, tags } = await fresh()
    const list = document.createElement('div')
    document.body.append(list)
    const onTracked = vi.fn()
    const stop = tags.trackSelectionTagMotion({ flush: fn => fn(), list: () => list, onTracked })

    await Promise.resolve()
    expect(onTracked).not.toHaveBeenCalled()

    await core.loadOverlayKit()
    expect(onTracked).toHaveBeenCalledOnce()
    stop()
    list.remove()
  })
})
