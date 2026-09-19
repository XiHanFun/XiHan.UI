/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 mention 类型契约。

import type { Cleanup, ControlVariant, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'

/** 输入宿主元素。状态机只使用 value 与 setSelectionRange。 */
export type MentionInputEl = HTMLInputElement

/**
 * 光标处的一次触发。
 * index 是前缀首字符在正文中的下标，query 是前缀之后到光标之间的片段（不含空白）。
 */
export interface MentionTrigger {
  /** 命中的前缀串。 */
  prefix: string
  /** 前缀在正文中的起始下标。 */
  index: number
  /** 前缀到光标之间的查询串，宿主据此过滤候选。 */
  query: string
}

/** 候选数据。提供 collection 时，显示文本与禁用以它为准。 */
export interface MentionNode {
  value: string
  /** 展示文本，也是插回正文的文字；默认回退为 value。 */
  label?: string
  /** 候选禁用：方向键跳过它，点击与回车都不选中它。 */
  disabled?: boolean
}

/** 单个候选的元信息，由 collection 推导。 */
export interface MentionNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/** 条目声明的身份：值必须声明，禁用可由 collection 代为声明。 */
export interface MentionItemProps {
  value: string
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

/** 组件自带的固定文案，作者按自己的语言提供。 */
export interface MentionTranslations {
  /** 候选浮层的可及名，默认 'Mentions'。role=listbox 必须有名字。 */
  content?: string
  /**
   * 输入框的可及名。未提供时整条不输出：作者自行编写 `<label for>` 或直接在 input 部件上
   * 标注 aria-label 时，输出一条空的 aria-label 会覆盖作者的声明。
   */
  input?: string
}

export interface MentionValueChangeDetails {
  /** 整段正文。提及不是独立的值，直接写在正文中。 */
  value: string
}

export interface MentionQueryChangeDetails {
  /** 当前查询串；没有触发时为 null。 */
  query: string | null
  /** 触发本次查询的前缀；没有触发时为 null。 */
  prefix: string | null
}

export interface MentionSelectDetails {
  /** 被选中候选的值。 */
  value: string
  /** 实际插入正文的文本。 */
  label: string
  /** 该条提及使用的前缀。 */
  prefix: string
}

export interface MentionOpenChangeDetails {
  open: boolean
}

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter；缺省时副作用一律短路。
export interface MentionRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场与行为资源共享的 Presence；未提供时关闭立即释放。 */
  presence: PresenceHandle | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 消解层节点，同时是候选集合的查询容器。 */
  getContentEl: () => HTMLElement | null
  /** 输入框本体，同时是浮层的定位锚点：插入后的光标落位也写在它身上。 */
  getInputEl: () => MentionInputEl | null
}

export interface MentionSchema extends MachineSchema {
  props: {
    /**
     * 打开候选的前缀字符，默认 '@'。提供数组即多种前缀并存，宿主按 onQueryChange 报回的 prefix 分流。
     * 前缀必须紧跟在行首或空白之后，邮箱地址中的 @ 因此不会误触发。
     */
    triggerPrefix?: string | string[]
    /**
     * 候选数据，显示文本与禁用的事实源。过滤仍由调用方完成：传入的即当前应显示的候选。
     * 组件不负责筛选，只负责交出查询串。
     */
    collection?: MentionNode[]
    /** 整段正文。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 */
    value?: string
    defaultValue?: string
    /** 整个控件禁用：输入框使用原生 disabled，候选一概不打开。 */
    disabled?: boolean
    /** 只读：正文仍可聚焦与复制，不可修改，候选也不打开。 */
    readOnly?: boolean
    /** 校验失败标注：描边与聚焦环换为失败色，同时经 aria-invalid 上报。 */
    invalid?: boolean
    /** 候选加载中：候选面板报告 aria-busy，显示在途占位、隐藏空态占位。 */
    loading?: boolean
    /** 输入框占位文字。未提供时整条不输出，作者写在 input 部件上的声明因此得以保留。 */
    placeholder?: string
    /** 表单字段名；提供后输入框才带 name，整段正文随表单一并提交。 */
    name?: string
    /** 方向键到达末尾是否回绕，默认 true。 */
    loop?: boolean
    placement?: Placement
    /** 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 */
    dir?: Direction
    offset?: number
    translations?: MentionTranslations
    /** 形态：outline / subtle / ghost，决定输入框的描边与底色使用方式。默认 outline。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与高亮使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定输入框内边距与字号档位。 */
    size?: Size
    /** 正文变化回调；受控时是唯一出口。 */
    onValueChange?: (details: MentionValueChangeDetails) => void
    /** 查询串变化回调：调用方据此重新过滤候选。收起时报告 null。 */
    onQueryChange?: (details: MentionQueryChangeDetails) => void
    /** 候选被插入正文时回调，附带是哪一条。 */
    onSelect?: (details: MentionSelectDetails) => void
    /** 浮层开合回调。 */
    onOpenChange?: (details: MentionOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读取它，不涉及 DOM 也不调用引擎。 */
    position: PositionResult | null
    /** 整段正文。受控（value 提供）时 cell 直读 prop。 */
    value: string
    /** 光标处的触发；null 即当前没有触发。 */
    trigger: MentionTrigger | null
    /** 被 Escape 关闭过的触发点下标：光标不离开该位置就不再自动展开。 */
    dismissedIndex: number | null
    /** 高亮候选，经 aria-activedescendant 上报给读屏；收起即清空。焦点始终不在它身上。 */
    highlightedValue: string | null
    /** 当前候选条数；null 表示尚未结算。 */
    itemCount: number | null
    /**
     * 按压通道：触屏按住的候选 value；抬起、指针取消或浮层收起即清空。
     * 焦点恒在输入框，Enter 在同一次 keydown 里插入并收起，键盘那一路没有可见的按住帧，只有触屏进这条通道。
     */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: MentionRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    /** 消解层收到 Escape：收起并记录该位置，光标不移开就不再自动展开。 */
    | { type: 'ESCAPE' }
    /** 用户修改了正文。caret 是修改完成时的光标位置。 */
    | { type: 'INPUT.CHANGE', value: string, caret: number }
    /** 正文未变、光标移动（点击、左右方向键、Home/End）。value 用于识别 DOM 是否已同步。 */
    | { type: 'CARET.SYNC', value: string, caret: number }
    /** 程序化改写整段正文：落值并收起浮层。 */
    | { type: 'VALUE.SET', value: string }
    | { type: 'ITEM.HIGHLIGHT', value: string }
    /** 把候选插入正文。label 是条目当前的显示文本，由调用方在事件发生时从 DOM 获取。 */
    | { type: 'ITEM.SELECT', value: string, label?: string }
    /**
     * 候选集合可能已变化，重新结算条数并检查高亮是否悬空。
     * 适配器每次提交完 DOM 都要发一次：过滤由调用方完成，状态机无法预知何时变化。
     */
    | { type: 'ITEMS.SYNC' }
    | { type: 'FORM.RESET' }
    /** 候选被触屏按住；disabled 是候选自身的禁用事实，由 connect 判定后随事件带入。 */
    | { type: 'PRESS.START', value: string, disabled?: boolean }
    /** 按住的候选抬起或指针取消；只松开 value 对应的那一个。 */
    | { type: 'PRESS.END', value: string }
  tag: never
  guard: 'canPress'
  action:
    | 'resetToDefault'
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'setValue'
    | 'replaceValue'
    | 'syncTrigger'
    | 'refreshCandidates'
    | 'syncItems'
    | 'highlightFirst'
    | 'ensureHighlight'
    | 'setHighlightedValue'
    | 'clearHighlightedValue'
    | 'dismissHere'
    | 'selectItem'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseWhenInert'
  effect: 'trackPosition' | 'trackLayer'
}

export interface MentionApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 由 collection 推导的候选元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly MentionNodeMeta[]
  /** 整段正文。 */
  value: string
  /** 当前查询串；没有触发时为 null。 */
  query: string | null
  /** 触发本次查询的前缀；没有触发时为 null。 */
  activePrefix: string | null
  /** 高亮候选；收起时为 null。焦点不在它身上，只经 aria-activedescendant 上报。 */
  highlightedValue: string | null
  disabled: boolean
  /** 没有候选可显示：提供了 collection 且没有剩余条目。作者据此显示空态部件。 */
  empty: boolean
  isHighlighted: (value: string) => boolean
  /** 整段改写正文，浮层随之收起。 */
  setValue: (next: string) => void
  close: () => void
  getRootProps: () => T['element']
  /** 标题；`for` 恒指向 input，因此须是原生 `<label>`。 */
  getLabelProps: () => T['label']
  /** 单行输入框；正文写在它身上。 */
  getInputProps: () => T['input']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  /** 没有任何候选时显示的空态；有候选时带 hidden 收起。 */
  getEmptyProps: () => T['element']
  /**
   * 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。
   * 同样是 content 的兄弟，不进入 role=listbox。
   */
  getLoadingProps: () => T['element']
  getItemProps: (props: MentionItemProps) => T['element']
  getItemTextProps: (props: MentionItemProps) => T['element']
}
