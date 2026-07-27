import type { Cleanup, Layer, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface PopoverTranslations {
  close: string
}

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter；纯逻辑测试与 SSR 下保持缺省，
// 此时副作用一律短路（机器状态照常转移，只是不定位、不挂消解层与焦点域）。
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
}

export interface PopoverOpenChangeDetails {
  open: boolean
}

export interface PopoverSchema extends MachineSchema {
  props: {
    open?: boolean
    defaultOpen?: boolean
    placement?: Placement
    offset?: number
    /** 模态浮层陷住焦点；默认 false（非模态，Tab 可离开）。 */
    modal?: boolean
    closeOnEscape?: boolean
    closeOnInteractOutside?: boolean
    translations?: Partial<PopoverTranslations>
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: PopoverOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
  }
  computed: Record<string, never>
  refs: PopoverRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'TOGGLE' }
    | { type: 'CLOSE', src?: 'esc' | 'close-trigger' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
  tag: never
  guard: 'isOpenControlled'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen'
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
