import type { Cleanup, Disposable, RuntimeConfig } from '@xihan-ui/core'
import type { PresenceEvent, PresenceState } from './presence-machine'
import { nextPresence } from './presence-machine'

export interface ExitLease {
  /** 退场已完成，归还租约。幂等。 */
  done: () => void
  /** 退场被打断（又被重新打开），归还租约且不卸载。幂等。 */
  cancel: () => void
  readonly settled: boolean
}

export interface PresenceHandle extends Disposable {
  /** 逻辑状态：是否应该开着。 */
  readonly open: boolean
  /** 渲染状态：宿主此刻是否应保留 DOM。 */
  readonly rendered: boolean
  /** 直接绑到 DOM 的 data-state 值。 */
  readonly state: 'open' | 'closed'
  /** 申领一张退出租约；只在 open === false 时有意义。 */
  claimExit: (reason: string, timeoutMs?: number) => ExitLease
  /** 退场彻底完成（所有租约归还）时回调。 */
  onExitComplete: (fn: () => void) => Cleanup
  /** 退场开始前（同步）调用；动画探测器在此申领租约。 */
  onBeforeExit: (fn: () => void) => Cleanup
  /** 适配器在 open 变化、且 data-state 已提交到 DOM 之后调用。 */
  update: (open: boolean) => void
}

export interface PresenceOptions {
  config: RuntimeConfig
  open: boolean
  onRenderedChange: (rendered: boolean) => void
}

const SETTLED_LEASE: ExitLease = {
  done: () => {},
  cancel: () => {},
  settled: true,
}

export function createPresence(o: PresenceOptions): PresenceHandle {
  const { config, onRenderedChange } = o
  let state: PresenceState = o.open ? 'mounted' : 'unmounted'
  let open = o.open
  let disposed = false

  interface LeaseEntry {
    settle: (event?: PresenceEvent) => void
  }
  const leases = new Set<LeaseEntry>()
  const exitCompleteFns = new Set<() => void>()
  const beforeExitFns = new Set<() => void>()

  function transition(e: PresenceEvent): void {
    const prev = state
    state = nextPresence(state, e)
    if (state === prev)
      return
    onRenderedChange(state !== 'unmounted')
    if (state === 'unmounted') {
      for (const fn of [...exitCompleteFns]) fn()
    }
  }

  function claimExit(_reason: string, timeoutMs?: number): ExitLease {
    if (config.reducedMotion())
      return SETTLED_LEASE

    transition('EXIT_CLAIMED')
    let settled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const entry: LeaseEntry = {
      // event 存在则在最后一张租约归还时触发转移；缺省（打断）只归还不卸载
      settle(event) {
        if (settled)
          return
        settled = true
        if (timer)
          clearTimeout(timer)
        leases.delete(entry)
        if (event && leases.size === 0)
          transition(event)
      },
    }
    leases.add(entry)

    if (timeoutMs != null && timeoutMs >= 0)
      timer = setTimeout(() => entry.settle('ALL_LEASES_DONE'), timeoutMs)

    return {
      get settled() {
        return settled
      },
      done: () => entry.settle('ALL_LEASES_DONE'),
      cancel: () => entry.settle(),
    }
  }

  function update(nextOpen: boolean): void {
    if (disposed || nextOpen === open)
      return
    open = nextOpen
    if (open) {
      for (const l of [...leases]) l.settle()
      leases.clear()
      transition('OPEN')
      return
    }
    // 关闭：给动画探测器一个同步窗口去申领租约
    for (const fn of [...beforeExitFns]) fn()
    if (leases.size === 0)
      transition('CLOSE_NO_LEASE')
  }

  return {
    get open() {
      return open
    },
    get rendered() {
      return state !== 'unmounted'
    },
    get state() {
      return open ? 'open' : 'closed'
    },
    claimExit,
    onExitComplete(fn) {
      exitCompleteFns.add(fn)
      return () => void exitCompleteFns.delete(fn)
    },
    onBeforeExit(fn) {
      beforeExitFns.add(fn)
      return () => void beforeExitFns.delete(fn)
    },
    update,
    dispose() {
      if (disposed)
        return
      disposed = true
      for (const l of [...leases]) l.settle()
      leases.clear()
      exitCompleteFns.clear()
      beforeExitFns.clear()
    },
  }
}
