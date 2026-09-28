/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 tooltip 类型契约。

import type { Cleanup, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { TooltipGroup } from './tooltip.group'

export interface TooltipOpenChangeDetails {
  open: boolean
}

/** 指针在视口里的落点：跟随鼠标时提示锚在这一点上。 */
export interface TooltipPoint {
  x: number
  y: number
}

/**
 * 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter。
 * 各项皆可省略，省略时状态机照常转移，只是不定位、不进入层栈。
 */
export interface TooltipRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄，只在浮层可见期间调用。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场与行为资源共享的 Presence；未提供时关闭立即释放。 */
  presence: PresenceHandle | null
  position: PositionEnginePort | null
  /** 锚点元素（trigger）。 */
  getAnchorEl: () => HTMLElement | null
  /** 浮层元素（positioner）。 */
  getFloatingEl: () => HTMLElement | null
  /** 所在的提示组：Provider 注入它那一组；没有 Provider 时为 null，归页面级的那一组。 */
  group: TooltipGroup | null
  /** 跟随鼠标时指针最近一次的落点；触屏或还没有指针落点时为 null，提示锚回 trigger。 */
  cursor: TooltipPoint | null
  /** 定位效应交出的重挂句柄：指针移动后调一次，提示按新落点重算一轮。 */
  reanchor: (() => void) | null
}

export interface TooltipSchema extends MachineSchema {
  props: {
    open?: boolean
    defaultOpen?: boolean
    /** 请求的浮层朝向，默认 bottom；空间不足时由定位引擎避让。 */
    placement?: Placement
    /** 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 */
    dir?: Direction
    /** 浮层与锚点的间距（px）。 */
    offset?: number
    /** 悬停进入到展开的等待毫秒，默认 700。 */
    openDelay?: number
    /** 悬停移出到收起的等待毫秒，默认 300。 */
    closeDelay?: number
    /**
     * 跳过等待的窗口毫秒，默认 300：另一个提示还开着，或刚收起一个不到这么久时，指向这一个不等 openDelay、
     * 也不播进场，直接接替（上一个随之收起）。0 或负数表示不参与接替，每次都等 openDelay。
     */
    skipDelayDuration?: number
    /** 只关闭提示本身，不影响被包裹控件的可用性。 */
    disabled?: boolean
    /**
     * 跟随鼠标：由指针打开的提示锚在指针落点上，随指针在 trigger 上移动而更新，默认 false。
     * 触屏没有悬停落点、聚焦打开没有指针，这两种情形退回锚定到 trigger。
     */
    followCursor?: boolean
    /** 语气：brand / neutral / success / warning / danger / info，决定提示的底色与其上的文字色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定内边距与字号档位。 */
    size?: Size
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: TooltipOpenChangeDetails) => void
  }
  context: {
    /**
     * 挂载时开着、还没收起过：这一段打开属于首帧，content 投影 data-instant 直接呈现、不播进场。
     * 第一次收起时清掉，之后的每一次打开照常进场。
     */
    openedAtMount: boolean
    /** 定位引擎回传的最新结果；无引擎时恒为 null。 */
    position: PositionResult | null
    /** 本次展开是否由聚焦触发：聚焦态的提示不被纯鼠标移出收起。 */
    focusOpened: boolean
    /** 本次展开是接替上一个提示（热窗口内打开）：浮层投影 data-instant，不播进场。收起即清。 */
    instant: boolean
  }
  computed: Record<string, never>
  refs: TooltipRefs
  /**
   * visible 是复合状态，两个子态下浮层都可见，定位与消解层挂在父状态上。
   * opening 是展开前的等待态（浮层仍隐藏），visible.closing 是收起前的等待态（浮层仍可见）。
   */
  state: 'closed' | 'opening' | 'visible' | 'visible.open' | 'visible.closing'
  event:
    /** 指针进入 trigger；带上落点与指针类型，跟随鼠标时据此落位。 */
    | { type: 'POINTER.ENTER', point?: TooltipPoint, pointerType?: string }
    /** 指针在 trigger 上移动：只有跟随鼠标时才派发。 */
    | { type: 'POINTER.MOVE', point: TooltipPoint, pointerType?: string }
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
  action: 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen' | 'markFocusOpened' | 'clearFocusOpened' | 'syncInstant' | 'clearInstant' | 'trackCursor' | 'clearOpenedAtMount'
  effect: 'waitForOpenDelay' | 'waitForCloseDelay' | 'trackPosition' | 'trackLayer' | 'trackGroup'
}

export interface TooltipApi<T extends PropTypes = PropTypes> {
  open: boolean
  setOpen: (next: boolean) => void
  getTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getArrowProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface TooltipTranslations {}
