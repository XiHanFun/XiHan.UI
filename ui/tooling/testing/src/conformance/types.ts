import type { Anatomy } from '@xihan-ui/core'
import type { KeyboardTable } from '@xihan-ui/headless'

export type AdapterName = 'vue' | 'wc' | 'react' | 'blazor'
export type ModifierKey = 'Shift' | 'Control' | 'Alt' | 'Meta'
export type KeyName
  = | 'Enter' | 'Space' | 'Escape' | 'Tab' | 'Home' | 'End'
    | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'
    | 'PageUp' | 'PageDown' | 'Backspace' | 'Delete'
    | (string & {})

/** part 引用：单例直接用 part 名，集合类用 'item[2]' 下标寻址。 */
export type PartRef = string

// ── 结构描述：与框架无关的 fixture 树 ──

export interface FixtureNode {
  /** anatomy part 名（与 data-part 逐字相同）。省略 = 纯结构/业务节点。 */
  readonly part?: string
  /** 标签名。纯结构节点默认 'div'。 */
  readonly tag?: string
  readonly text?: string
  /** 业务属性（如 data-testid），不含 aria-、data-scope、data-part。 */
  readonly attrs?: Readonly<Record<string, string>>
  readonly children?: readonly FixtureNode[]
}

export interface Fixture {
  readonly component: string
  readonly props: Readonly<Record<string, unknown>>
  readonly tree: FixtureNode
}

// ── 快照 ──

export interface PartSnapshot {
  /** 归一化属性表；键已排序，缺失属性显式为 null。 */
  readonly attrs: Readonly<Record<string, string | null>>
  /** class 列表，已排序去重。 */
  readonly classNames: readonly string[]
}

/** 焦点落点：命中的 part、它在同名 part 中的下标、以及是否恰好是该 part 元素本身。 */
export interface ActiveElementRef {
  readonly part: string
  readonly index: number
  readonly exact: boolean
}

export interface AdapterEvent {
  readonly type: string
  readonly detail: unknown
}

/** 归一化后的 DOM 快照。 */
export interface DomSnapshot {
  /** part 名 → 该 part 的全部实例（文档序）。单例即长度 1 的数组。 */
  readonly parts: Readonly<Record<string, readonly PartSnapshot[]>>
  /** 文档序中的 part 顺序，集合项带下标：['trigger','content','item[0]']。 */
  readonly order: readonly string[]
  readonly activeElement: ActiveElementRef | null
  /** 自上一帧以来适配器对外派发的事件。 */
  readonly events: readonly AdapterEvent[]
  /** 带 data-scope 但不属于任何声明 part 的元素。 */
  readonly strayParts: readonly string[]
}

/** 单个 part 的属性期望；null 表示断言该属性缺失。 */
export type AttrExpectation = Readonly<Record<string, string | null>>

/**
 * 焦点落点期望：字符串 = 焦点在该 part 之内；
 * { part, exact: true } = 焦点恰为该 part 元素本身；exact: false = 焦点在其后代上。
 */
export type ActiveElementExpectation = PartRef | { readonly part: PartRef, readonly exact?: boolean }

/** 断言：深度子集匹配，未列出的 part 与属性忽略。 */
export interface SnapshotExpectation {
  readonly parts?: Readonly<Record<PartRef, AttrExpectation | readonly AttrExpectation[]>>
  readonly order?: readonly string[]
  readonly activeElement?: ActiveElementExpectation | null
  /** 每个 part 的实例数量。 */
  readonly counts?: Readonly<Record<string, number>>
  /** 期望自上一步以来派发的事件序列；空数组 = 断言没派发任何事件。 */
  readonly events?: readonly { readonly type: string, readonly detail?: unknown }[]
}

// ── 步骤 ──

/** 等待条件：等到某个可观察的 DOM 事实成立。 */
export type SettleCondition
  = | { readonly attr: { readonly part: PartRef, readonly name: string, readonly value: string | null } }
    | { readonly present: PartRef }
    | { readonly absent: PartRef }
    | { readonly activeElement: PartRef }

export interface RawStepContext {
  readonly root: HTMLElement
  readonly doc: Document
  readonly adapterName: AdapterName
  /** 等适配器把这一轮改动提交到 DOM。 */
  readonly flush: () => Promise<void>
}

export type Step
  = | { readonly kind: 'click', readonly part: PartRef, readonly modifiers?: readonly ModifierKey[] }
    | { readonly kind: 'dblclick', readonly part: PartRef }
    | {
      readonly kind: 'key'
      readonly key: KeyName
      readonly modifiers?: readonly ModifierKey[]
      readonly repeat?: number
      /** 派发成输入法组合期间的按键（isComposing 为真，keyCode 229 兼容不上报的输入法）。 */
      readonly composing?: boolean
    }
    | { readonly kind: 'type', readonly text: string }
    | { readonly kind: 'focus', readonly part: PartRef }
    | { readonly kind: 'blur' }
  /** 点击/按键作用于组件之外（外部关闭、失焦场景）。 */
    | { readonly kind: 'outside', readonly action: 'click' | 'focus' | 'key', readonly key?: KeyName }
  /** 由宿主驱动的 prop 变更（受控模式）。 */
    | { readonly kind: 'setProps', readonly props: Readonly<Record<string, unknown>> }
    | { readonly kind: 'settle', readonly until: SettleCondition, readonly timeoutMs?: number }
  /** 逃生舱口：需写明 why。 */
    | { readonly kind: 'raw', readonly why: string, readonly run: (ctx: RawStepContext) => void | Promise<void> }

export type StepWithExpect = Step & { readonly expect?: SnapshotExpectation }

// ── 用例与套件 ──

export interface ConformanceCase {
  readonly name: string
  /** 规格出处。 */
  readonly spec: { readonly apg?: string, readonly zag?: string, readonly adr?: string }
  /** 派生结构变体，省略则用套件默认 fixture。 */
  readonly fixture?: (base: FixtureNode) => FixtureNode
  readonly props?: Readonly<Record<string, unknown>>
  readonly steps?: readonly StepWithExpect[]
  /** 挂载后、任何步骤前的断言（第 0 帧）。 */
  readonly initial?: SnapshotExpectation
  /** 终态断言。 */
  readonly expect?: SnapshotExpectation
  /** 本用例覆盖的键盘表行 id（用于覆盖率反查）。 */
  readonly covers?: readonly string[]
  /** 跳过跨适配器逐帧比对的理由。 */
  readonly skipParity?: string
}

export interface ConformanceSuite {
  readonly component: string
  /** headless 导出的 anatomy 对象。 */
  readonly anatomy: Anatomy<string>
  /** 键盘表：覆盖率的分母。 */
  readonly keyboard: KeyboardTable
  /** 默认 fixture 结构树。 */
  readonly fixture: FixtureNode
  readonly cases: readonly ConformanceCase[]
}

// ── 适配器宿主 ──

export interface AdapterHarness {
  readonly adapterName: AdapterName
  /** 挂载 fixture 树，返回宿主根元素。 */
  mount: (fixture: Fixture) => Promise<{ root: HTMLElement }>
  setProps: (next: Readonly<Record<string, unknown>>) => Promise<void>
  /** 等待适配器自己的更新队列排空。 */
  flush: () => Promise<void>
  /** 取出并清空自上次调用以来派发的对外事件。 */
  drainEvents: () => readonly AdapterEvent[]
  unmount: () => Promise<void>
}

/** 注入测试运行钩子，避免耦合具体测试框架。 */
export interface TestHooks {
  describe: (name: string, fn: () => void) => void
  it: (name: string, fn: () => void | Promise<void>) => void
}
