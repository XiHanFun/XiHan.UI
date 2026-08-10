import type { Typeahead } from '@xihan-ui/behavior'
import type { Cleanup, Direction, Layer, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 展开那一刻高亮落在哪里：
 * - selected 停在当前选中项（无选中或该项禁用时退回首个可停留条目）
 * - first / last 从集合两端进
 * - next / prev 从当前选中项起步走一步（收起态的上下键即走这条）
 */
export type SelectFocusIntent = 'selected' | 'first' | 'last' | 'next' | 'prev'

// 适配器挂载前填入；保持缺省时副作用短路，机器状态照常转移但不定位、不挂消解层与焦点域。
export interface SelectRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，通常是 trigger。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器、消解层节点，同时是条目集合的查询容器。 */
  getContentEl: () => HTMLElement | null
  /** 连打检索缓冲。随服务存活，收起时清空，收起态与展开态共用同一份。 */
  typeahead: Typeahead
}

export interface SelectOpenChangeDetails {
  open: boolean
}

export interface SelectValueChangeDetails {
  value: string[]
}

/** 条目数据。给了 collection，显示文本与禁用就以它为准。 */
export interface SelectNode {
  value: string
  /** 展示文本，也是连打检索的取字处；缺省退回 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单个条目的元信息，由 collection 推出，不含选中态与高亮态。 */
export interface SelectNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/**
 * 条目自报家门：值必报，禁用可由 collection 代为声明。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface SelectItemProps {
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
  disabled?: boolean
}

export interface SelectSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value，
     * 显示文本也不再从活 DOM 现查。缺省即回到「文本写在条目里、现查 DOM」的老路。
     */
    collection?: SelectNode[]
    /**
     * 选中值。裸串是单选的简写，null 是「受控且无选中」，缺省（undefined）才是非受控；内部一律按数组处理。
     * 受控时 cell 直读 prop，写只发 onValueChange 不落内部值。
     */
    value?: string | string[] | null
    /** 非受控初始选中值。与 value 同样接受裸串与 null。 */
    defaultValue?: string | string[] | null
    /** 允许选中多项。单选时选完即收起，多选时保持展开继续选。 */
    multiple?: boolean
    /** 展开态。给定即受控：内部不再自改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 整个控件禁用：trigger 用原生 disabled，隐藏 select 不参与提交。 */
    disabled?: boolean
    /** 原生表单校验：无选中值时提交被拦下。 */
    required?: boolean
    /** 表单字段名。给定后隐藏 select 才带 name，选中值随表单一并提交。 */
    name?: string
    /** 无选中时 value-text 显示的占位文字。 */
    placeholder?: string
    placement?: Placement
    offset?: number
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr。 */
    dir?: Direction
    /** 形态：outline / subtle / ghost，决定触发器的描边与底色怎么用。 */
    variant?: string
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调用哪族颜色。 */
    tone?: string
    /** 尺寸：sm / md / lg，决定触发器高度、内边距与字号档位。 */
    size?: string
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: SelectValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: SelectOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /** 选中值。受控（value 给定）时 cell 直读 prop。单选恒为长度 ≤ 1。 */
    value: string[]
    /** 选中项的显示文本，与 value 逐项对应。由动作在 DOM 现查后回填，connect 只读。 */
    valueText: string[]
    /** roving tabindex 的锚点，同时是方向键与确认键的起点；收起即清空。 */
    highlightedValue: string | null
    /** 本次展开的落点意图；受控回写走 CONTROLLED.OPEN 时也读得到。 */
    focusIntent: SelectFocusIntent
    /** 关闭时是否把焦点归还 trigger；Tab 与层外交互关闭时为 false。 */
    returnFocus: boolean
  }
  computed: Record<string, never>
  refs: SelectRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN', focus?: SelectFocusIntent }
    | { type: 'TOGGLE', focus?: SelectFocusIntent }
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    | { type: 'ITEM.HIGHLIGHT', value: string }
    /** 持有焦点的条目离开了 DOM：浏览器不派 focusout，由适配器如实上报。 */
    | { type: 'ITEM.LOST' }
    /** 选中条目。单选选完即收起，多选保持展开并在集合里增删该项。 */
    | { type: 'ITEM.SELECT', value: string }
    /** 整体改写选中集合（收起态连打检索、外部 setValue 都走它）。裸串同 props 一样按单选简写处理。 */
    | { type: 'VALUE.SET', value: string | string[] }
  tag: never
  guard: 'isOpenControlled' | 'isMultiple'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'syncOpen'
    | 'syncValueText'
    | 'setValue'
    | 'normalizeValue'
    | 'setFocusIntent'
    | 'setReturnFocus'
    | 'setHighlightedValue'
    | 'setInitialHighlightedValue'
    | 'clearHighlightedValue'
    | 'clearTypeahead'
  effect: 'trackPosition' | 'trackLayer'
}

export interface SelectApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 */
  collection: readonly SelectNodeMeta[]
  /** 选中集合，按选中先后排列而非文档顺序。单选恒为长度 ≤ 1。 */
  value: string[]
  /** 选中项的文本，与 value 逐项等长对应；某项在 DOM 里查不到条目时该项退回值本身。 */
  valueText: string[]
  /** value-text 实际显示的文字：有选中取其文本（多选按半角逗号加空格连起来），否则取 placeholder。 */
  displayText: string
  /** 是否允许多选。 */
  multiple: boolean
  /** 高亮锚点；收起时为 null。 */
  highlightedValue: string | null
  setOpen: (next: boolean) => void
  setValue: (next: string | string[]) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getTriggerProps: () => T['button']
  getValueTextProps: () => T['element']
  getIndicatorProps: () => T['element']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getItemProps: (props: SelectItemProps) => T['element']
  getItemTextProps: (props: SelectItemProps) => T['element']
  getItemIndicatorProps: (props: SelectItemProps) => T['element']
  /**
   * 表单出口：一份视觉隐藏的原生 select，由根部件自行渲染（作者不必手写）。
   * 选项由适配器按当前值补齐，原生提交与 required 校验据此拿到值。
   */
  getHiddenSelectProps: () => T['select']
}
