import type { ReactiveControllerHost } from '@lit/reactive-element'
import type { Bindable, CellParams, Dep, ReactiveRuntime } from '@xihan-ui/machine'

// 把机器的 ReactiveRuntime 契约桥到 ReactiveElement 的 controller 生命周期。
// 只 import type @lit，值层零依赖，让 @xihan-ui/wc 主入口在无 DOM 的 Node 下可安全 import。

export interface LitRuntime extends ReactiveRuntime {
  /** hostConnected 调用：跑排队的 onMount（一台机器一生命周期；重连由 controller 重建机器处理）。 */
  mount: () => void
  /** hostDisconnected 调用：逆序跑一次 cleanup。 */
  unmount: () => void
  /** hostUpdate 调用：单一调度源，逐 tracker 比对依赖、变则触发。 */
  runTrackers: () => void
}

interface Tracker {
  deps: Dep[]
  fn: () => void
  last: unknown[]
}

export function createLitRuntime(host: ReactiveControllerHost): LitRuntime {
  const mounts: Array<() => void> = []
  const cleanups: Array<() => void> = []
  const trackers: Tracker[] = []
  let mounted = false

  function cell<V>(params: () => CellParams<V>): Bindable<V> {
    const p0 = params()
    const eq = p0.isEqual ?? Object.is
    const initial = (p0.defaultValue ?? p0.value) as V
    let inner = initial
    let lastSeen = initial
    let version = 0
    const isControlled = (): boolean => params().value !== undefined
    const read = (): V => (isControlled() ? (params().value as V) : inner)
    return {
      initial,
      get: read,
      set(next) {
        const prev = read()
        const value = typeof next === 'function' ? (next as (p: V) => V)(prev) : next
        if (eq(value, prev))
          return
        if (!isControlled())
          inner = value
        params().onChange?.(value, prev)
        host.requestUpdate()
      },
      notify: () => host.requestUpdate(),
      // 版本号按值拉取比对：受控值由外部写入时不经过 set，推送式计数会漏掉，
      // 导致 track([context.dep(k)]) 在本适配器静默不触发。与 Vue 运行时同语义。
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
    name: 'wc',
    isServer: false,
    cell,
    track(deps, fn) {
      trackers.push({ deps, fn, last: deps.map(d => d()) })
    },
    flush(fn) {
      void host.updateComplete.then(() => fn())
    },
    onMount(fn) {
      mounts.push(fn)
      if (mounted)
        fn()
    },
    onCleanup(fn) {
      cleanups.push(fn)
    },
    mount() {
      if (mounted)
        return
      mounted = true
      for (const fn of mounts) fn()
    },
    unmount() {
      if (!mounted)
        return
      mounted = false
      for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]!()
      cleanups.length = 0
    },
    runTrackers() {
      for (const t of trackers) {
        const next = t.deps.map(d => d())
        if (next.some((v, i) => !Object.is(v, t.last[i]))) {
          t.last = next
          t.fn()
        }
      }
    },
  }
}
