// @vitest-environment jsdom
// 退场途中又打开：资源原样复用，失活的焦点域由 trackPresenceResources 在提交之后的下一帧重新激活。
// 那一帧之前又关上、或者卸载了，就不再激活；第一次打开本来就是新建的焦点域，不用激活。
import type { ExitLease } from '@xihan-ui/core/presence'
import type { OverlayRelease } from '../src/shared/overlay-shell'
import { createPresence } from '@xihan-ui/core/presence'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { trackPresenceResources } from '../src/shared/overlay-shell'

const cleanups: Array<() => void> = []

afterEach(() => {
  for (const dispose of cleanups.splice(0).reverse()) dispose()
})

function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

function harness() {
  let open = true
  let tracked: (() => void) | null = null
  const presence = createPresence({ open: true, onRenderedChange: () => {} })
  // 退场要播一段：申一张租约挂着，宿主那一侧 rendered 一直为真
  const leases: ExitLease[] = []
  presence.onBeforeExit(() => leases.push(presence.claimExit('test exit')))
  const reactivate = vi.fn()
  const release: OverlayRelease = Object.assign(vi.fn(), { reactivate })
  const stop = trackPresenceResources({
    presence,
    open: () => open,
    track: (_deps, fn) => {
      tracked = fn
    },
    acquire: () => release,
    flush: fn => fn(),
    scope: { getWin: () => window },
  })
  cleanups.push(stop, () => presence.dispose())
  const set = (next: boolean): void => {
    open = next
    // 宿主在 data-state 提交之后告诉 Presence；机器的 tracker 随后同步
    presence.update(next)
    tracked?.()
  }
  return { reactivate, release, set, stop }
}

describe('trackPresenceResources 的重新激活', () => {
  it('第一次打开不激活：焦点域是新建的', async () => {
    const h = harness()
    await nextFrame()
    expect(h.reactivate).not.toHaveBeenCalled()
  })

  it('退场途中重开：下一帧重新激活一次，资源没有重建', async () => {
    const h = harness()
    h.set(false)
    h.set(true)
    expect(h.reactivate).not.toHaveBeenCalled()
    await nextFrame()
    expect(h.reactivate).toHaveBeenCalledTimes(1)
    expect(h.release).not.toHaveBeenCalled()
  })

  it('重开之后、那一帧之前又关上：不激活', async () => {
    const h = harness()
    h.set(false)
    h.set(true)
    h.set(false)
    await nextFrame()
    expect(h.reactivate).not.toHaveBeenCalled()
  })

  it('重开之后、那一帧之前卸载：不激活', async () => {
    const h = harness()
    h.set(false)
    h.set(true)
    h.stop()
    await nextFrame()
    expect(h.reactivate).not.toHaveBeenCalled()
  })
})
