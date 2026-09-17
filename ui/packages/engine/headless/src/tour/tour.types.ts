/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 tour 类型契约。

import type { Cleanup, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'

/** 一步引导的声明。整份清单由作者提供，组件只按下标取用，不反查 DOM。 */
export interface TourStep {
  /** 稳定标识，写入 data-step-id；作者据此对应（埋点、按步定制渲染）。 */
  id: string
  /**
   * 高亮目标的 CSS 选择器。null / 省略 / 查询不到节点都视为该步不锚定任何元素：
   * 浮层居中、不绘制高亮框、不显示箭头。
   */
  target?: string | null
  title?: string
  description?: string
  /** 该步的首选放置位；未提供时沿用整份引导的 placement。 */
  placement?: Placement
}

export interface TourTranslations {
  close: string
  /** progress-text 的文案；step 从 1 起，count 为总步数。 */
  progress: (step: number, count: number) => string
  /**
   * 不是末步时下一步按钮的可访问名。
   * 未提供时不产出 aria-label：它一般带可见文字，覆盖反而更差。
   */
  next: string
  /**
   * 末步时同一个按钮的可访问名。该操作的语义是完成，不是前进，
   * 只依靠 data-last 更换皮肤的作者无法获得该文案。同样未提供时不产出。
   */
  finish: string
}

/** 高亮框的几何，视口坐标，已包含 spotlightPadding。 */
export interface TourSpotlightRect {
  x: number
  y: number
  width: number
  height: number
  /** 目标节点的四角计算值，按 CSS border-radius 简写原样保留。 */
  borderRadius?: string
}

// 适配器挂载前填入；保持缺省时副作用短路，机器状态照常转移但不定位、不量高亮框、不挂消解层与焦点域。
export interface TourRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场的租约真源；逻辑关闭后由它决定何时真正归还层、消解与焦点资源。 */
  presence: PresenceHandle | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器与消解层节点。 */
  getContentEl: () => HTMLElement | null
  /**
   * 更换锚点的入口，由展开态的定位效应装填、退出时卸载。
   * 步序变化时要把引擎从上一步的目标上卸下重新挂载，保留旧订阅会使两套坐标轮流写入。
   */
  reanchor: (() => void) | null
}

/**
 * 正被按住的按钮：气泡末行的上一步 / 下一步 / 跳过与角落的关闭钮。
 * 四颗按钮只记一个布尔分不清按住的是哪颗。
 */
export type TourPressedPart = 'prev-trigger' | 'next-trigger' | 'skip-trigger' | 'close-trigger'

/**
 * 圆点的身份。connect 在 render 期求值，此时 DOM 尚不存在，序号由调用方提供。
 */
export interface TourProgressDotProps {
  /** 圆点对应的步序，0 基。一步一个。 */
  index: number
}

export interface TourValueChangeDetails {
  /** 变化后的步序，恒在 [0, count - 1] 内。 */
  value: number
}

export interface TourOpenChangeDetails {
  open: boolean
}

export interface TourCompleteDetails {
  /** 完成时最后一步的步序。 */
  step: number
}

export interface TourSkipDetails {
  /** 用户放弃时停留的步序。 */
  step: number
}

