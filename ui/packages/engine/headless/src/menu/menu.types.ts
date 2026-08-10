import type { Cleanup, Direction, Layer, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 展开时的落焦端：'first'/'last' 从集合两端进，'none' 不预先挑锚点。 */
export type MenuFocusIntent = 'first' | 'last' | 'none'

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter，缺省时相关副作用短路。
export interface MenuRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈（常驻会永久占着栈顶，把下面每层的 Escape 都堵死）。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，通常是 trigger。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器、消解层节点，同时是条目集合的查询容器。 */
  getContentEl: () => HTMLElement | null
}

export interface MenuOpenChangeDetails {
  open: boolean
}

export interface MenuSelectDetails {
  value: string
}

/** 条目数据。给了 collection，显示文本与禁用就以它为准。 */
export interface MenuNode {
  value: string
  /** 展示文本；缺省退回 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
  /** 本条之前画一条分隔线；写在首条上不产出分隔线。 */
  separatorBefore?: boolean
}

/** 单个条目的元信息，由 collection 推出，不含焦点态。 */
export interface MenuNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
  separatorBefore: boolean
}

/**
 * 条目属性：值必报，禁用可由 collection 代为声明。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface MenuItemProps {
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
  disabled?: boolean
}

export interface MenuSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。
     * 缺省即回到「文本与禁用都写在条目部件上」的老路。
     */
    collection?: MenuNode[]
    /** 展开态，给定即受控；受控下内部不自改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    placement?: Placement
    offset?: number
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr。 */
    dir?: Direction
    /** 语气：brand / neutral / success / warning / danger / info，决定条目高亮用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定条目高度、内边距与字号档位。 */
    size?: Size
    /** open 变化回调。 */
    onOpenChange?: (details: MenuOpenChangeDetails) => void
    /** 条目被选中；菜单随之关闭。 */
    onSelect?: (details: MenuSelectDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果。 */
    position: PositionResult | null
    /** roving tabindex 的锚点，同时是方向键的起点；收起即清空。 */
    focusedValue: string | null
    /** 本次展开的落焦端，'none' 即不落焦。 */
    focusIntent: MenuFocusIntent
    /** 关闭时是否把焦点归还 trigger；Tab 关闭时为 false。 */
    returnFocus: boolean
  }
  computed: Record<string, never>
  refs: MenuRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN', focus?: MenuFocusIntent }
    | { type: 'TOGGLE', focus?: MenuFocusIntent }
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    | { type: 'ITEM.FOCUS', value: string }
    /** 持有焦点的条目离开了 DOM：浏览器此时不派 focusout，机器读不到，由适配器如实上报。 */
    | { type: 'ITEM.LOST' }
    | { type: 'ITEM.SELECT', value: string }
  tag: never
  guard: 'isOpenControlled'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'invokeOnSelect'
    | 'syncOpen'
    | 'setFocusIntent'
    | 'setReturnFocus'
    | 'setFocusedValue'
    | 'setInitialFocusedValue'
    | 'clearFocusedValue'
  effect: 'trackPosition' | 'trackLayer'
}

export interface MenuApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 */
  collection: readonly MenuNodeMeta[]
  /** 焦点锚点；收起时为 null。 */
  focusedValue: string | null
  setOpen: (next: boolean) => void
  getTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getItemProps: (props: MenuItemProps) => T['element']
  getSeparatorProps: () => T['element']
  getArrowProps: () => T['element']
}
