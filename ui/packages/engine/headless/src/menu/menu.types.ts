import type { Cleanup, Direction, Layer, OverlayCloseReason, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/kernel'
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
  /**
   * 这一次是怎么关的；展开时不带。
   * 用它区分「用户主动取消」与「选完自动收起」，前者常要回滚草稿。
   */
  reason?: OverlayCloseReason
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

/** 分组自报身份：分组标题的 id 由它派生，group 与 group-label 靠这一个值互相认领。 */
export interface MenuGroupProps {
  value: string
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
    /**
     * 本菜单是另一张菜单的子菜单：触发器渲染成父菜单的条目形态
     * （经 getSubmenuTriggerProps），缺省落位换到侧向，悬停触发缺省打开。
     */
    submenu?: boolean
    /** 悬停触发：进触发器延时展开、经安全三角离开才收。子菜单缺省开，普通菜单缺省关。 */
    openOnHover?: boolean
    /** 悬停到展开的延时（ms），默认 100。 */
    hoverOpenDelay?: number
    /** 离开到收起的延时（ms），也是安全三角里的停滞上限，默认 300。 */
    hoverCloseDelay?: number
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
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' | 'hover' }
    // 受控回写：宿主改 open prop 后由 watch 派发
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'FOCUS.CLEAR' }
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
  effect: 'trackPosition' | 'trackLayer' | 'trackHover'
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
  /**
   * 子菜单触发条目（submenu 模式）：既是父菜单里的一条 item（value 是它在父菜单
   * 里的身份，父层的方向键与高亮照常认它），又是本子菜单的触发器（aria-haspopup、
   * 悬停/点按/右方向键展开）。父层的选中会跳过带 aria-haspopup 的条目。
   */
  getSubmenuTriggerProps: (props: MenuItemProps) => T['element']
  getSeparatorProps: () => T['element']
  getGroupProps: (props: MenuGroupProps) => T['element']
  getGroupLabelProps: (props: MenuGroupProps) => T['element']
  getArrowProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface MenuTranslations {}
