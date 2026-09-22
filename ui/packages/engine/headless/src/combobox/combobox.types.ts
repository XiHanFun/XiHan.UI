/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 combobox 类型契约。

import type { Cleanup, ControlVariant, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'

/**
 * 展开时高亮的落点：
 * - none 不高亮（输入展开、点击输入框展开都走这条）
 * - selected 停在当前选中项；它不在候选中则不高亮
 * - first / last 从集合两端进入（收起态按上下键即走这条）
 */
export type ComboboxFocusIntent = 'none' | 'selected' | 'first' | 'last'

/**
 * 输入行为：
 * - none 只展开列表，不替用户选择候选；
 * - autohighlight 每次输入串变化后把高亮落到首个可选候选，回车即提交它；
 * - autocomplete 在 autohighlight 之上再做内联补全：把输入框补为首个候选的文本，
 *   补出的部分设为选区；删字（退格）时不补全，否则无法删除。
 */
export type ComboboxInputBehavior = 'none' | 'autohighlight' | 'autocomplete'

/** 输入框渲染的标签：单行 input（默认）或多行 textarea。 */
export type ComboboxInputHost = 'input' | 'textarea'

/** 输入宿主元素。状态机只用到 focus / value / setSelectionRange，两种标签都提供。 */
export type ComboboxInputEl = HTMLInputElement | HTMLTextAreaElement

/** 输入部件声明宿主标签，connect 据此决定是否写入 type 与组合框角色。 */
export interface ComboboxInputProps {
  /** 默认 input。 */
  as?: ComboboxInputHost
}

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter；缺省时副作用一律短路。
export interface ComboboxRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场与行为资源共享的 Presence；未提供时关闭立即释放。 */
  presence: PresenceHandle | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，取整个输入行（control），浮层因此与输入框等宽对齐。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 消解层节点，同时是候选集合的查询容器。 */
  getContentEl: () => HTMLElement | null
  /** 输入框本体：焦点归还与内联补全的选区都落在它身上。 */
  getInputEl: () => ComboboxInputEl | null
}

export interface ComboboxOpenChangeDetails {
  open: boolean
}

export interface ComboboxValueChangeDetails {
  /** 选中集合。单选模式下也是数组（长度 ≤ 1），形状不随模式变化。 */
  value: string[]
}

export interface ComboboxInputValueChangeDetails {
  /** 输入框中的字符串。与选中值是两个概念：过滤由调用方按它自行完成。 */
  inputValue: string
}

/** 候选数据。提供 collection 时，显示文本与禁用以它为准。 */
export interface ComboboxNode {
  value: string
  /** 展示文本，也是选中后回填输入框的取字来源；默认回退为 value。 */
  label?: string
  /** 候选禁用：方向键跳过它，点击与回车都不选中它。 */
  disabled?: boolean
  /**
   * 该条候选自身的性质：危险选项写 danger、需要留意的写 warning。不写即与其余候选同档。
   * 只换字色与悬停 / 按下的面，不表达选中与校验；选中的标记与禁用都压过它。
   * 彩字不是唯一通道，要紧的差别仍要配图标或文案。整个组合框的 tone 不下发给候选。
   */
  tone?: Tone
  /**
   * 副文本，写入 item-description 部件；未提供时本条不铺该部件。
   * 它是第 2 行的说明，跟着条目走 muted 档，不跟语气；放不下一行的解释才用它，
   * 一句话能说清的写进 label。
   */
  description?: string
}

/** 单个候选的元信息，由 collection 推导，不含选中态与高亮态。 */
export interface ComboboxNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
  /** 该条自己写的语气；未提供时为 null。 */
  tone: Tone | null
  /** 副文本；未提供时为 null。 */
  description: string | null
}

/**
 * 条目声明的身份：值必须声明，禁用可由 collection 代为声明。
 * connect 不得反查 DOM：Vue 侧在 render 期求值（此时 DOM 不存在），WC 侧在 updated 后求值。
 */
