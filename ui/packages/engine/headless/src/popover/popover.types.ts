import type { Cleanup, Direction, Layer, MachineSchema, OverlayCloseReason, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size } from '@xihan-ui/core'

export interface PopoverTranslations {
  close: string
}

// 适配器挂载前填入；保持缺省时副作用短路，机器状态照常转移但不定位、不挂消解层与焦点域。
export interface PopoverRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，通常是 trigger。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器与消解层节点。 */
  getContentEl: () => HTMLElement | null
  /**
   * 展开那一刻的落焦点。返回 null 即交给焦点域的 Tab 序列探测（浮层的缺省行为）。
   * 浮层里排着集合的组合件由它把落点收口到锚点条目或集合容器上——
   * 探测按文档序取 content 的可 tab 后代，作者放在集合前面的搜索框会把焦点抢走。
   */
  getInitialFocusEl: () => HTMLElement | null
}

export interface PopoverOpenChangeDetails {
  open: boolean
  /**
   * 这一次是怎么关的；展开时不带。
   * 用它区分「用户主动取消」（esc / interact-outside）与「选完自动收起」，前者常要回滚草稿。
   */
  reason?: OverlayCloseReason
}

export interface PopoverSchema extends MachineSchema {
  props: {
    open?: boolean
    defaultOpen?: boolean
    placement?: Placement
    /** 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 */
    dir?: Direction
    offset?: number
    /** 模态浮层陷住焦点；默认 false（非模态，Tab 可离开）。 */
    modal?: boolean
    closeOnEscape?: boolean
    closeOnInteractOutside?: boolean
    translations?: Partial<PopoverTranslations>
    /** 尺寸：sm / md / lg，决定面板的内边距档位。 */
    size?: Size
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: PopoverOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /** 关闭时是否把焦点归还触发器；Tab 与层外交互关闭时为 false。 */
    returnFocus: boolean
  }
  computed: Record<string, never>
  refs: PopoverRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'TOGGLE' }
    | { type: 'CLOSE', src?: 'esc' | 'close-trigger' | 'interact-outside' | 'tab' | 'selection' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
  tag: never
  guard: 'isOpenControlled'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'setReturnFocus' | 'syncOpen'
  effect: 'trackPosition' | 'trackLayer'
}

export interface PopoverApi<T extends PropTypes = PropTypes> {
  open: boolean
  setOpen: (next: boolean) => void
  getTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getCloseTriggerProps: () => T['button']
  getArrowProps: () => T['element']
}
