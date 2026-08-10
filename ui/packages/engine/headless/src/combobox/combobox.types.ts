import type { Cleanup, ControlVariant, Layer, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 展开那一刻高亮落在哪里：
 * - none 不高亮（打字展开、点输入框展开都走这条）
 * - selected 停在当前选中项；它不在候选里就不高亮
 * - first / last 从集合两端进（收起态按上下键即走这条）
 */
export type ComboboxFocusIntent = 'none' | 'selected' | 'first' | 'last'

/**
 * 输入行为：
 * - none 只展开列表，不替用户挑候选；
 * - autohighlight 每次输入串变化后把高亮落到首个可选候选，回车即提交它；
 * - autocomplete 在 autohighlight 之上再做内联补全：把输入框补成首个候选的文本，
 *   补出的那段设为选区；删字（退格）时不补，否则删不动。
 */
export type ComboboxInputBehavior = 'none' | 'autohighlight' | 'autocomplete'

/** 输入框渲染成哪个标签：单行 input（缺省）或多行 textarea。 */
export type ComboboxInputHost = 'input' | 'textarea'

/** 输入宿主元素。机器只用到 focus / value / setSelectionRange，两种标签都提供。 */
export type ComboboxInputEl = HTMLInputElement | HTMLTextAreaElement

/** 输入部件自报宿主标签，connect 据此决定写不写 type 与组合框角色。 */
export interface ComboboxInputProps {
  /** 缺省 input。 */
  as?: ComboboxInputHost
}

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter；缺省时副作用一律短路。
export interface ComboboxRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
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
  /** 选中集合。单选模式下也是数组（长度 ≤ 1），形状不随模式变。 */
  value: string[]
}

export interface ComboboxInputValueChangeDetails {
  /** 输入框里的字符串。与选中值是两回事：过滤由调用方按它自己做。 */
  inputValue: string
}

/** 候选数据。给了 collection，显示文本与禁用就以它为准。 */
export interface ComboboxNode {
  value: string
  /** 展示文本，也是选中后回填输入框的取字处；缺省退回 value。 */
  label?: string
  /** 候选禁用：方向键跳过它，点击与回车都不选中它。 */
  disabled?: boolean
}

/** 单个候选的元信息，由 collection 推出，不含选中态与高亮态。 */
export interface ComboboxNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/**
 * 条目自报家门：值必报，禁用可由 collection 代为声明。
 * connect 不得反查 DOM：Vue 侧在 render 期求值（此时 DOM 不存在），WC 侧在 updated 后求值。
 */
export interface ComboboxItemProps {
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
  disabled?: boolean
}

/** 分组自报身份：分组标题的 id 由它派生，group 与 label 靠这一个值互相认领。 */
export interface ComboboxItemGroupProps {
  value: string
}

