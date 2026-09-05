// 机器类型系统的类型契约。
import type { Dict, Scope } from '../kernel'

export interface EventObject {
  type: string
  /** 触发来源标记（如 "interact-outside" / "keyboard"）。 */
  src?: string
  /** 影子事件保留的原始用户事件。 */
  previousEvent?: EventObject
  [key: string]: any
}

/** machine 的全部泛型参数打包成一个 schema。全部字段必填，未用到的从 BaseSchema 继承宽松默认。 */
export interface MachineSchema {
  props: Dict<any>
  context: Dict<any>
  computed: Dict<any>
  refs: Dict<any>
  /** 状态路径字面量联合，如 "closed" | "open" | "open.interacting"。 */
  state: string
  event: EventObject
  tag: string
  guard: string
  action: string
  effect: string
}

export interface BaseSchema extends MachineSchema {}

/** 取 schema 的某一片。 */
export type Slice<T extends MachineSchema, K extends keyof MachineSchema> = T[K]

/** "closed" | "open" | "open.interacting" → "closed" | "open"。 */
export type TopLevelState<S extends string> = S extends `${infer Head}.${string}` ? Head : S

/** 某顶层状态的所有后代路径（含自身）。 */
export type DescendantState<S extends string, Root extends string> = Extract<S, Root | `${Root}.${string}`>

// —— 依赖项与只读投影 ——
export type Dep = () => unknown
export type PropFn<T extends MachineSchema> = <K extends keyof Slice<T, 'props'>>(key: K) => Slice<T, 'props'>[K]
export type ComputedFn<T extends MachineSchema> = <K extends keyof Slice<T, 'computed'>>(key: K) => Slice<T, 'computed'>[K]

// —— 门面 ——
export interface ContextFacade<T extends MachineSchema> {
  get: <K extends keyof Slice<T, 'context'>>(key: K) => Slice<T, 'context'>[K]
  set: <K extends keyof Slice<T, 'context'>>(
    key: K,
    value: Slice<T, 'context'>[K] | ((prev: Slice<T, 'context'>[K]) => Slice<T, 'context'>[K]),
  ) => void
  initial: <K extends keyof Slice<T, 'context'>>(key: K) => Slice<T, 'context'>[K] | undefined
  /**
   * 把该 cell 变回它此刻挂载会得到的值：重新求一遍它自己的 defaultValue 表达式再走原来的 set。
   * 落点因此与 cell 定义是同一份代码，不会各写一份而漂移。受控时照常只发意图。
   */
  reset: <K extends keyof Slice<T, 'context'>>(key: K) => Slice<T, 'context'>[K] | undefined
  /** 产出可安全用于 track 的依赖项：cell 版本号（真变才自增）。 */
  dep: <K extends keyof Slice<T, 'context'>>(key: K) => Dep
}

export interface RefsFacade<T extends MachineSchema> {
  get: <K extends keyof Slice<T, 'refs'>>(key: K) => Slice<T, 'refs'>[K]
  set: <K extends keyof Slice<T, 'refs'>>(key: K, value: Slice<T, 'refs'>[K]) => void
}

/** 事件门面。 */
export interface EventFacade<T extends MachineSchema> {
  current: () => T['event']
  previous: () => T['event'] | null
  is: <K extends T['event']['type']>(type: K) => boolean
}

export interface StateFacade<T extends MachineSchema> {
  get: () => T['state']
  previous: () => T['state'] | undefined
  initial: T['state']
  matches: (...values: Array<T['state']>) => boolean
  hasTag: (tag: Slice<T, 'tag'> & string) => boolean
}

// —— guard / action / effect ——
export type GuardFn<T extends MachineSchema> = (params: Params<T>) => boolean
export type GuardExpr<T extends MachineSchema> = (Slice<T, 'guard'> & string) | GuardFn<T>
export type ActionFn<T extends MachineSchema> = (params: Params<T>) => void
export type ActionsOrFn<T extends MachineSchema>
  = | Array<Slice<T, 'action'> & string>
    | ((params: Params<T>) => Array<Slice<T, 'action'> & string> | undefined)
export type EffectFn<T extends MachineSchema> = (params: EffectParams<T>) => VoidFunction | undefined | void
export type EffectsOrFn<T extends MachineSchema>
  = | Array<Slice<T, 'effect'> & string>
    | ((params: Params<T>) => Array<Slice<T, 'effect'> & string> | undefined)

/** 交给每个 action/guard/effect 的统一上下文。 */
export interface Params<T extends MachineSchema> {
  prop: PropFn<T>
  context: ContextFacade<T>
  computed: ComputedFn<T>
  refs: RefsFacade<T>
  scope: Scope
  event: EventFacade<T>
  state: StateFacade<T>
  send: (event: T['event']) => void
  action: (keys: ActionsOrFn<T>) => void
  guard: (expr: GuardExpr<T>) => boolean
  choose: (transitions: Transition<T> | Array<Transition<T>>) => Transition<T> | undefined
  track: (deps: Dep[], fn: () => void) => void
  flush: (fn: () => void) => void
}

/** effect params 与 action 的唯一区别：event 冻结为挂载时刻的快照。 */
export type EffectParams<T extends MachineSchema> = Params<T>

// —— 转移 ——
export type SiblingName<S extends string, Source extends string | undefined>
  = Source extends `${infer Parent}.${string}`
    ? Extract<S, `${Parent}.${string}`> extends `${Parent}.${infer Leaf}` ? Leaf : never
    : TopLevelState<S>

export interface Transition<
  T extends MachineSchema,
  Source extends string | undefined = string | undefined,
