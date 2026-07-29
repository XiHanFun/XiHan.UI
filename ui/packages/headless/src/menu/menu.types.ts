import type { Cleanup, Direction, Layer, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig } from '@xihan-ui/core'
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

/**
 * 条目属性：值与禁用由作者声明。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface MenuItemProps {
  value: string
  disabled?: boolean
}

export interface MenuSchema extends MachineSchema {
  props: {
    /** 展开态，给定即受控；受控下内部不自改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    placement?: Placement
    offset?: number
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr。 */
    dir?: Direction
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
