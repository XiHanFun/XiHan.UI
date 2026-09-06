import type { Bindable, CellParams, Dep, ReactiveRuntime } from '@xihan-ui/core'
import { flushSync } from 'react-dom'

// 把机器的 ReactiveRuntime 契约桥到 React 的「整体重渲 + 提交后拉取」模型。
// cell 变化走一个版本号 + 订阅集合喂 useSyncExternalStore；
// track 是拉式的，由宿主每次提交后逐项比对；
// flush 用 flushSync 把排队的更新同步提交完再跑回调。

/** 一轮 drain 最多强制提交这么多次；回调互相排队时到此为止，剩下的照跑不吊死。 */
const MAX_FLUSH_ROUNDS = 100

function noop(): void {}

interface Tracker {
  deps: Dep[]
  fn: () => void
  last: unknown[]
}

export interface ReactRuntime extends ReactiveRuntime {
  /** 订阅任意 cell 变化，配 useSyncExternalStore 的 subscribe。 */
  subscribe: (fn: () => void) => VoidFunction
  /** 快照：任意 cell 变化即自增的版本号，配 useSyncExternalStore 的 getSnapshot。 */
  getVersion: () => number
  /** 自增版本号并通知订阅者，不改任何值。 */
  notify: () => void
  /** 组件渲染体调用：标记「此刻在渲染中」并记下这次渲染读到的版本号。 */
  beginRender: () => void
  /** 提交后调用，跑排队的 onMount。 */
  mount: () => void
  /** 卸载时调用：逆序跑 cleanup，并丢弃队列里没跑的 flush 回调。 */
  unmount: () => void
  /** 每次提交后调用，逐 tracker 拉取比对依赖、变则触发。 */
  runTrackers: () => void
  /** 每次提交后调用，把这一轮排队的 flush 回调跑掉（此刻 DOM 已落定）。 */
  flushCommitted: () => void
  /** 清空钩子与 tracker 登记，供重建机器前复位；订阅者与版本号保留。 */
  reset: () => void
}

