import type { Bindable, CellParams, Dep, ReactiveRuntime } from '@xihan-ui/machine'
import type { ReactiveControllerHost } from '../reactive'

// 把机器的 ReactiveRuntime 契约桥到自定义元素基类的 controller 生命周期。

export interface LitRuntime extends ReactiveRuntime {
  /** hostConnected 调用，跑排队的 onMount。 */
  mount: () => void
  /** hostDisconnected 调用，逆序跑一次 cleanup。 */
  unmount: () => void
  /** hostUpdate 调用，逐 tracker 比对依赖、变则触发。 */
  runTrackers: () => void
}

interface Tracker {
  deps: Dep[]
  fn: () => void
  last: unknown[]
}

/** flush 最多等这么多轮更新；宿主一直自排新一轮时到此为止，回调照跑不吊死。 */
const MAX_FLUSH_ROUNDS = 100

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
    const set = (next: V | ((prev: V) => V)): void => {
      const prev = read()
      const value = typeof next === 'function' ? (next as (p: V) => V)(prev) : next
      if (eq(value, prev))
        return
      if (!isControlled())
        inner = value
      params().onChange?.(value, prev)
      host.requestUpdate()
    }
    return {
      initial,
      get: read,
      set,
      // 落点按当下 props 重算，不用挂载时冻结的 initial：宿主换了 defaultValue
      // （比如切去编辑另一条记录）就该回到新的那一份
      reset() {
        const next = params().defaultValue
        if (next === undefined)
          return undefined
        set(next)
        return next
      },
      notify: () => host.requestUpdate(),
      // 版本号按值拉取比对，受控值不经过 set。
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
      void (async () => {
        // 先让出一次微任务，等这次转移把宿主的更新排上队，再去读 updateComplete
        await null
        // updateComplete resolve 成 false 表示更新途中又排了新一轮，DOM 还没落定，接着等下一轮。
        let rounds = 0
        while (!(await host.updateComplete) && rounds < MAX_FLUSH_ROUNDS)
          rounds += 1
        fn()
      })()
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
      let errors: unknown[] | undefined
      for (const t of trackers) {
        const next = t.deps.map(d => d())
        if (!next.some((v, i) => !Object.is(v, t.last[i])))
          continue
        const prev = t.last
        // 跑之前先推进：fn 内部若又进到 runTrackers，不会拿同一次变化再触发一遍。
        t.last = next
        try {
          t.fn()
        }
        catch (error) {
          // 回滚到未消费，这次变化留给下一轮补跑；错误攒着，先把余下 tracker 跑完。
          t.last = prev
          errors ??= []
          errors.push(error)
        }
      }
      if (errors !== undefined)
        throw errors.length === 1 ? errors[0] : new AggregateError(errors, 'tracker 抛错')
    },
  }
}
