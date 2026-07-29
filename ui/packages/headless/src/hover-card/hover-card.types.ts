import type { Cleanup, Direction, Layer, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface HoverCardOpenChangeDetails {
  open: boolean
}

/** 适配器在挂载前填入的 DOM 环境、定位引擎与元素 getter，缺省时相关副作用短路。 */
export interface HoverCardRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄，只在浮层可见期间调用。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎，缺省时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，即 trigger。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，即 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 消解层的根节点，即 content。 */
  getContentEl: () => HTMLElement | null
}

export interface HoverCardSchema extends MachineSchema {
  props: {
    open?: boolean
    defaultOpen?: boolean
    /** 请求的浮层朝向，默认 bottom；空间不足时由定位引擎避让。 */
    placement?: Placement
    /** 浮层与锚点的间距（px）。 */
    offset?: number
    /** 悬停进入到展开的等待毫秒，默认 700。 */
    openDelay?: number
    /** 指针离开 trigger 或 content 到收起的等待毫秒，默认 300。 */
    closeDelay?: number
    /** 文字方向，仅在显式给出时写到根节点上。 */
    dir?: Direction
    /** 只关掉卡片本身，不影响 trigger 元素自身的可用性。 */
    disabled?: boolean
    /** open 变化意图回调。 */
    onOpenChange?: (details: HoverCardOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果。 */
    position: PositionResult | null
    /** 焦点是否停在卡片内（trigger 或 content 及其后代）；为 true 时纯指针移出不收起。 */
    focusHeld: boolean
  }
  computed: Record<string, never>
  refs: HoverCardRefs
  /**
   * visible 是复合状态，两个子态下浮层都可见，定位与消解层挂在父状态上。
   * opening 是展开前的等待态（浮层隐藏），visible.closing 是收起前的等待态（浮层可见）。
   */
  state: 'closed' | 'opening' | 'visible' | 'visible.open' | 'visible.closing'
  event:
    /** 指针进入 trigger 或 content。 */
    | { type: 'POINTER.ENTER' }
    /** 指针离开 trigger 或 content。 */
    | { type: 'POINTER.LEAVE' }
    /** 焦点落入 trigger 或 content。 */
    | { type: 'FOCUS' }
    /** 焦点离开整张卡片，落到卡片内另一个节点的不算。 */
    | { type: 'BLUR' }
    | { type: 'ESCAPE' }
    | { type: 'OPEN' }
    | { type: 'CLOSE', src?: 'esc' | 'interact-outside' }
    // 定时器到点，名称与对应的 delay prop 同名
    | { type: 'after.openDelay' }
    | { type: 'after.closeDelay' }
    // 受控回写：宿主改 open 后由 watch 派发，无条件跳转且不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
  tag: never
  guard: 'isOpenControlled' | 'isDisabled' | 'isFocusHeld'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen' | 'markFocusHeld' | 'clearFocusHeld'
  effect: 'waitForOpenDelay' | 'waitForCloseDelay' | 'trackPosition' | 'trackLayer'
}

export interface HoverCardApi<T extends PropTypes = PropTypes> {
  open: boolean
  setOpen: (next: boolean) => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getArrowProps: () => T['element']
}