export interface ComboboxSchema extends MachineSchema {
  props: {
    /**
     * 候选数据，显示文本与禁用的事实源。过滤仍归调用方：交进来的就是此刻该显示的那几条。
     * 给了它，条目部件只需报 value，显示文本也不再从活 DOM 现查。
     * 缺省即回到「文本写在条目里、现查 DOM」的老路。
     */
    collection?: ComboboxNode[]
    /**
     * 选中值。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。
     * 单选写成裸串是简写，内部一律归一成数组。
     */
    value?: string | string[]
    defaultValue?: string | string[]
    /**
     * 输入框里的字符串。给定即受控，与选中值各自独立。
     * 过滤不由组件做：调用方拿这个串去筛条目，把筛完的结果重新渲染进来。
     */
    inputValue?: string
    defaultInputValue?: string
    /** 展开态。给定即受控：内部不再自改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 多选：选中是集合，选中后列表不收起、输入串清空以便接着筛。 */
    multiple?: boolean
    /** 整个控件禁用：输入框与两个按钮都用原生 disabled。 */
    disabled?: boolean
    /** 只读：文字可选可复制，但展开、选中、清空一概不发生。 */
    readOnly?: boolean
    /** 校验失败：输入框报 aria-invalid，各角色节点带 data-invalid。 */
    invalid?: boolean
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 输入框占位文字。 */
    placeholder?: string
    /** 允许提交候选列表里没有的值（回车与失焦时把输入串本身收成选中值）。 */
    allowCustomValue?: boolean
    /** 点输入框即展开，默认 false（只有触发按钮与方向键展开）。 */
    openOnClick?: boolean
    /** 输入行为，默认 none。 */
    inputBehavior?: ComboboxInputBehavior
    placement?: Placement
    offset?: number
    /** 形态：outline / subtle / ghost，决定输入行的描边与底色怎么用。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定输入行高度、内边距与字号档位。 */
    size?: Size
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: ComboboxValueChangeDetails) => void
    /** 输入串变化回调：调用方据此重新过滤候选。 */
    onInputValueChange?: (details: ComboboxInputValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: ComboboxOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /** 选中集合，恒为数组。受控（value 给定）时 cell 直读 prop。 */
    value: string[]
    /** 输入框里的字符串。受控（inputValue 给定）时 cell 直读 prop。 */
    inputValue: string
    /** 单选选中项的显示文本；由动作在 DOM 现查后回填，失焦复原输入串时要用。 */
    valueText: string | null
    /** 高亮候选，经 aria-activedescendant 上报给读屏；收起即清空。焦点始终不在它身上。 */
    highlightedValue: string | null
    /** 当前候选条数；null 表示尚未结算过（首帧、无 DOM 环境），此时不判定为空。 */
    itemCount: number | null
    /** 本次展开的落点意图；受控回写走 CONTROLLED.OPEN 时也读得到。 */
    focusIntent: ComboboxFocusIntent
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
    /** 消解层收到 Escape：先清高亮，高亮已空才收起。 */
    | { type: 'ESCAPE' }
    /** 用户在输入框里打字。deleting 标记这次是删字，内联补全据此让路。 */
    | { type: 'INPUT.CHANGE', value: string, deleting?: boolean }
    /** 程序化改写输入串：只落值，不展开、不触发输入行为。 */
    | { type: 'INPUT.SET', value: string }
    /** 焦点离开整个组件：收起并把输入串与选中值对齐。 */
    | { type: 'INPUT.BLUR' }
    | { type: 'ITEM.HIGHLIGHT', value: string }
    /** 选中候选。label 是条目当下的显示文本，由调用方在事件那一刻从 DOM 取。 */
    | { type: 'ITEM.SELECT', value: string, label?: string }
    /** 把输入串本身收成选中值（allowCustomValue 才生效）。 */
    | { type: 'VALUE.COMMIT' }
    /** 整体改写选中集合（退格删末项、外部 setValue 都走它）。 */
    | { type: 'VALUE.SET', value: string[] }
    /** 清空选中值与输入串。 */
    | { type: 'VALUE.CLEAR' }
    /**
     * 候选集合可能变了，重新结算条数并检查高亮有没有悬空。
     * 适配器每次提交完 DOM 都要发一次——过滤是调用方做的，机器无从预知何时变。
     */
    | { type: 'ITEMS.SYNC' }
  tag: never
  guard: 'isOpenControlled' | 'isMultiple' | 'hasHighlight'
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
  effect: 'trackPosition' | 'trackLayer'
}

export interface ComboboxApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** collection 推出的候选元信息，按数据顺序排列；没给 collection 即空数组。 */
  collection: readonly ComboboxNodeMeta[]
  /** 选中集合；单选模式下长度 ≤ 1，形状不随模式变。 */
  value: string[]
  /** 输入框里的字符串。 */
  inputValue: string
  /** 单选选中项的显示文本；无选中或多选时为 null。 */
  valueText: string | null
  /** 高亮候选；收起时为 null。焦点不在它身上，只经 aria-activedescendant 上报。 */
  highlightedValue: string | null
  multiple: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 候选为空（已结算且条数为 0）且当前展开：empty 角色节点据此显形。 */
  empty: boolean
  /** 清空按钮此刻可不可按。 */
  canClear: boolean
  isSelected: (value: string) => boolean
  setOpen: (next: boolean) => void
  setValue: (next: string[]) => void
  setInputValue: (next: string) => void
  clear: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  /** 不传参即单行 input，产出与加此参数前逐字相同。 */
  getInputProps: (props?: ComboboxInputProps) => T['input']
  getTriggerProps: () => T['button']
  getClearTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getItemGroupProps: (props: ComboboxItemGroupProps) => T['element']
  getItemGroupLabelProps: (props: ComboboxItemGroupProps) => T['element']
  getItemProps: (props: ComboboxItemProps) => T['element']
  getItemTextProps: (props: ComboboxItemProps) => T['element']
  getItemIndicatorProps: (props: ComboboxItemProps) => T['element']
  getEmptyProps: () => T['element']
}
