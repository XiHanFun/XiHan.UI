/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 popover 类型契约。

import type { Cleanup, Direction, Layer, MachineSchema, OverlayCloseReason, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'

export interface PopoverTranslations {
  close: string
}

// 适配器挂载前填入；保持缺省时副作用短路，机器状态照常转移但不定位、不挂消解层与焦点域。
export interface PopoverRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场与行为资源共享的 Presence；未提供时关闭立即释放。 */
  presence: PresenceHandle | null
  /** 展开期间 modal 改值时同步滚动锁与背景失活。 */
  syncModalResources: (() => void) | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，通常是 trigger。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器与消解层节点。 */
  getContentEl: () => HTMLElement | null
  /**
   * 展开时的落焦点。返回 null 即交给焦点域的 Tab 序列探测（浮层的默认行为）。
   * 浮层中排列集合的组合件由它把落点收口到锚点条目或集合容器上：
   * 探测按文档序取 content 的可 tab 后代，作者放在集合前面的搜索框会夺走焦点。
   */
  getInitialFocusEl: () => HTMLElement | null
}

/**
 * 正被按住的按钮。popover 自己只有 trigger 与 close-trigger；popconfirm 跑的是同一台机器，
 * 它的 confirm-trigger / cancel-trigger 也记在这里——两颗动作钮并排，只记一个布尔分不清按住的是哪颗。
 */
export type PopoverPressedPart = 'trigger' | 'close-trigger' | 'confirm-trigger' | 'cancel-trigger'

export interface PopoverOpenChangeDetails {
  open: boolean
  /**
   * 本次关闭的原因；展开时不带。
   * 用于区分用户主动取消（esc / interact-outside）与选完自动收起，前者常需要回滚草稿。
   */
  reason?: OverlayCloseReason
}

export interface PopoverSchema extends MachineSchema {
  props: {
    open?: boolean
    defaultOpen?: boolean
    placement?: Placement
    /** 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 */
    dir?: Direction
    offset?: number
    /** 模态浮层陷入焦点；默认 false（非模态，Tab 可离开）。 */
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
    /** 定位引擎回填的最新结果；connect 只读取它，不涉及 DOM 也不调用引擎。 */
    position: PositionResult | null
    /** 关闭时是否把焦点归还触发器；Tab 与层外交互关闭时为 false。 */
    returnFocus: boolean
    /**
     * 正被按住的按钮：Space / Enter 或触屏手指按下到松开之间，该按钮投影 data-pressed；没有按住时为 null。
     * 指针按住由 :active 表出。浮层收起时一并清空——按住 Enter 关掉浮层后，里面的按钮不会再来 keyup。
     */
    pressed: PopoverPressedPart | null
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
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开，part 说的是哪颗按钮
    | { type: 'PRESS.START', part: PopoverPressedPart }
    | { type: 'PRESS.END', part: PopoverPressedPart }
  tag: never
  guard: 'isOpenControlled'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'setReturnFocus' | 'syncOpen' | 'syncModalResources' | 'startPress' | 'endPress' | 'releasePress'
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
