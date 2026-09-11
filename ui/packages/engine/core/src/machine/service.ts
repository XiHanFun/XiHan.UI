import type {
  ActionFn,
  ActionsOrFn,
  Bindable,
  ComputedFn,
  ContextFacade,
  Dep,
  EffectFn,
  EffectsOrFn,
  EventObject,
  GuardExpr,
  GuardFn,
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
import { createCounterIdGenerator, createScope, isDev } from '../kernel'
import { MachineError, raiseMachineError, reportMachineCrash, throwMachineError } from './errors'
import { getOwnCallableImplementation } from './implementation'
import {
  choose,
  findTransition,
  getExitEnterStates,
  getStateChain,
  resolveStateValue,
  resolveToLeaf,
} from './transitions'

const EVENT_LOOP_LIMIT = 1e4
const NO_STOP_REASON = Symbol('no-stop-reason')
const ROOT_EFFECT_PATH = Symbol('root-effect-path')

interface Tracker {
  deps: Dep[]
  fn: () => void
  last: unknown[]
}

interface EffectDisposer {
  dispose: () => unknown[]
}

type EffectPath = string | typeof ROOT_EFFECT_PATH

type CollectedError
  = | { found: false }
    | { found: true, error: unknown }

function describeThrown(error: unknown): string {
  try {
    return error instanceof Error ? error.message : String(error)
  }
  catch {
    return '<无法格式化的异常>'
  }
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
    reset: key => contextBindables[key as string]?.reset() as never,
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
    const guards = machine.implementations?.guards
    const impl = getOwnCallableImplementation(guards, expr) as GuardFn<T> | undefined
    if (!impl)
      failClosed('MISSING_GUARD', expr)
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
    const implementations = resolveList(spec, event).map((name) => {
      const actions = machine.implementations?.actions
      const impl = getOwnCallableImplementation(actions, name) as ActionFn<T> | undefined
      if (!impl)
        failClosed('MISSING_ACTION', name)
      return impl
    })
    for (const impl of implementations)
      impl(paramsFor(event))
  }

  function failClosed(code: 'MISSING_ACTION' | 'MISSING_GUARD' | 'MISSING_EFFECT', name: string): never {
    try {
      throwMachineError(code, `"${name}" is not registered as an own callable implementation`, machine.name)
    }
    catch (error) {
      try {
        inspect?.({ type: 'event', machineName: machine.name, state: currentState as T['state'], detail: `unhandled: ${name}` })
      }
      catch {}
      if (status === 'Started')
        stopMissingImplementationFailure(error)
      throw error
    }
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
  const effects = new Map<EffectPath, EffectDisposer>()

  function drainEffectCleanups(cleanups: VoidFunction[]): unknown[] {
    const errors: unknown[] = []
    while (cleanups.length) {
      try {
        cleanups.pop()!()
      }
      catch (error) {
        errors.push(error)
      }
    }
    return errors
  }

  function collectedError(errors: unknown[], message: string): CollectedError {
    if (errors.length === 1)
      return { found: true, error: errors[0] }
    if (errors.length > 1)
      return { found: true, error: new AggregateError(errors, message, { cause: errors[0] }) }
    return { found: false }
  }

  function throwCollectedErrors(errors: unknown[], message: string): void {
    const result = collectedError(errors, message)
    if (result.found)
      throw result.error
  }

  function rollbackEffectBatch(cleanups: VoidFunction[], setupError: unknown): never {
    const rollbackErrors = drainEffectCleanups(cleanups)
    if (!rollbackErrors.length)
      throw setupError
    throw new AggregateError(
      [setupError, ...rollbackErrors],
      '[xh] 状态机 effect 初始化与回滚同时失败',
      { cause: setupError },
    )
  }

  function mountEffects(path: EffectPath, spec: EffectsOrFn<T> | undefined): boolean {
    if (effects.has(path)) {
      const pathLabel = path === ROOT_EFFECT_PATH ? '<machine-root>' : path
      throw new MachineError(
        'DUPLICATE_EFFECT_PATH',
        `effect path "${pathLabel}" is already mounted`,
        machine.name,
      )
    }
    const cleanups: VoidFunction[] = []
    const effect: EffectDisposer = {
      dispose: () => drainEffectCleanups(cleanups),
    }
    effects.set(path, effect)

    let names: string[] = []
    try {
      names = resolveList(spec, currentEvent)
      const implementations = names.map((name) => {
        const effectImplementations = machine.implementations?.effects
        const impl = getOwnCallableImplementation(effectImplementations, name) as EffectFn<T> | undefined
        if (!impl)
          failClosed('MISSING_EFFECT', name)
        return impl
      })
      for (const impl of implementations) {
        if (status === 'Stopped' || effects.get(path) !== effect)
          break
        const cleanup = impl(paramsFor(currentEvent))
        if (typeof cleanup === 'function')
          cleanups.push(cleanup)
      }
    }
    catch (setupError) {
      if (effects.get(path) === effect)
        effects.delete(path)
      rollbackEffectBatch(cleanups, setupError)
    }

    if (status === 'Stopped' || effects.get(path) !== effect) {
      if (effects.get(path) === effect)
        effects.delete(path)
      throwCollectedErrors(effect.dispose(), '[xh] 状态机 effect 挂载中断期间清理出现多个异常')
      return false
    }

    if (!names.length && effects.get(path) === effect)
      effects.delete(path)
    return true
  }

  function disposeMountedEffect(path: string): void {
    const effect = effects.get(path)
    effects.delete(path)
    if (effect)
      throwCollectedErrors(effect.dispose(), '[xh] 状态机 effect 清理出现多个异常')
  }

  function teardownAllEffects(): unknown[] {
    const mounted = [...effects.values()].reverse()
    effects.clear()
    return mounted.flatMap(effect => effect.dispose())
  }

  // —— 六阶段编排 ——
  function choreograph(from: string | null, to: string, t: Transition<T>): void {
    const initializing = from === null
    const { exiting, entering } = initializing
      ? { exiting: [], entering: getStateChain(machine, to) }
      : getExitEnterStates(machine, from, to, t.reenter)
    try {
      for (const item of exiting)
        disposeMountedEffect(item.path)
      for (const item of exiting) runActions(item.node.exit, currentEvent)
      runActions(t.actions, currentEvent)
      for (const item of entering) {
        if (!mountEffects(item.path, item.node.effects))
          return
      }
      if (initializing) {
        runActions(machine.entry, currentEvent)
        if (status === 'Stopped' || !mountEffects(ROOT_EFFECT_PATH, machine.effects))
          return
      }
      for (const item of entering) {
        runActions(item.node.entry, currentEvent)
        if (status === 'Stopped')
          return
      }
      previousState = initializing ? undefined : (from as T['state'])
      currentState = to
      stateCell.set(to)
    }
    catch (err) {
      if (hasMissingImplementationFailure(err))
        stopMissingImplementationFailure(err)
      stop(new MachineError(
        'MACHINE_CRASHED',
        `choreograph ${initializing ? '<initial>' : from}→${to} threw: ${describeThrown(err)}`,
        machine.name,
        { cause: err },
      ))
    }
  }

  // —— 转移解析 ——
  function transition(event: T['event']): void {
    try {
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
    catch (error) {
      if (hasMissingImplementationFailure(error))
        stopMissingImplementationFailure(error)
      throw error
    }
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
    if (status === 'Stopped')
      return
    pendingTrackers.add(tracker)
    // 挂载前不冲刷，累积到 onMount 的 resync + drain 里统一消费
    if (!draining && status === 'Started')
      drainTrackers()
  }
  function drainTrackers(): void {
    try {
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
    catch (error) {
      if (hasMissingImplementationFailure(error))
        stopMissingImplementationFailure(error)
      throw error
    }
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
  function stop(reason: unknown | typeof NO_STOP_REASON = NO_STOP_REASON): void {
    if (status !== 'Started') {
      status = 'Stopped'
      queue.length = 0
      pendingTrackers.clear()
      if (reason !== NO_STOP_REASON) {
        reportMachineCrash(reason, machine.name)
        throw reason
      }
      return
    }
    status = 'Stopped'
    queue.length = 0
    pendingTrackers.clear()

    const lifecycleErrors: unknown[] = []
    try {
      lifecycleErrors.push(...teardownAllEffects())
    }
    catch (error) {
      lifecycleErrors.push(error)
    }
    try {
      runActions(machine.exit, currentEvent)
    }
    catch (error) {
      lifecycleErrors.push(error)
    }

    if (reason !== NO_STOP_REASON) {
      const crashResult = collectedError(
        [reason, ...lifecycleErrors],
        '[xh] 状态机崩溃与停止清理同时出现异常',
      )
      if (!crashResult.found)
        return
      reportMachineCrash(crashResult.error, machine.name)
      if (lifecycleErrors.length || isDev() || hasMissingImplementationFailure(reason))
        throw crashResult.error
      return
    }
    const lifecycleResult = collectedError(lifecycleErrors, '[xh] 状态机停止清理出现多个异常')
    if (lifecycleResult.found) {
      reportMachineCrash(lifecycleResult.error, machine.name)
      throw lifecycleResult.error
    }
  }

  function stopMissingImplementationFailure(error: unknown): never {
    if (status === 'Stopped')
      throw error
    stop(error)
    throw error
  }

  runtime.onMount(() => {
    if (runtime.isServer)
      return
    if (status === 'Started') {
      const invariant = new MachineError(
        'DUPLICATE_SERVICE_MOUNT',
        'service mount hook was invoked more than once',
        machine.name,
      )
      stop(new MachineError(
        'MACHINE_CRASHED',
        `mount threw: ${invariant.message}`,
        machine.name,
        { cause: invariant },
      ))
      return
    }
    if (status === 'Stopped')
      return

    status = 'Started'
    draining = true
    try {
      resyncTrackers()
      choreograph(null, initialStateValue, {} as Transition<T>)
      if (status === 'Started')
        drainTrackers()
    }
    finally {
      draining = false
      stepGuard = 0
    }
    if (status === 'Started' && queue.length)
      drain()
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

function hasMissingImplementationFailure(error: unknown, seen = new Set<object>()): boolean {
  if ((typeof error !== 'object' && typeof error !== 'function') || error === null || seen.has(error))
    return false
  seen.add(error)
  if (error instanceof MachineError
    && (error.code === 'MISSING_ACTION' || error.code === 'MISSING_GUARD' || error.code === 'MISSING_EFFECT')) {
    return true
  }
  if (error instanceof AggregateError
    && error.errors.some(item => hasMissingImplementationFailure(item, seen))) {
    return true
  }
  if (error instanceof Error)
    return hasMissingImplementationFailure(error.cause, seen)
  return false
}

export type { EventObject }
