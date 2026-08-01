import type {
  ActionsOrFn,
  Bindable,
  ComputedFn,
  ContextFacade,
  Dep,
  EffectsOrFn,
  EventObject,
  GuardExpr,
  MachineConfig,
  MachineSchema,
  MachineStatus,
  Params,
  PropFn,
  RefsFacade,
  Service,
  ServiceOptions,
  Slice,
  StateFacade,
  Transition,
} from './types'
// 解释器：把 machine 定义与注入的响应式宿主组合成可运行的 service。
// 事件走同步 FIFO 队列 + run-to-completion，转移走六阶段编排。
import { callAll, createCounterIdGenerator, createScope, isDev } from '@xihan-ui/core'
import { MachineError, raiseMachineError, reportMachineCrash } from './errors'
import {
  choose,
  findTransition,
  getExitEnterStates,
  getStateChain,
  resolveStateValue,
  resolveToLeaf,
} from './transitions'

const INIT_STATE = '__init__'
const EVENT_LOOP_LIMIT = 1e4

interface Tracker {
  deps: Dep[]
  fn: () => void
  last: unknown[]
}

export function createService<T extends MachineSchema>(
  machine: MachineConfig<T>,
  options: ServiceOptions<T>,
): Service<T> {
  const { runtime, inspect } = options
  const scope = options.scope ?? createScope(null, createCounterIdGenerator())

  let status: MachineStatus = 'NotStarted'

  // —— prop 归一化：按用户 getter 的返回身份缓存 ——
  let rawPropsRef: object | undefined
  let normalizedProps: Slice<T, 'props'> | undefined
  function normalized(): Slice<T, 'props'> {
    const raw = options.props() as object
    if (raw !== rawPropsRef || normalizedProps === undefined) {
      rawPropsRef = raw
      normalizedProps = (machine.props?.({ props: raw as Partial<Slice<T, 'props'>>, scope }) ?? raw) as Slice<T, 'props'>
    }
    return normalizedProps
  }
  const prop: PropFn<T> = key => (normalized() as Record<string, unknown>)[key as string] as never

  // —— 状态位与事件 ——
  const initialStateValue = resolveToLeaf(machine, machine.initialState({ prop })) as T['state']
  let currentState: string = initialStateValue
  let previousState: T['state'] | undefined
  let currentEvent: T['event'] = { type: '__init__' } as T['event']
  let previousEvent: T['event'] | null = null
  // 状态用 runtime cell 承载，宿主读 state.get() 即建立依赖
  const stateCell = runtime.cell<string>(() => ({ defaultValue: initialStateValue }))

  // —— context cells ——
  const contextBindables = (machine.context?.({ prop, scope, cell: runtime.cell }) ?? {}) as Record<string, Bindable<unknown>>
  const contextFacade: ContextFacade<T> = {
    get: key => contextBindables[key as string]?.get() as never,
    set: (key, value) => contextBindables[key as string]?.set(value as never),
    initial: key => contextBindables[key as string]?.initial as never,
    dep: key => () => contextBindables[key as string]?.version(),
  }

  // —— refs ——
  const refsObj = (machine.refs?.({ prop, scope }) ?? {}) as Record<string, unknown>
  const refsFacade: RefsFacade<T> = {
    get: key => refsObj[key as string] as never,
    set: (key, value) => {
      refsObj[key as string] = value
    },
  }

  // —— computed（惰性、不缓存）——
  const computedFacade: ComputedFn<T> = (key) => {
    const fn = machine.computed?.[key as keyof typeof machine.computed] as ((p: Params<T>) => unknown) | undefined
    return fn?.(paramsFor(currentEvent)) as never
  }

  // —— state 门面（读经 stateCell，建立宿主依赖）——
  function matches(...values: Array<T['state']>): boolean {
    const s = stateCell.get()
    return values.some(v => s === v || s.startsWith(`${v}.`))
  }
  function hasTag(tag: Slice<T, 'tag'> & string): boolean {
    return getStateChain(machine, stateCell.get()).some(item => item.node.tags?.includes(tag as never))
  }
  const stateFacade: StateFacade<T> = {
    get: () => stateCell.get() as T['state'],
    previous: () => previousState,
    initial: initialStateValue,
    matches,
    hasTag,
  }

  // —— guard / action 求值 ——
  function evalGuard(expr: GuardExpr<T>, event: T['event']): boolean {
    if (typeof expr === 'function')
      return expr(paramsFor(event))
    const impl = machine.implementations?.guards?.[expr as Slice<T, 'guard'> & string]
    if (!impl) {
      failClosed('MISSING_GUARD', expr)
      return false
    }
    return impl(paramsFor(event))
  }
  function guardOfTransition(t: Transition<T>, event: T['event']): boolean {
    return t.guard === undefined ? true : evalGuard(t.guard, event)
  }

  function resolveList(spec: ActionsOrFn<T> | EffectsOrFn<T> | undefined, event: T['event']): string[] {
    if (!spec)
      return []
    if (Array.isArray(spec))
      return spec as string[]
    return (spec as (p: Params<T>) => string[] | undefined)(paramsFor(event)) ?? []
  }

  function runActions(spec: ActionsOrFn<T> | undefined, event: T['event']): void {
    for (const name of resolveList(spec, event)) {
      const impl = machine.implementations?.actions?.[name as Slice<T, 'action'> & string]
      if (!impl) {
        failClosed('MISSING_ACTION', name)
        continue
      }
      impl(paramsFor(event))
    }
  }

  function failClosed(code: 'MISSING_ACTION' | 'MISSING_GUARD' | 'MISSING_EFFECT', name: string): void {
    raiseMachineError(code, `"${name}" is not registered in implementations`, machine.name)
    inspect?.({ type: 'event', machineName: machine.name, state: currentState as T['state'], detail: `unhandled: ${name}` })
  }

  // —— Params 组装（event 门面按传入事件冻结）——
  function paramsFor(event: T['event']): Params<T> {
    return {
      prop,
      context: contextFacade,
      computed: computedFacade,
      refs: refsFacade,
      scope,
      event: {
        current: () => event,
        previous: () => previousEvent,
        is: type => event.type === type,
      },
      state: stateFacade,
      send,
      action: keys => runActions(keys, event),
      guard: expr => evalGuard(expr, event),
      choose: transitions => choose(Array.isArray(transitions) ? transitions : [transitions], t => guardOfTransition(t, event)),
      track,
      flush: runtime.flush,
    }
  }

  // —— effect 表 ——
  const effects = new Map<string, VoidFunction>()
  function mountEffects(path: string, spec: EffectsOrFn<T> | undefined): void {
    const cleanups: VoidFunction[] = []
    for (const name of resolveList(spec, currentEvent)) {
      const impl = machine.implementations?.effects?.[name as Slice<T, 'effect'> & string]
      if (!impl) {
        failClosed('MISSING_EFFECT', name)
        continue
      }
      const cleanup = impl(paramsFor(currentEvent))
      if (typeof cleanup === 'function')
        cleanups.push(cleanup)
    }
    if (cleanups.length) {
      const prev = effects.get(path)
      effects.set(path, callAll(prev, ...cleanups) as VoidFunction)
    }
  }
  function teardownAllEffects(): void {
    for (const cleanup of effects.values()) cleanup()
    effects.clear()
  }

  // —— 六阶段编排 ——
  function choreograph(from: string, to: string, t: Transition<T>): void {
    const { exiting, entering } = getExitEnterStates(machine, from, to, t.reenter)
    try {
      for (const item of exiting) {
        const cleanup = effects.get(item.path)
        if (cleanup)
          cleanup()
        effects.delete(item.path)
      }
      for (const item of exiting) runActions(item.node.exit, currentEvent)
      runActions(t.actions, currentEvent)
      for (const item of entering) mountEffects(item.path, item.node.effects)
      if (from === INIT_STATE) {
        runActions(machine.entry, currentEvent)
        mountEffects(INIT_STATE, machine.effects)
      }
      for (const item of entering) runActions(item.node.entry, currentEvent)
      previousState = from === INIT_STATE ? undefined : (from as T['state'])
      currentState = to
      stateCell.set(to)
    }
    catch (err) {
      stop(new MachineError('MACHINE_CRASHED', `choreograph ${from}→${to} threw: ${(err as Error).message}`, machine.name))
    }
  }

  // —— 转移解析 ——
  function transition(event: T['event']): void {
    const from = currentState
    const { transitions, source } = findTransition(machine, from, event.type)
    const chosen = choose(transitions, t => guardOfTransition(t, event))
    if (!chosen)
      return
    previousEvent = currentEvent
    currentEvent = event
    if (chosen.target === undefined && !chosen.reenter) {
      runActions(chosen.actions, event)
      return
    }
    const to = resolveStateValue(machine, chosen.target ?? from, source)
    choreograph(from, to, chosen)
  }

  // —— 事件队列 ——
  const queue: Array<T['event']> = []
  let draining = false
  let stepGuard = 0

  function send(event: T['event']): void {
    if (status === 'NotStarted') {
      raiseMachineError('SEND_BEFORE_MOUNT', `send("${event.type}") before mount`, machine.name)
      return
    }
    // 停机后一律丢弃事件，dev 也不抛
    if (status === 'Stopped')
      return
    queue.push(event)
    if (!draining)
      drain()
  }

  function drain(): void {
    draining = true
    try {
      while (queue.length) {
        if (isDev() && ++stepGuard > EVENT_LOOP_LIMIT)
          throw new MachineError('EVENT_LOOP', `> ${EVENT_LOOP_LIMIT} steps without settling; likely an action↔watch cycle`, machine.name)
        const event = queue.shift()!
        transition(event)
        drainTrackers()
      }
    }
    finally {
      draining = false
      stepGuard = 0
    }
  }

  // —— tracker 批处理 ——
  const trackers: Tracker[] = []
  const pendingTrackers = new Set<Tracker>()

  function track(deps: Dep[], fn: () => void): void {
    const tracker: Tracker = { deps, fn, last: deps.map(d => d()) }
    trackers.push(tracker)
    runtime.track(deps, () => enqueueTracker(tracker))
  }
  function enqueueTracker(tracker: Tracker): void {
    pendingTrackers.add(tracker)
    // 挂载前不冲刷，累积到 onMount 的 resync + drain 里统一消费
    if (!draining && status === 'Started')
      drainTrackers()
  }
  function drainTrackers(): void {
    if (!pendingTrackers.size)
      return
    const batch = [...pendingTrackers]
    pendingTrackers.clear()
    for (const tracker of batch) {
      const next = tracker.deps.map(d => d())
      const changed = next.some((v, i) => !Object.is(v, tracker.last[i]))
      tracker.last = next
      if (changed)
        tracker.fn()
    }
    if (queue.length && !draining)
      drain()
  }
  function resyncTrackers(): void {
    // 只标记待处理，不推进 last，由随后的 drainTrackers 检出变化并推进
    for (const tracker of trackers) {
      const next = tracker.deps.map(d => d())
      if (next.some((v, i) => !Object.is(v, tracker.last[i])))
        pendingTrackers.add(tracker)
    }
  }

  // —— watch：setup 期同步注册 tracker ——
  machine.watch?.({
    track,
    action: keys => runActions(keys, currentEvent),
    prop,
    context: { get: contextFacade.get, dep: contextFacade.dep },
    computed: computedFacade,
  })

  // —— 生命周期 ——
  function stop(reason?: unknown): void {
    if (status !== 'Started') {
      status = 'Stopped'
      return
    }
    teardownAllEffects()
    runActions(machine.exit, currentEvent)
    status = 'Stopped'
    if (reason) {
      reportMachineCrash(reason, machine.name)
      if (isDev())
        throw reason
    }
  }

  runtime.onMount(() => {
    if (runtime.isServer)
      return
    status = 'Started'
    resyncTrackers()
    choreograph(INIT_STATE, initialStateValue, {} as Transition<T>)
    drainTrackers()
  })
  runtime.onCleanup(() => stop())

  return {
    machine,
    getStatus: () => status,
    state: stateFacade,
    context: contextFacade,
    refs: refsFacade,
    computed: computedFacade,
    prop,
    event: {
      current: () => currentEvent,
      previous: () => previousEvent,
      is: type => currentEvent.type === type,
    },
    scope,
    send,
  }
}

export type { EventObject }
