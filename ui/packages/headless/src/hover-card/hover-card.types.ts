import type { Cleanup, Direction, Layer, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface HoverCardOpenChangeDetails {
  open: boolean
}

/**
 * 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter；纯逻辑测试与 SSR 下保持缺省，
 * 此时副作用一律短路（机器状态照常转移，只是不定位、不挂消解层）。
 *
 * 两个元素 getter 还兼作「焦点是否仍在卡片内」的判据来源：连接层在事件发生的那一刻
 * 经它们取活节点，渲染期不取（那一刻 Vue 侧 DOM 还不存在）。
 */
export interface HoverCardRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在浮层可见期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
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
    /**
     * 指针离开 trigger 或 content 到收起的等待毫秒，默认 300。
     * 这段等待同时是「指针从 trigger 走到 content」的通行时间：两者之间有间隙时，
     * 途中既不在 trigger 上也不在 content 上，全靠它把卡片留住。
     */
    closeDelay?: number
    /** 文字方向；只在作者显式给了才写到根节点上。 */
    dir?: Direction
    /** 只关掉卡片本身，不影响被包裹控件（trigger 常常是个链接）的可用性。 */
    disabled?: boolean
    /** open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 */
    onOpenChange?: (details: HoverCardOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /**
     * 焦点当前是否停在卡片内（trigger 或 content 及其后代）。
     * 焦点在里面时纯指针移出不收起：读到一半把卡片从键盘用户脚下抽走，
     * 焦点会连带落回文档根部。
     */
    focusHeld: boolean
  }
  computed: Record<string, never>
  refs: HoverCardRefs
  /**
   * visible 是复合状态：两个子态下浮层都可见，定位与消解层挂在父状态上，
   * 因此指针在 trigger 与 content 之间来回穿行时层不会被反复摘挂。
   * opening 是展开前的等待态（浮层仍隐藏），visible.closing 是收起前的等待态（浮层仍可见）。
   */
  state: 'closed' | 'opening' | 'visible' | 'visible.open' | 'visible.closing'
  event:
    /** 指针进入 trigger 或 content。 */
    | { type: 'POINTER.ENTER' }
    /** 指针离开 trigger 或 content。 */
    | { type: 'POINTER.LEAVE' }
    /** 焦点落入 trigger 或 content。 */
    | { type: 'FOCUS' }
    /** 焦点离开整张卡片（落回卡片内另一个节点的不算）。 */
    | { type: 'BLUR' }
    | { type: 'ESCAPE' }
    | { type: 'OPEN' }
    | { type: 'CLOSE', src?: 'esc' | 'interact-outside' }
    // 定时器到点：名称与对应的 delay prop 同名
    | { type: 'after.openDelay' }
    | { type: 'after.closeDelay' }
    // 受控回写：宿主改 open 后由 watch 派发，无条件跳转、不再通知
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