> {
  target?: T['state'] | SiblingName<T['state'], Source> | `#${string}` | `.${string}`
  actions?: Array<Slice<T, 'action'> & string>
  guard?: GuardExpr<T>
  reenter?: boolean
}

export type TransitionMap<T extends MachineSchema, Source extends string | undefined> = {
  [E in T['event']['type']]?: Transition<T, Source> | Array<Transition<T, Source>>
}

// —— 状态节点 ——
export interface StateNode<T extends MachineSchema, Path extends string = string> {
  id?: string
  tags?: Array<Slice<T, 'tag'> & string>
  entry?: ActionsOrFn<T>
  exit?: ActionsOrFn<T>
  effects?: EffectsOrFn<T>
  initial?: string
  states?: Record<string, StateNode<T, string>>
  on?: TransitionMap<T, Path>
}

export interface StateChainItem<T extends MachineSchema = MachineSchema> {
  path: string
  node: StateNode<T>
}

export interface StateIndex<T extends MachineSchema = MachineSchema> {
  index: Map<string, StateNode<T>>
  idIndex: Map<string, string>
  leaves: string[]
}

// —— 工厂参数 ——
export interface PropsParams<T extends MachineSchema> {
  props: Partial<Slice<T, 'props'>>
  scope: Scope
}
export interface ContextParams<T extends MachineSchema> {
  prop: PropFn<T>
  scope: Scope
  cell: ReactiveRuntime['cell']
}
export interface RefsParams<T extends MachineSchema> {
  prop: PropFn<T>
  scope: Scope
}
export interface WatchParams<T extends MachineSchema> {
  track: (deps: Dep[], fn: () => void) => void
  action: (keys: ActionsOrFn<T>) => void
  prop: PropFn<T>
  context: Pick<ContextFacade<T>, 'get' | 'dep'>
  computed: ComputedFn<T>
}

// —— 机器定义 ——
export interface MachineConfig<T extends MachineSchema> {
  readonly name: string
  props?: (params: PropsParams<T>) => Slice<T, 'props'>
  context?: (params: ContextParams<T>) => { [K in keyof Slice<T, 'context'>]: Bindable<Slice<T, 'context'>[K]> }
  refs?: (params: RefsParams<T>) => Slice<T, 'refs'>
  computed?: { [K in keyof Slice<T, 'computed'>]: (params: Params<T>) => Slice<T, 'computed'>[K] }
  initialState: (params: { prop: PropFn<T> }) => T['state']
  entry?: ActionsOrFn<T>
  exit?: ActionsOrFn<T>
  effects?: EffectsOrFn<T>
  watch?: (params: WatchParams<T>) => void
  on?: TransitionMap<T, undefined>
  states: { [K in TopLevelState<T['state']>]: StateNode<T, K> }
  implementations?: {
    guards?: Partial<Record<Slice<T, 'guard'> & string, GuardFn<T>>>
    actions?: Partial<Record<Slice<T, 'action'> & string, ActionFn<T>>>
    effects?: Partial<Record<Slice<T, 'effect'> & string, EffectFn<T>>>
  }
}

// —— 响应式契约 ——
export interface Bindable<V> {
  readonly initial: V | undefined
  get: () => V
  set: (value: V | ((prev: V) => V)) => void
  /** 强制通知订阅者，不改值（用于 reenter 与强制刷新）。 */
  notify: () => void
  /** 版本号：真变（isEqual 判定）才自增。 */
  version: () => number
  /**
   * 重新求一遍 defaultValue 并写回，返回这次算出的落点。
   * 没有默认值就不写。受控时与 set 一样只发意图、不落内部值。
   */
  reset: () => V | undefined
}

export interface CellParams<V> {
  defaultValue?: V
  /** !== undefined 即判定为受控。 */
  value?: V
  isEqual?: (a: V, b: V | undefined) => boolean
  onChange?: (value: V, prev: V | undefined) => void
  debugName?: string
}

export interface ReactiveRuntime {
  readonly name: string
  /** 服务端渲染标记。为 true 时 onMount 永不触发。 */
  readonly isServer: boolean
  cell: <V>(params: () => CellParams<V>) => Bindable<V>
  /** 依赖追踪。deps 用 Object.is 逐项比较。 */
  track: (deps: Dep[], fn: () => void) => void
  /** 推迟到宿主完成一次渲染提交之后。 */
  flush: (fn: () => void) => void
  onMount: (fn: () => void) => void
  onCleanup: (fn: () => void) => void
}

// —— 解释器句柄 ——
export type MachineStatus = 'NotStarted' | 'Started' | 'Stopped'

export interface Service<T extends MachineSchema> {
  readonly machine: MachineConfig<T>
  getStatus: () => MachineStatus
  state: StateFacade<T>
  context: ContextFacade<T>
  refs: RefsFacade<T>
  computed: ComputedFn<T>
  prop: PropFn<T>
  event: EventFacade<T>
  scope: Scope
  send: (event: T['event']) => void
}

export interface InspectionEvent<T extends MachineSchema> {
  type: 'transition' | 'action' | 'effect' | 'event'
  machineName: string
  state: T['state']
  event?: T['event']
  detail?: string
}

export interface ServiceOptions<T extends MachineSchema> {
  /** 用户 props 的 getter，必须保持 getter 形态以维持响应性。 */
  props: () => Partial<Slice<T, 'props'>> & { id?: string, ids?: Dict<any>, getRootNode?: () => Node }
  runtime: ReactiveRuntime
  /** 宿主 DOM 环境；不传则内部用计数器 id 生成器建一个（无 DOM 场景/测试）。 */
  scope?: Scope
  inspect?: (event: InspectionEvent<T>) => void
}
