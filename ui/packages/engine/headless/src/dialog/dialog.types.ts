/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 dialog 类型契约。

import type { Cleanup, Layer, MachineSchema, OverlayBackdropVariant, OverlayCloseReason, PropTypes, RuntimeConfig, Size } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'

export interface DialogTranslations {
  close: string
  /** 拖动把手的 aria-label：把手是一块透明的命中区，读屏读不出它的用途。 */
  dragTrigger: string
}

/** 面板相对居中落点的位移，屏幕坐标、像素：向右、向下为正。 */
export interface DialogOffset {
  x: number
  y: number
}

/** 指针在视口里的落点。 */
export interface DialogPoint {
  clientX: number
  clientY: number
}

/**
 * 正在进行的指针手势：拖动整块面板，或（抽屉）推动面板的一条边。
 * 两者共用一场指针会话，移动与收尾各自按手势种类落到位移或尺寸上。
 */
export type DialogGesture = 'drag' | 'resize'

/**
 * 一场手势从按下时刻起冻结的依据。每一帧都从按下时的落点加指针总位移重新计算，不累加每帧增量：
 * 累加在顶到边界之后回不来。
 */
export interface DialogGestureSession {
  origin: DialogPoint
  /** 按下那一刻的值，跟手一律相对它算：拖动是位移；改尺是尺寸，只用 axis 那一根。 */
  start: DialogOffset
  /** 这一场允许的取值范围：拖动是位移在两根轴上的边界；改尺只用 axis 那一根，是尺寸的上下限。 */
  bounds: DialogBounds
  /** 改尺时指针沿 axis 往屏幕正向挪一像素，尺寸变多少：+1 或 -1。拖动恒为 1。 */
  sign: number
  /** 改尺推的是哪根轴；拖动两根都推，记作 x。 */
  axis: 'x' | 'y'
  /** 只跟按下的这根指针：多指同时按下时，第二根手指不会劫持正在进行的这一场。 */
  pointerId?: number
}

/** 两根轴上的取值边界。下界高过上界时取下界：面板比视口还大，就让起始缘留在视口里。 */
export interface DialogBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

// 适配器在挂载前填入 DOM 环境与元素 getter；纯逻辑测试下保持缺省（副作用不挂）。
export interface DialogRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  presence: PresenceHandle | null
  /** 展开期间 modal 改值时同步滚动锁与背景失活。 */
  syncModalResources: (() => void) | null
  getContentEl: () => HTMLElement | null
  getTriggerEl: () => HTMLElement | null
  branches: () => Element[]
  /** 当前这场指针手势的依据；不在手势中时为 null。 */
  gesture: DialogGestureSession | null
  /** 当前这场手势的指针会话：按下即挂，收尾或机器停止时拆。 */
  pointer: { dispose: () => void } | null
  /**
   * connect 给部件写 id 时使用的组件名。归还焦点时按该名字获取 trigger，
   * 抽屉运行同一台状态机、部件名却是 drawer，由它的 refs 初值改写为自身的名字。
   */
  partScope: string
}

/**
 * 正被按住的按钮：开合触发器或角落的关闭钮。drawer 跑的是同一台机器，它的两颗同名按钮也记在这里；
 * 两颗按钮只记一个布尔分不清按住的是哪颗。
 */
export type DialogPressedPart = 'trigger' | 'close-trigger'

export interface DialogOpenChangeDetails {
  open: boolean
  /**
   * 本次关闭的原因；展开时不带。
   * 用于区分用户主动取消与确认后收起，前者常需要回滚草稿。
   */
  reason?: OverlayCloseReason
}

export interface DialogSchema extends MachineSchema {
  props: {
    open?: boolean
    defaultOpen?: boolean
    modal?: boolean
    role?: 'dialog' | 'alertdialog'
    closeOnEscape?: boolean
    closeOnInteractOutside?: boolean
    restoreFocus?: boolean
    /** 展开后先聚焦到 content 内匹配该选择器的元素；选择器不匹配时回退为默认聚焦顺序。 */
    initialFocus?: string
    /** 尺寸：sm / md / lg。只影响 content 的最大宽度，写在 content 上（本组件没有 root 部件）。 */
    size?: Size
    /** 遮罩形态：opaque / blur / transparent。写在 backdrop 上，只影响该层的底色与模糊。 */
    variant?: OverlayBackdropVariant
    /**
     * 可拖动：指针按住标题栏（header，没有 header 时是 title）或 drag-trigger 把面板挪走，
     * 键盘在 drag-trigger 上用方向键挪；面板始终夹在视口内。默认 false。每次打开都从居中落点起。
     */
    draggable?: boolean
    translations?: Partial<DialogTranslations>
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: DialogOpenChangeDetails) => void
    /** 退出动画结束或取消，且本层资源全部释放后通知；卸载和重新打开不通知。 */
    onExitComplete?: () => void
  }
  context: {
    /**
     * 正被按住的按钮：Space / Enter 或触屏手指按下到松开之间，该按钮投影 data-pressed；没有按住时为 null。
     * 指针按住由 :active 表出。面板收起时一并清空——按住 Enter 关掉面板后，里面的关闭钮不会再来 keyup。
     */
    pressed: DialogPressedPart | null
    /** 面板相对居中落点的拖动位移；每次打开归零。 */
    offset: DialogOffset
    /** 正在进行的指针手势；没有时为 null。 */
    gesture: DialogGesture | null
    /**
     * 挂载时开着、还没收起过：这一段打开属于首帧，content 与遮罩投影 data-instant 直接呈现、不播进场。
     * 第一次收起时清掉，之后的每一次打开照常进场。
     */
    openedAtMount: boolean
  }
  computed: Record<string, never>
  refs: DialogRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'TOGGLE' }
    | { type: 'CLOSE', src?: 'esc' | 'close-trigger' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开，part 说的是哪颗按钮
    | { type: 'PRESS.START', part: DialogPressedPart }
    | { type: 'PRESS.END', part: DialogPressedPart }
    /** 指针按住拖动区：记下起点，开始跟手。 */
    | { type: 'DRAG.START', point: DialogPoint, pointerId?: number }
    /** 键盘挪一步：dx / dy 是屏幕坐标里的位移，向右、向下为正。 */
    | { type: 'DRAG.NUDGE', dx: number, dy: number }
    /** 把面板送回居中落点。 */
    | { type: 'DRAG.RESET' }
    /** 指针会话回送的移动。 */
    | { type: 'GESTURE.MOVE', point: DialogPoint }
    /** 指针抬起或被系统收走。 */
    | { type: 'GESTURE.END' }
  tag: never
  guard: 'isOpenControlled' | 'canDrag'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen' | 'syncModalResources' | 'startPress' | 'endPress' | 'releasePress' | 'clearOpenedAtMount'
    | 'startDrag' | 'nudgeDrag' | 'resetOffset' | 'moveGesture' | 'endGesture'
  effect: 'trackOverlay' | 'trackGesture'
}

export interface DialogApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 当前的拖动位移。 */
  offset: DialogOffset
  /** 正在被指针拖动。 */
  dragging: boolean
  setOpen: (next: boolean) => void
  getTriggerProps: () => T['button']
  getBackdropProps: () => T['element']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getHeaderProps: () => T['element']
  /** 拖动把手：键盘挪动面板的入口；放在 header 里时铺满标题栏。 */
  getDragTriggerProps: () => T['button']
  getIndicatorProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getBodyProps: () => T['element']
  getFooterProps: () => T['element']
  getCloseTriggerProps: () => T['button']
}
