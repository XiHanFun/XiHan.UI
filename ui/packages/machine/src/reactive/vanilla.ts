// 内置参考运行时：同步 dirty 循环的微 signal，叠加受控语义。
// set → 通知局部订阅者 → flushGlobal 全局同步冲刷，直到没有新的脏标记。
import type { Bindable, CellParams, MachineSchema, ReactiveRuntime, Service } from '../types'

export interface Signal<V> {
  get: () => V
  set: (next: V | ((prev: V) => V)) => void
  subscribe: (fn: () => void) => VoidFunction
  version: () => number
}

export interface VanillaRuntime extends ReactiveRuntime {
  /** 裸 signal 工厂：测试服务用它承载 props（写它才触发 track）。 */
  signal: <V>(initial: V) => Signal<V>
  /** 手动启停：驱动 onMount/onCleanup 钩子。 */
  start: () => void
  stop: () => void
  /** 订阅面：任一 cell 变化都通知（Web Components 整体重渲用）。 */
  subscribe: (fn: () => void) => VoidFunction
}

export function createVanillaRuntime(opts: { isServer?: boolean } = {}): VanillaRuntime {
  const isServer = opts.isServer ?? false
  const mountHooks: Array<() => void> = []
  const cleanupHooks: Array<() => void> = []
  const globalSubs = new Set<() => void>()
  let notifying = false
  let dirty = false

  function flushGlobal(): void {
    if (notifying) {
      dirty = true
      return
    }
    notifying = true
    try {
      do {
        dirty = false
        for (const fn of [...globalSubs]) fn()
      } while (dirty)
    }
    finally {
      notifying = false
    }
  }

  function signal<V>(initial: V): Signal<V> {
    let value = initial
    let ver = 0
    const subs = new Set<() => void>()
    return {
      get: () => value,
      set(next) {
        const v = typeof next === 'function' ? (next as (p: V) => V)(value) : next
        if (Object.is(v, value))
          return
        value = v
        ver += 1
        for (const fn of [...subs]) fn()
        flushGlobal()
      },
      subscribe(fn) {
        subs.add(fn)
        return () => void subs.delete(fn)
      },
      version: () => ver,
    }
  }

  function cell<V>(params: () => CellParams<V>): Bindable<V> {
    const p0 = params()
    const initial = (p0.defaultValue ?? p0.value) as V
    const eq = p0.isEqual ?? Object.is
    const inner = signal<V>(initial)
    const isControlled = (): boolean => params().value !== undefined
    const read = (): V => (isControlled() ? (params().value as V) : inner.get())
    let lastSeen = initial
    let version = 0
    return {
      initial,
      get: read,
      set(next) {
        const prev = read()
        const value = typeof next === 'function' ? (next as (p: V) => V)(prev) : next
        if (!isControlled())
          inner.set(value)
        if (!eq(value, prev))
          params().onChange?.(value, prev)
      },
      notify: () => flushGlobal(),
      // 版本号按值拉取比对，不数 set 调用次数：受控值是宿主从外面写进来的，
      // 根本不经过 set，推送式计数会永远停在 0，track([context.dep(k)]) 于是静默不触发。
      // 与 Vue / WC 两个运行时同语义——同一份 headless 换运行时不该换行为。
      version: () => {
        const cur = read()
        if (!eq(cur, lastSeen)) {
          lastSeen = cur
          version += 1
        }
        return version
      },
    }
  }

  return {
    name: 'vanilla',
    isServer,
    cell,
    signal,
    track(deps, fn) {
      let last = deps.map(d => d())
      const check = (): void => {
        const next = deps.map(d => d())
        if (next.some((v, i) => !Object.is(v, last[i]))) {
          last = next
          fn()
        }
      }
      globalSubs.add(check)
    },
    flush(fn) {
      queueMicrotask(fn)
    },
    onMount(fn) {
      if (!isServer)
        mountHooks.push(fn)
    },
    onCleanup(fn) {
      cleanupHooks.push(fn)
    },
    start() {
      if (isServer)
        return
      for (const fn of mountHooks) fn()
    },
    stop() {
      for (const fn of cleanupHooks) fn()
    },
    subscribe(fn) {
      globalSubs.add(fn)
      return () => void globalSubs.delete(fn)
    },
  }
}

/** 把一台 service + vanilla runtime 包成 subscribe/start/stop/getState 形状（Web Components 用）。 */
export function createSignalScope<T extends MachineSchema>(
  service: Service<T>,
  runtime: VanillaRuntime,
): { subscribe: (fn: () => void) => VoidFunction, start: () => void, stop: () => void, getState: () => T['state'] } {
  return {
    subscribe: runtime.subscribe,
    start: runtime.start,
    stop: runtime.stop,
    getState: () => service.state.get(),
  }
}
