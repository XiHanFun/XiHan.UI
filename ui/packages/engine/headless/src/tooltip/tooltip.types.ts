import type { Direction, Placement, PositionEnginePort, PositionResult, PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

export interface TooltipOpenChangeDetails {
  open: boolean
}

/**
 * 适配器在挂载前填入定位引擎与元素 getter。
 * 三项皆可缺省，缺省时机器照常转移，只是不定位。
 */
export interface TooltipRefs {
  position: PositionEnginePort | null
  /** 锚点元素（trigger）。 */
  getAnchorEl: () => HTMLElement | null
  /** 浮层元素（positioner）。 */
  getFloatingEl: () => HTMLElement | null
}

export interface TooltipSchema extends MachineSchema {
  props: {
    open?: boolean
    defaultOpen?: boolean
    /** 请求的浮层朝向，默认 bottom；空间不足时由定位引擎避让。 */
    placement?: Placement
    /** 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 */
    dir?: Direction
    /** 浮层与锚点的间距（px）。 */
    offset?: number
    /** 悬停进入到展开的等待毫秒，默认 700。 */
    openDelay?: number
    /** 悬停移出到收起的等待毫秒，默认 300。 */
    closeDelay?: number
    /** 只关闭提示本身，不影响被包裹控件的可用性。 */
    disabled?: boolean
    /** 语气：brand / neutral / success / warning / danger / info，决定提示的底色与其上的文字色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定内边距与字号档位。 */
    size?: Size
    /** open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 */
    onOpenChange?: (details: TooltipOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回传的最新结果；无引擎时恒为 null。 */
    position: PositionResult | null
    /** 本次展开是否由聚焦触发：聚焦态的提示不被纯鼠标移出收走。 */
    focusOpened: boolean
  }
  computed: Record<string, never>
  refs: TooltipRefs
  /** opening/closing 是延时等待态：opening 时浮层仍隐藏，closing 时浮层仍可见。 */
  state: 'closed' | 'opening' | 'open' | 'closing'
  event:
    | { type: 'POINTER.ENTER' }
    | { type: 'POINTER.LEAVE' }
    | { type: 'POINTER.DOWN' }
    | { type: 'FOCUS' }
    | { type: 'BLUR' }
    | { type: 'ESCAPE' }
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    // 定时器到点：名称与对应的 delay prop 同名
    | { type: 'after.openDelay' }
    | { type: 'after.closeDelay' }
    // 受控回写：宿主改 open 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
  tag: never
  guard: 'isOpenControlled' | 'isDisabled' | 'isFocusOpened'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen' | 'markFocusOpened' | 'clearFocusOpened'
  effect: 'waitForOpenDelay' | 'waitForCloseDelay' | 'trackPosition'
}

export interface TooltipApi<T extends PropTypes = PropTypes> {
  open: boolean
  setOpen: (next: boolean) => void
  getTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getArrowProps: () => T['element']
}
