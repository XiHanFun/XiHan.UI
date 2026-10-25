/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 combobox 类型契约。

import type { Cleanup, ControlVariant, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { SelectionValueKey } from '../shared/value-codec'
import type { CollectionVirtualizer } from '../virtualizer'

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

/** V 是选中值的类型，缺省 string；数字、对象都行，见 ComboboxSchema 的 valueKey。 */
export interface ComboboxValueChangeDetails<V = string> {
  /** 选中集合。单选模式下也是数组（长度 ≤ 1），形状不随模式变化。 */
  value: V[]
}

export interface ComboboxInputValueChangeDetails {
  /** 输入框中的字符串。与选中值是两个概念：没给 filter 时过滤由调用方按它自行完成。 */
  inputValue: string
}

/** 候选数据。提供 collection 时，显示文本与禁用以它为准。 */
export interface ComboboxNode<V = string> {
  value: V
  /** 展示文本，也是选中后回填输入框的取字来源；默认回退为值（不是字符串的值退回它的键）。 */
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

/** 内置过滤的口径：显示文本包含检索词，或以检索词开头；都不分大小写。 */
export type ComboboxFilterMode = 'contains' | 'startsWith'

/** 自定义过滤：返回真即保留这条候选。query 是用户打的检索词，已 trim 且非空。 */
export type ComboboxFilter<V = string> = (node: ComboboxNode<V>, query: string) => boolean

/** 单个候选的元信息，由 collection 推导，不含选中态与高亮态。 */
export interface ComboboxNodeMeta<V = string> {
  value: V
  /** 值的键：字符串值即它本身，别的值是编出来的键。条目的 data-value 与列表里的 key 用它。 */
  key: string
  /** node.label，没写时退回值（不是字符串的值退回它的键），恒为字符串。 */
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
export interface ComboboxItemProps<V = string> {
  value: V
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

/** 分组声明的身份：分组标题的 id 由它派生，group 与 label 依靠该值互相关联。 */
export interface ComboboxGroupProps {
  value: string
}

/** 接了按压通道的三个部件：候选按 value 记，两个按钮只记部件。 */
export type ComboboxPressedPart = 'item' | 'trigger' | 'clear-trigger'

/**
 * V 是选中值的类型，缺省 string。机器与 DOM 只认字符串键：值进来时编成键（字符串原样，数字转字符串，
 * 对象按 valueKey），onValueChange 与 api 交出去时解回原值；filter 拿到的也是作者给的那一条。
 */
export interface ComboboxSchema<V = string> extends MachineSchema {
  props: {
    /**
     * 作者渲染了 label 部件时置真，由适配器统计而不是判断标题文字是否有值。
     * 为假时可聚焦部件不把 label 的 id 写进 aria-labelledby：指向未渲染的 id 是无效引用，作者写在控件上的 aria-label 也会被它压住。
     */
    labelled?: boolean
    /**
     * 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上。
     * 放进字段（字段接线）或渲染了 label 部件时名字以它们为准，aria-labelledby 盖过它。
     */
    ariaLabel?: string
    /**
     * 候选数据，显示文本与禁用的事实源。给了 filter 时传全集，组件按用户打的字筛；
     * 没给时过滤由调用方完成，传入的即当前应显示的候选。
     * 提供后条目部件只需声明 value，显示文本也不再从 DOM 查询。
     * 未提供时回到文本写在条目中、从 DOM 查询的方式。
     */
    collection?: ComboboxNode<V>[]
    /**
     * 对象值怎样取键：字段名或取值函数。同一个选项每次都是新对象（接口刚取回来）时给它；
     * 不给时按对象身份认。值不是对象时用不着。键也是条目的 data-value 与随表单提交的值。
     */
    valueKey?: SelectionValueKey<V>
    /**
     * 内置过滤：'contains' 显示文本包含检索词，'startsWith' 以检索词开头，都不分大小写；也可以给一个函数自己判。
     * 检索词是用户打的那段字，不是输入框里的字：选中后回显的选中项文字、内联补全补出的那段都不拿去筛，
     * 再展开时看到的是全部候选。没给即不过滤（远程搜索就不给，候选由调用方按 onInputValueChange 换）。
     * 只作用于 collection，不给 collection 时没有效果。
     */
    filter?: ComboboxFilterMode | ComboboxFilter<V>
    /** 当前候选（给了 filter 即筛过的那份，见 api.collection）与 Virtualizer 的滚动桥；count 必须与 api.collection.length 一致。 */
    virtualizer?: CollectionVirtualizer
    /**
     * 选中值。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。
     * 单选写为裸串是简写，内部一律归一为数组。
     */
    value?: V | V[]
    defaultValue?: V | V[]
    /**
     * 输入框中的字符串。提供即受控，与选中值各自独立。
     * 没给 filter 时过滤不由组件完成：调用方用该串筛选条目，把筛选结果重新渲染进来。
     */
    inputValue?: string
    defaultInputValue?: string
    /** 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 表单字段名；hidden-input 按选中值逐个生成同名字段，不使用分隔符编码。 */
    name?: string
    /** 原生表单 ID；显式关联外部表单，提交与 reset 使用同一所有者。 */
    form?: string
    /** 多选：选中为集合，选中后列表不收起、输入串清空以便继续筛选；已选项在输入框前排成标签。 */
    multiple?: boolean
    /** 多选标签最多显示的数量，其余折叠进 overflowCount、合成 +N 标签；默认 3。 */
    maxTagCount?: number
    /** 整个控件禁用：输入框与两个按钮都使用原生 disabled。 */
    disabled?: boolean
    /** 只读：文字可选可复制，但展开、选中、清空一概不发生。 */
    readOnly?: boolean
    /** 校验失败：输入框报告 aria-invalid，各角色节点带 data-invalid。 */
    invalid?: boolean
    /**
     * 必填：输入框报告 aria-required，根与标题带 data-required（标题据此画星号）。
     * 一个选中值一份表单影子，没选值时没有影子；此时补一份空值的占位影子带原生 required，拦下空表单的提交。
     */
    required?: boolean
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
    onValueChange?: (details: ComboboxValueChangeDetails<V>) => void
    /** 用户按清空钮（clear-trigger）清掉了值；先发值变化，再发它。程序化的 clear() 不发。 */
    onClear?: () => void
    /** 输入串变化回调：没给 filter 时调用方据此重新过滤候选。 */
    onInputValueChange?: (details: ComboboxInputValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: ComboboxOpenChangeDetails) => void
  }
  context: {
    /**
     * 挂载时开着、还没收起过：这一段打开属于首帧，content 投影 data-instant 直接呈现、不播进场。
     * 第一次收起时清掉，之后的每一次打开照常进场。
     */
    openedAtMount: boolean
    /** 定位引擎回填的最新结果；connect 只读取它，不涉及 DOM 也不调用引擎。 */
    position: PositionResult | null
    /** 选中集合，恒为数组。受控（value 提供）时 cell 直读 prop。 */
    value: string[]
    /** 输入框中的字符串。受控（inputValue 提供）时 cell 直读 prop。 */
    inputValue: string
    /**
     * 内置过滤拿去筛候选的检索词：用户打的那段字（及程序化 setInputValue 写进来的串）。
     * 选中、提交自定义值、清空、失焦对齐与表单重置时清掉；内联补全改写输入框时不动它。
     */
    filterQuery: string
    /** 单选选中项的显示文本；由动作从 DOM 查询后回填，失焦复原输入串时使用。 */
    valueText: string | null
    /**
     * 选中值见过的显示文本，按值记：选中那一刻带来的、按 collection 或 DOM 结算出的都记下。
     * 候选由调用方过滤，已选项常常不在当前候选里，标签的文字只能从这里取。只增不减。
     */
    valueLabels: Record<string, string>
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
    /** 标签行的列表动效已经接上；接上之前 tag-list 带 data-instant，首帧的标签一律不播进场。 */
    tagListTracked: boolean
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
    /** 标签行的列表动效已接上：之后到达的标签才播进场。 */
    | { type: 'TAG_LIST.TRACKED' }
  tag: never
  guard: 'isOpenControlled' | 'isMultiple' | 'hasHighlight' | 'canPress'
  action:
    | 'markTagListTracked'
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
    | 'clearOpenedAtMount'
  effect: 'trackPosition' | 'trackLayer' | 'trackTagListMotion'
}

/** 标签声明的身份：代表哪个选中值。 */
export interface ComboboxTagProps<V = string> {
  value: V
}

/** 可见标签的数据：值与显示文本。 */
export interface ComboboxTagMeta<V = string> {
  value: V
  /** 值的键：字符串值即它本身，别的值是编出来的键。标签的 data-value 与列表里的 key 用它。 */
  key: string
  label: string
}

/** V 是选中值的类型：value、tags、collection 与高亮交出原值，收值的 getter 与动作也收原值。 */
export interface ComboboxApi<T extends PropTypes = PropTypes, V = string> {
  open: boolean
  /** 解析后的读屏文案；loading 没写内容时显示其中的 loading。 */
  translations: ComboboxTranslations
  /** 当下的候选元信息：由 collection 推导，给了 filter 即按检索词筛过，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly ComboboxNodeMeta<V>[]
  /** 选中集合；单选模式下长度 ≤ 1，形状不随模式变化。 */
  value: V[]
  /** 选中值的键，与 value 逐项对应：字符串值即它本身，别的值是编出来的键。条目的 data-value 与随表单提交的都是它。 */
  valueKeys: string[]
  /** 输入框中的字符串。 */
  inputValue: string
  /** 单选选中项的显示文本；无选中或多选时为 null。 */
  valueText: string | null
  /** 高亮候选；收起时为 null。焦点不在它身上，只经 aria-activedescendant 上报。 */
  highlightedValue: V | null
  multiple: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  required: boolean
  /** 候选为空（已结算且条数为 0）且当前展开：empty 角色节点据此显示。 */
  empty: boolean
  /** 清空按钮当前是否可按。 */
  canClear: boolean
  /** 多选时可见的标签（受 maxTagCount 截断），与 value 同序；单选恒为空数组，选中项的文字在输入框里。 */
  tags: ComboboxTagMeta<V>[]
  /** 被 maxTagCount 折叠的标签数。 */
  overflowCount: number
  /** +N 标签显示的文字（由 translations.overflowTag 计算）；没有折叠的标签时为空串。 */
  overflowText: string
  isSelected: (value: V) => boolean
  setOpen: (next: boolean) => void
  setValue: (next: V[]) => void
  setInputValue: (next: string) => void
  clear: () => void
  /** 移除一个选中值。 */
  deselect: (value: V) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  /** 标签行：放在盒里、输入框之前，收纳可见标签与 +N 标签；单选或无选中时整体 hidden。 */
  getTagListProps: () => T['element']
  /** 标签：一个选中值一个，即库内 tag 的 root（data-scope="tag"）：语气、尺寸与禁用从本控件传下，形态按控件的面派生，另带 data-value 记录代表的值。 */
  getTagProps: (props: ComboboxTagProps<V>) => T['element']
  /** 标签文字所在的块（tag 的 label）：截断落在这一层；标签与 +N 共用。 */
  getTagLabelProps: () => T['element']
  /** 被折叠的标签合成的一个：同样是 tag 的 root，显示 overflowText、带 data-count；没有折叠的标签时 hidden。 */
  getOverflowTagProps: () => T['element']
  /**
   * 标签删除按钮：即所在标签那份 tag 的 close-trigger（data-scope="tag"），可及名使用 translations.deleteItem，
   * 禁用与只读时保留位置、原生 disabled。不占 Tab 位，按下不夺焦：焦点留在输入框，键盘用退格删掉最后一个。
   */
  getItemDeleteTriggerProps: (props: ComboboxTagProps<V>) => T['button']
  /** 不传参即单行 input，产出与增加此参数前逐字相同。 */
  getInputProps: (props?: ComboboxInputProps) => T['input']
  getTriggerProps: () => T['button']
  getClearTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getGroupProps: (props: ComboboxGroupProps) => T['element']
  getGroupLabelProps: (props: ComboboxGroupProps) => T['element']
  getItemProps: (props: ComboboxItemProps<V>) => T['element']
  getItemPrefixProps: (props: ComboboxItemProps<V>) => T['element']
  getItemTextProps: (props: ComboboxItemProps<V>) => T['element']
  getItemDescriptionProps: (props: ComboboxItemProps<V>) => T['element']
  getItemSuffixProps: (props: ComboboxItemProps<V>) => T['element']
  getItemIndicatorProps: (props: ComboboxItemProps<V>) => T['element']
  getEmptyProps: () => T['element']
  /**
   * 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。
   * 与 content 是兄弟，同样不进入 role=listbox。
   */
  getLoadingProps: () => T['element']
  /** 单值表单出口；按 api.value 逐个调用并生成同名 input，零选中不生成提交项。不给 value 是必填且没选值时的空值占位，带原生 required。 */
  getHiddenInputProps: (props?: { value: string }) => T['input']
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
  /** 标签删除按钮的可及名，接收标签文本；默认 `Delete <label>`。 */
  deleteItem: (label: string) => string
  /** 被折叠的标签（overflow-tag）显示的文字，接收折叠的个数；默认 +N。 */
  overflowTag: (count: number) => string
  /** 候选取数在途时 loading 部件里的文字，默认 'Loading'。 */
  loading: string
}
