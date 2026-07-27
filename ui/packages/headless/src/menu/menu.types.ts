import type { Cleanup, Direction, Layer, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/** 展开时焦点落在集合的哪一端：ArrowUp 从末尾进，其余入口一律从首个可用条目进。 */
export type MenuFocusIntent = 'first' | 'last'

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter；纯逻辑测试与 SSR 下保持缺省，
// 此时副作用一律短路（机器状态照常转移，只是不定位、不挂消解层与焦点域）。
export interface MenuRefs {
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
}

export interface MenuOpenChangeDetails {
  open: boolean
}

export interface MenuSelectDetails {
  value: string
}

/**
 * 条目自报家门：值与禁用由作者在部件上声明，connect 据此产出属性。
 * connect 因此是 (state/context/prop, 本条目声明) 的纯函数，不反查 DOM——
 * Vue 侧 connect 在 render 期求值（本帧 DOM 还不存在），WC 侧在 updated 后求值（DOM 已就位），
 * 连接期读 DOM 会让两个适配器的首帧快照分叉。
 */
export interface MenuItemProps {
  value: string
  disabled?: boolean
}

export interface MenuSchema extends MachineSchema {
  props: {
    /** 展开态。给定即受控：内部不再自改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    placement?: Placement
    offset?: number
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr。 */
    dir?: Direction
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: MenuOpenChangeDetails) => void
    /** 条目被选中；菜单随之关闭。 */
    onSelect?: (details: MenuSelectDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /** roving tabindex 的锚点，同时是方向键的起点；收起即清空。 */
    focusedValue: string | null
    /** 本次展开的落焦端；受控回写走 CONTROLLED.OPEN 时也读得到。 */
    focusIntent: MenuFocusIntent
    /** 关闭时是否把焦点归还 trigger；Tab 关闭时为 false，让焦点自然离开。 */
    returnFocus: boolean
  }
  computed: Record<string, never>
  refs: MenuRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN', focus?: MenuFocusIntent }
    | { type: 'TOGGLE', focus?: MenuFocusIntent }
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    | { type: 'ITEM.FOCUS', value: string }
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