export interface ComboboxItemProps {
  value: string
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

/** 分组声明的身份：分组标题的 id 由它派生，group 与 label 依靠该值互相关联。 */
export interface ComboboxGroupProps {
  value: string
}

/** 接了按压通道的三个部件：候选按 value 记，两个按钮只记部件。 */
export type ComboboxPressedPart = 'item' | 'trigger' | 'clear-trigger'

export interface ComboboxSchema extends MachineSchema {
  props: {
    /**
     * 候选数据，显示文本与禁用的事实源。过滤仍由调用方完成：传入的即当前应显示的候选。
     * 提供后条目部件只需声明 value，显示文本也不再从 DOM 查询。
     * 未提供时回到文本写在条目中、从 DOM 查询的方式。
     */
    collection?: ComboboxNode[]
    /**
     * 选中值。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。
     * 单选写为裸串是简写，内部一律归一为数组。
     */
    value?: string | string[]
    defaultValue?: string | string[]
    /**
     * 输入框中的字符串。提供即受控，与选中值各自独立。
     * 过滤不由组件完成：调用方用该串筛选条目，把筛选结果重新渲染进来。
     */
    inputValue?: string
    defaultInputValue?: string
    /** 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 多选：选中为集合，选中后列表不收起、输入串清空以便继续筛选。 */
    /** 表单字段名；hidden-input 按选中值逐个生成同名字段，不使用分隔符编码。 */
    name?: string
    /** 原生表单 ID；显式关联外部表单，提交与 reset 使用同一所有者。 */
    form?: string
    multiple?: boolean
    /** 整个控件禁用：输入框与两个按钮都使用原生 disabled。 */
    disabled?: boolean
    /** 只读：文字可选可复制，但展开、选中、清空一概不发生。 */
    readOnly?: boolean
    /** 校验失败：输入框报告 aria-invalid，各角色节点带 data-invalid。 */
    invalid?: boolean
    /** 候选加载中：列表报告 aria-busy，显示在途占位、隐藏空态占位。 */
    loading?: boolean
    /** 方向键到达末尾是否回绕，默认 true。 */
    loop?: boolean
    /** 输入框占位文字。 */
    placeholder?: string
    /** 读屏文案；未提供的键使用英文默认值。 */
    translations?: Partial<ComboboxTranslations>
    /** 允许提交候选列表中没有的值（回车与失焦时把输入串本身收为选中值）。 */
    allowCustomValue?: boolean
    /** 点击输入框即展开，默认 false（只有触发按钮与方向键展开）。 */
    openOnClick?: boolean
    /** 输入行为，默认 none。 */
    inputBehavior?: ComboboxInputBehavior
    placement?: Placement
    /** 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 */
    dir?: Direction
    offset?: number
    /** 形态：outline / subtle / ghost，决定输入行的描边与底色使用方式。默认 outline。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定输入行高度、内边距与字号档位。 */
    size?: Size
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: ComboboxValueChangeDetails) => void
    /** 输入串变化回调：调用方据此重新过滤候选。 */
    onInputValueChange?: (details: ComboboxInputValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: ComboboxOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读取它，不涉及 DOM 也不调用引擎。 */
    position: PositionResult | null
    /** 选中集合，恒为数组。受控（value 提供）时 cell 直读 prop。 */
    value: string[]
    /** 输入框中的字符串。受控（inputValue 提供）时 cell 直读 prop。 */
    inputValue: string
    /** 单选选中项的显示文本；由动作从 DOM 查询后回填，失焦复原输入串时使用。 */
    valueText: string | null
    /** 高亮候选，经 aria-activedescendant 上报给读屏；收起即清空。焦点始终不在它身上。 */
    highlightedValue: string | null
    /** 当前候选条数；null 表示尚未结算（首帧、无 DOM 环境），此时不判定为空。 */
    itemCount: number | null
    /** 本次展开的落点意图；受控回写经 CONTROLLED.OPEN 时也可读取。 */
    focusIntent: ComboboxFocusIntent
    /** 按压通道：Enter 或触屏按住的是候选、展开按钮还是清空按钮。 */
    pressedPart: ComboboxPressedPart | null
    /** 按压通道：按住的候选 value；两个按钮没有 value，记 null。抬起、失焦或浮层收起即清空。 */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: ComboboxRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN', focus?: ComboboxFocusIntent }
    | { type: 'TOGGLE', focus?: ComboboxFocusIntent }
    | { type: 'CLOSE' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    /** 消解层收到 Escape：先清除高亮，高亮已空才收起。 */
    | { type: 'ESCAPE' }
    /** 用户在输入框中输入。deleting 标记本次为删字，内联补全据此让位。 */
    | { type: 'INPUT.CHANGE', value: string, deleting?: boolean }
    /** 程序化改写输入串：只落值，不展开、不触发输入行为。 */
    | { type: 'INPUT.SET', value: string }
    /** 焦点离开整个组件：收起并把输入串与选中值对齐。 */
    | { type: 'INPUT.BLUR' }
    | { type: 'ITEM.HIGHLIGHT', value: string }
    | { type: 'HIGHLIGHT.CLEAR' }
    /** 选中候选。label 是条目当前的显示文本，由调用方在事件发生时从 DOM 获取。 */
    | { type: 'ITEM.SELECT', value: string, label?: string }
    /** 把输入串本身收为选中值（allowCustomValue 时才生效）。 */
    | { type: 'VALUE.COMMIT' }
    /** 整体改写选中集合（退格删除末项、外部 setValue 都经过它）。 */
    | { type: 'VALUE.SET', value: string[] }
    /** 清空选中值与输入串。 */
    | { type: 'VALUE.CLEAR' }
    /**
     * 候选集合可能已变化，重新结算条数并检查高亮是否悬空。
     * 适配器每次提交完 DOM 都要发一次：过滤由调用方完成，状态机无法预知何时变化。
     */
    | { type: 'ITEMS.SYNC' }
    | { type: 'FORM.RESET' }
    /**
     * 候选、展开按钮或清空按钮被 Enter 或触屏按住。候选的键盘按压由输入框代发（焦点恒在输入框，
     * 高亮候选自己收不到按键）；disabled 是候选自身的禁用事实，由 connect 判定后随事件带入。
     */
    | { type: 'PRESS.START', part: ComboboxPressedPart, value?: string, disabled?: boolean }
    /** 按住的部件抬起、失焦或指针取消；只松开 part + value 对应的那一个。 */
    | { type: 'PRESS.END', part: ComboboxPressedPart, value?: string }
  tag: never
  guard: 'isOpenControlled' | 'isMultiple' | 'hasHighlight' | 'canPress'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'syncOpen'
    | 'setFocusIntent'
    | 'setInitialHighlightedValue'
    | 'setHighlightedValue'
    | 'clearHighlightedValue'
    | 'setInputValue'
    | 'refreshAfterInput'
    | 'syncItems'
    | 'syncValueText'
    | 'prefillInputValue'
    | 'selectItem'
    | 'commitInputValue'
    | 'setValue'
    | 'clearValue'
    | 'reconcileInput'
    | 'resetToDefault'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseWhenInert'
  effect: 'trackPosition' | 'trackLayer'
}

export interface ComboboxApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 由 collection 推导的候选元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly ComboboxNodeMeta[]
  /** 选中集合；单选模式下长度 ≤ 1，形状不随模式变化。 */
  value: string[]
  /** 输入框中的字符串。 */
  inputValue: string
  /** 单选选中项的显示文本；无选中或多选时为 null。 */
  valueText: string | null
  /** 高亮候选；收起时为 null。焦点不在它身上，只经 aria-activedescendant 上报。 */
  highlightedValue: string | null
  multiple: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 候选为空（已结算且条数为 0）且当前展开：empty 角色节点据此显示。 */
  empty: boolean
  /** 清空按钮当前是否可按。 */
  canClear: boolean
  isSelected: (value: string) => boolean
  setOpen: (next: boolean) => void
  setValue: (next: string[]) => void
  setInputValue: (next: string) => void
  clear: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  /** 不传参即单行 input，产出与增加此参数前逐字相同。 */
  getInputProps: (props?: ComboboxInputProps) => T['input']
  getTriggerProps: () => T['button']
  getClearTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getGroupProps: (props: ComboboxGroupProps) => T['element']
  getGroupLabelProps: (props: ComboboxGroupProps) => T['element']
  getItemProps: (props: ComboboxItemProps) => T['element']
  getItemPrefixProps: (props: ComboboxItemProps) => T['element']
  getItemTextProps: (props: ComboboxItemProps) => T['element']
  getItemDescriptionProps: (props: ComboboxItemProps) => T['element']
  getItemSuffixProps: (props: ComboboxItemProps) => T['element']
  getItemIndicatorProps: (props: ComboboxItemProps) => T['element']
  getEmptyProps: () => T['element']
  /**
   * 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。
   * 与 content 是兄弟，同样不进入 role=listbox。
   */
  getLoadingProps: () => T['element']
  /** 单值表单出口；按 api.value 逐个调用并生成同名 input，零选中不生成提交项。 */
  getHiddenInputProps: (props: { value: string }) => T['input']
}

/** 读屏文案。 */
export interface ComboboxTranslations {
  /**
   * 展开按钮的无障碍名，默认 'Show suggestions'。
   * 该按钮内通常只有一个箭头，没有名字时读屏只能朗读「按钮」。
   */
  trigger: string
  /** 清空按钮的无障碍名，默认 'Clear'。 */
  clearTrigger: string
}
