import type { RuntimeConfig } from '@xihan-ui/core'
import { describe, expect, it, vi } from 'vitest'
import { createPresence, nextPresence } from '../src/presence'

function fakeConfig(reducedMotion = false): RuntimeConfig {
  return { reducedMotion: () => reducedMotion } as RuntimeConfig
}

describe('nextPresence 三态机', () => {
  it('mounted 分支', () => {
    expect(nextPresence('mounted', 'EXIT_CLAIMED')).toBe('exiting')
    expect(nextPresence('mounted', 'CLOSE_NO_LEASE')).toBe('unmounted')
    expect(nextPresence('mounted', 'OPEN')).toBe('mounted')
  })
  it('exiting 分支', () => {
    expect(nextPresence('exiting', 'ALL_LEASES_DONE')).toBe('unmounted')
    expect(nextPresence('exiting', 'OPEN')).toBe('mounted')
  })
  it('unmounted 分支', () => {
    expect(nextPresence('unmounted', 'OPEN')).toBe('mounted')
    expect(nextPresence('unmounted', 'CLOSE_NO_LEASE')).toBe('unmounted')
  })
})

describe('createPresence', () => {
  it('无租约关闭立即卸载', () => {
    const onRenderedChange = vi.fn()
    const p = createPresence({ config: fakeConfig(), open: true, onRenderedChange })
    expect(p.rendered).toBe(true)
    expect(p.state).toBe('open')
    p.update(false)
    expect(p.rendered).toBe(false)
    expect(p.state).toBe('closed')
    expect(onRenderedChange).toHaveBeenLastCalledWith(false)
  })

  it('有退出租约时保留 DOM，直到租约归还', () => {
    const p = createPresence({ config: fakeConfig(), open: true, onRenderedChange: () => {} })
    let lease: ReturnType<typeof p.claimExit> | undefined
    p.onBeforeExit(() => {
      lease = p.claimExit('anim')
    })
    p.update(false)
    expect(p.rendered).toBe(true) // 退场中
    lease!.done()
    expect(p.rendered).toBe(false) // 卸载
  })

  it('退场中被重新打开 → 取消租约、回到挂载', () => {
    const p = createPresence({ config: fakeConfig(), open: true, onRenderedChange: () => {} })
    let lease: ReturnType<typeof p.claimExit> | undefined
    p.onBeforeExit(() => {
      lease = p.claimExit('anim')
    })
    p.update(false)
    expect(p.rendered).toBe(true)
    p.update(true)
    expect(p.open).toBe(true)
    expect(p.rendered).toBe(true)
    expect(lease!.settled).toBe(true)
  })

  it('reducedMotion 时退出租约已 settle，立即卸载', () => {
    const p = createPresence({ config: fakeConfig(true), open: true, onRenderedChange: () => {} })
    p.onBeforeExit(() => {
      const lease = p.claimExit('anim')
      expect(lease.settled).toBe(true)
    })
    p.update(false)
    expect(p.rendered).toBe(false)
  })

  it('onExitComplete 在卸载时触发一次', () => {
    const done = vi.fn()
    const p = createPresence({ config: fakeConfig(), open: true, onRenderedChange: () => {} })
    p.onExitComplete(done)
    p.update(false)
    expect(done).toHaveBeenCalledTimes(1)
  })
})