export interface TourSchema extends MachineSchema {
  props: {
    /** 步骤清单。它同时是步序的上界与读屏「第 m 步，共 n 步」的分母。 */
    steps?: TourStep[]
    /** 当前步序（0 起）。提供即受控：内部不再自行修改，只发 onValueChange。 */
    value?: number
    /** 非受控初值，默认 0。 */
    defaultValue?: number
    open?: boolean
    defaultOpen?: boolean
    /** 整份引导的首选放置位，默认 bottom；单步可用自己的 placement 覆盖。 */
    placement?: Placement
    /** 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 */
    dir?: Direction
    /** 浮层与目标的间距（px）。 */
    offset?: number
    closeOnEscape?: boolean
    /**
     * 层外交互关闭，默认 false：引导需经 skip 或 close 两个明确出口退出。
     */
    closeOnInteractOutside?: boolean
    /** 绘制遮罩，默认 true。 */
    showBackdrop?: boolean
    /** 高亮框在目标四周留出的空白（px），默认 8。 */
    spotlightPadding?: number
    /** 展开与换步时自动把目标滚进视口（nearest，已可见时不动），默认 true。 */
    autoScroll?: boolean
    translations?: Partial<TourTranslations>
    /** 步序变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: TourValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: TourOpenChangeDetails) => void
    /** 末步再按下一步：先发它，再经 onOpenChange 关闭。 */
    onComplete?: (details: TourCompleteDetails) => void
    /** 用户主动放弃（skip-trigger 或 Escape）：先发它，再经 onOpenChange 关闭。 */
    onSkip?: (details: TourSkipDetails) => void
  }
  context: {
    /** 当前步序。受控（value 提供）时 cell 直读 prop，写入只发 onValueChange 不修改内部值。 */
    value: number
    /** 定位引擎回填的最新结果；connect 只读取它，不涉及 DOM 也不调用引擎。 */
    position: PositionResult | null
    /** 高亮框几何，由效应测量后写入；居中步与收起态恒为 null。 */
    spotlight: TourSpotlightRect | null
    /**
     * 正被按住的按钮：Space / Enter 或触屏手指按下到松开之间，该按钮投影 data-pressed；没有按住时为 null。
     * 指针按住由 :active 表出。气泡收起时一并清空——按住 Enter 走完末步或跳过后，那颗按钮随内容藏起，不会再来 keyup。
     */
    pressed: TourPressedPart | null
  }
  computed: Record<string, never>
  refs: TourRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE', src?: 'esc' | 'close-trigger' | 'interact-outside' | 'complete' | 'skip' }
    | { type: 'VALUE.SET', value: number }
    | { type: 'STEP.PREV' }
    | { type: 'STEP.NEXT' }
    | { type: 'SKIP' }
    /** 重新测量几何：目标节点被外部改动（换位、变尺寸）后由宿主触发。 */
    | { type: 'GEOMETRY.SYNC' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开，part 说的是哪颗按钮
    | { type: 'PRESS.START', part: TourPressedPart }
    | { type: 'PRESS.END', part: TourPressedPart }
  tag: never
  guard: 'isOpenControlled' | 'isLastStep' | 'isLastStepOpenControlled' | 'canPress'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'invokeOnComplete'
    | 'invokeOnSkip'
    | 'syncOpen'
    | 'setValue'
    | 'goPrev'
    | 'goNext'
    | 'measureSpotlight'
    | 'reanchorPosition'
    | 'clearGeometry'
    | 'scrollTargetIntoView'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
  effect: 'trackPosition' | 'trackSpotlight' | 'trackOverlay'
}

export interface TourApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 当前步序，恒在 [0, count - 1] 内；清单为空时为 0。 */
  value: number
  count: number
  /** 当前步的声明；清单为空时为 null。 */
  currentStep: TourStep | null
  /** 停在首步：上一步按钮据此禁用。 */
  firstStep: boolean
  /** 停在末步：下一步按钮据此更换文案（完成）。 */
  lastStep: boolean
  /** 该步锚定了页面元素：居中步为 false，此时不绘制高亮框也不显示箭头。 */
  anchored: boolean
  /** 「第 m 步，共 n 步」。作者未编写 progress-text 的内容时由适配器填入。 */
  progressText: string
  setOpen: (next: boolean) => void
  /** 直接跳到某一步；越界会被夹回 [0, count - 1]。 */
  setValue: (next: number) => void
  /** 末步再前进一步 = 完成：先发 onComplete，再关闭。 */
  goToNextStep: () => void
  goToPrevStep: () => void
  /** 放弃引导：先发 onSkip，再关闭。 */
  skip: () => void
  /** 重新测量高亮框与浮层位置：目标节点被外部改动（换位、变尺寸）后调用它校准。 */
  remeasure: () => void
  getRootProps: () => T['element']
  getBackdropProps: () => T['element']
  getSpotlightProps: () => T['element']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getProgressTextProps: () => T['element']
  getProgressIndicatorProps: () => T['element']
  getProgressDotProps: (props: TourProgressDotProps) => T['element']
  getPrevTriggerProps: () => T['button']
  getNextTriggerProps: () => T['button']
  getSkipTriggerProps: () => T['button']
  getCloseTriggerProps: () => T['button']
  getArrowProps: () => T['element']
}