export function createReactRuntime(): ReactRuntime {
  const isServer = typeof window === 'undefined'

  const subscribers = new Set<() => void>()
  let version = 0
  /** 最近一次渲染读到的版本号；和 version 不等就说明还有一次提交在路上。 */
  let renderedVersion = 0

  let mounts: Array<() => void> = []
  let cleanups: Array<() => void> = []
  let trackers: Tracker[] = []
  let mounted = false
  let disposed = false

  // flushSync 禁区：渲染体里与我们自己的 effect 里都不能调
  let rendering = false
  let effectDepth = 0

  const pending: Array<() => void> = []
  let draining = false
  let microtaskScheduled = false

  function notify(): void {
    version += 1
    for (const fn of [...subscribers]) fn()
  }

  /** 此刻在渲染中或在自己的 effect 里，调 flushSync 会撞 React 的警告。 */
  function blocked(): boolean {
    return rendering || effectDepth > 0
  }

  /**
   * 在 effect 回调外围加禁区标记，effect 里发起的 flush 因此改走微任务。
   * effect 跑到就说明这一轮渲染已经提交，顺手把渲染中标记撤掉。
   */
  function inEffect(fn: () => void): void {
    rendering = false
    effectDepth += 1
    try {
      fn()
    }
    finally {
      effectDepth -= 1
    }
  }

  /** 取走当前这一批并逐个跑；卸载后立刻停手，余下的作废。 */
  function runBatch(): void {
    const batch = pending.splice(0, pending.length)
    for (const fn of batch) {
      if (disposed)
        return
      fn()
    }
  }

  /** 强制路径：先用 flushSync 把排队的更新同步提交，再跑回调。 */
  function drainForced(): void {
    if (disposed || draining || pending.length === 0)
      return
    draining = true
    try {
      let rounds = 0
      // disposed 由 runBatch 跑出去的回调间接置位（回调里卸载组件），静态看不出这一路
      // eslint-disable-next-line no-unmodified-loop-condition
      while (pending.length > 0 && !disposed && rounds < MAX_FLUSH_ROUNDS) {
        rounds += 1
        if (!isServer && !blocked())
          flushSync(noop)
        runBatch()
      }
    }
    finally {
      draining = false
    }
  }

  /** 提交后路径：这一轮的 DOM 已落定，直接跑；回调自己又排的留给下一轮。 */
  function drainAfterCommit(): void {
    if (disposed || draining || pending.length === 0)
      return
    draining = true
    try {
      runBatch()
    }
    finally {
      draining = false
    }
    if (!disposed && pending.length > 0)
      schedule()
  }

  // 不在调用点直接跑：机器写状态 cell 是在转移的最后一步，
  // 调用点此刻还没有可提交的更新。等提交后的 effect 或这条微任务来收。
  function schedule(): void {
    if (draining || microtaskScheduled)
      return
    microtaskScheduled = true
    queueMicrotask(() => {
      microtaskScheduled = false
      drainForced()
    })
  }

  function cell<V>(params: () => CellParams<V>): Bindable<V> {
    const p0 = params()
    const eq = p0.isEqual ?? Object.is
    const initial = (p0.defaultValue ?? p0.value) as V
    let inner = initial
    let lastSeen = initial
    let ver = 0

    // 受控判定每次现读：宿主中途开始传 value 就立刻按受控走
    const isControlled = (): boolean => params().value !== undefined
    const read = (): V => (isControlled() ? (params().value as V) : inner)

    const set = (next: V | ((prev: V) => V)): void => {
      const prev = read()
      const value = typeof next === 'function' ? (next as (p: V) => V)(prev) : next
      if (!isControlled())
        inner = value
      if (eq(value, prev))
        return
      params().onChange?.(value, prev)
      notify()
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
      notify,
      // 版本号按值拉取比对，不数 set 调用次数（受控值不经过 set）
      version: () => {
        const cur = read()
        if (!eq(cur, lastSeen)) {
          lastSeen = cur
          ver += 1
        }
        return ver
      },
    }
  }

  return {
    name: 'react',
    isServer,
    cell,

    track(deps, fn) {
      trackers.push({ deps, fn, last: deps.map(d => d()) })
    },

    flush(fn) {
      if (disposed)
        return
      pending.push(fn)
      schedule()
    },

    onMount(fn) {
      if (isServer)
        return
      mounts.push(fn)
      if (mounted)
        fn()
    },

    onCleanup(fn) {
      cleanups.push(fn)
    },

    subscribe(fn) {
      subscribers.add(fn)
      return () => void subscribers.delete(fn)
    },

    getVersion: () => version,
    notify,

    beginRender() {
      rendering = true
      renderedVersion = version
      // 渲染体没有收尾钩子。正常路径由随后的 effect 撤旗（见 inEffect）；
      // 这条微任务只兜「渲染被丢弃、始终没提交」的情况，免得标记永久卡住
      queueMicrotask(() => {
        rendering = false
      })
    },

    mount() {
      if (isServer || mounted)
        return
      mounted = true
      disposed = false
      inEffect(() => {
        for (const fn of [...mounts]) fn()
      })
    },

    unmount() {
      if (!mounted)
        return
      mounted = false
      // 先立旗再跑 cleanup：卸载后队列里没跑的回调一律作废
      disposed = true
      pending.length = 0
      inEffect(() => {
        for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]!()
      })
      cleanups.length = 0
    },

    flushCommitted() {
      rendering = false
      // 刚落定的这一轮渲染是在版本号还是 renderedVersion 时算出来的。
      // 两者不等说明这次提交之后又有 cell 变了，DOM 还欠一轮，
      // 回调留给下一次提交（微任务只做兜底，接不上时用 flushSync 逼出来）
      if (version !== renderedVersion) {
        if (pending.length > 0)
          schedule()
        return
      }
      inEffect(drainAfterCommit)
    },

    runTrackers() {
      let errors: unknown[] | undefined
      inEffect(() => {
        for (const t of trackers) {
          const next = t.deps.map(d => d())
          if (!next.some((v, i) => !Object.is(v, t.last[i])))
            continue
          const prev = t.last
          // 跑之前先推进：fn 内部若又进到 runTrackers，不会拿同一次变化再触发一遍
          t.last = next
          try {
            t.fn()
          }
          catch (error) {
            // 回滚到未消费，这次变化留给下一轮补跑；错误攒着，先把余下 tracker 跑完
            t.last = prev
            errors ??= []
            errors.push(error)
          }
        }
      })
      if (errors !== undefined)
        throw errors.length === 1 ? errors[0] : new AggregateError(errors, 'tracker 抛错')
    },

    reset() {
      mounts = []
      cleanups = []
      trackers = []
      mounted = false
      disposed = false
      pending.length = 0
    },
  }
}
