/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 floating panel 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'

/**
 * 面板的三种形态：常规（作者设置的位置与尺寸）、收拢（只保留标题栏）、铺满（占满视口）。
 * 取值与 floating-panel.css 的 [data-window-state] 选择器一一对应。
 */
export type FloatingPanelWindowState = 'default' | 'maximized' | 'minimized'

/**
 * 正被按住的按钮：开合触发器、关闭钮，或指向某一形态的形态钮（`window-state:<形态>`）。
 * 标题栏上排着两三颗形态钮，只记一个布尔分不清按住的是哪颗。
 */
export type FloatingPanelPressedPart = 'trigger' | 'close-trigger' | `window-state:${FloatingPanelWindowState}`

/**
 * 八个改尺把手对应的边，取值为罗盘方位：n 上 / e 右 / s 下 / w 左，两两组合即四角。
 * 这是屏幕方位而不是逻辑方位：推动量来自指针与方向键，两者都是屏幕坐标。
 */
export type FloatingPanelResizeEdge = 'e' | 'n' | 'ne' | 'nw' | 's' | 'se' | 'sw' | 'w'

/** 面板左上角相对视口的像素坐标。 */
export interface FloatingPanelPosition {
  x: number
  y: number
}

/**
 * 面板的像素尺寸：`dimensions` 与 `minSize` / `maxSize` 三处都使用它。
 * 本组件不带视觉三轴的 size，皮肤中也没有 [data-size] 选择器。
 */
export interface FloatingPanelSize {
  width: number
  height: number
}

/** 指针在视口中的落点。 */
export interface FloatingPanelPoint {
  clientX: number
  clientY: number
}

/**
 * 一次拖动或改尺从按下时刻起冻结的全部依据。
 * 每帧从按下时的矩形加指针总位移重新计算，不累加每帧增量：
 * 累加在顶到尺寸下限之后无法恢复。
 */
export interface FloatingPanelDragSession {
  /** 移动整块面板，或推动某一条边。 */
  kind: 'move' | 'resize'
  /** kind 为 move 时没有边。 */
  edge: FloatingPanelResizeEdge | null
  origin: FloatingPanelPoint
  position: FloatingPanelPosition
  size: FloatingPanelSize
}

export interface FloatingPanelOpenChangeDetails {
  open: boolean
}

export interface FloatingPanelPositionChangeDetails {
  position: FloatingPanelPosition
}

export interface FloatingPanelDimensionsChangeDetails {
  dimensions: FloatingPanelSize
}

export interface FloatingPanelWindowStateChangeDetails {
  windowState: FloatingPanelWindowState
}

/** 改尺把手的声明：对应哪条边。 */
export interface FloatingPanelResizeTriggerProps {
  edge: FloatingPanelResizeEdge
}

/** 形态按钮的声明：按下它切换到哪个形态。 */
export interface FloatingPanelWindowStateTriggerProps {
  windowState: FloatingPanelWindowState
}

/** 读屏文案，默认英文。 */
export interface FloatingPanelTranslations {
  /** 拖拽把手的 aria-label：把手通常只是一小片纹理，读屏无法朗读其用途。 */
  dragTrigger: string
  /** 改尺把手的 aria-label：八个把手在读屏中完全相同，不报方位就无法区分按下的是哪一个。 */
  resizeTrigger: (edge: FloatingPanelResizeEdge) => string
  /** 改尺把手的 aria-valuetext：把当前尺寸朗读为可理解的文字，两根轴一并报出。 */
  resizeValueText: (size: FloatingPanelSize) => string
  /** 形态按钮的 aria-label：三个按钮通常只有图标。 */
  windowStateTrigger: (windowState: FloatingPanelWindowState) => string
  close: string
}

// 适配器在挂载前填入元素 getter；纯逻辑测试下保持缺省（拖动时取不到文档，副作用空跑）。
export interface FloatingPanelRefs {
  getContentEl: () => HTMLElement | null
  /** 当前这场拖动 / 改尺的依据；不在拖动中时为 null。 */
  session: FloatingPanelDragSession | null
}

export interface FloatingPanelSchema extends MachineSchema {
  props: {
    /** 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 面板左上角坐标（px，相对视口）。提供即受控。 */
    position?: FloatingPanelPosition
    defaultPosition?: FloatingPanelPosition
    /** 面板尺寸（px）。提供即受控。 */
    dimensions?: FloatingPanelSize
    defaultDimensions?: FloatingPanelSize
    /** 尺寸下限，默认 160×120。 */
    minSize?: FloatingPanelSize
    /** 尺寸上限，未提供时不封顶。与 minSize 冲突时以 minSize 为准。 */
    maxSize?: FloatingPanelSize
    /** 形态。提供即受控。 */
    windowState?: FloatingPanelWindowState
    defaultWindowState?: FloatingPanelWindowState
    /** 是否允许移动面板，默认 true；铺满形态下恒不可移动。 */
    draggable?: boolean
    /** 是否允许改尺寸，默认 true；只有常规形态下可以改尺寸。 */
    resizable?: boolean
    /** 禁用：不可移动、不可改尺寸、不可切换形态；开合与关闭不受影响。 */
    disabled?: boolean
    translations?: Partial<FloatingPanelTranslations>
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: FloatingPanelOpenChangeDetails) => void
    /** 位置变化意图回调；拖动过程中连续发出。 */
    onPositionChange?: (details: FloatingPanelPositionChangeDetails) => void
    /** 尺寸变化意图回调；改尺过程中连续发出。 */
    onDimensionsChange?: (details: FloatingPanelDimensionsChangeDetails) => void
    onWindowStateChange?: (details: FloatingPanelWindowStateChangeDetails) => void
  }
  context: {
    /** 面板左上角坐标。受控（position 提供）时 cell 直读 prop，写入只发回调不修改内部值。 */
    position: FloatingPanelPosition
    /** 面板尺寸，恒已夹进 minSize / maxSize。 */
    dimensions: FloatingPanelSize
    windowState: FloatingPanelWindowState
    /**
     * 正被按住的按钮：Space / Enter 或触屏手指按下到松开之间，该按钮投影 data-pressed；没有按住时为 null。
     * 指针按住由 :active 表出。
     */
    pressed: FloatingPanelPressedPart | null
  }
  computed: Record<string, never>
  refs: FloatingPanelRefs
  state: 'closed' | 'open' | 'open.dragging' | 'open.idle' | 'open.resizing'
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE', src?: 'close-trigger' | 'esc' }
    | { type: 'TOGGLE' }
    /** 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知。 */
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    | { type: 'POSITION.SET', position: FloatingPanelPosition }
    /** 键盘平移：dx / dy 是屏幕坐标中的位移，向右、向下为正。 */
    | { type: 'POSITION.NUDGE', dx: number, dy: number }
    | { type: 'DIMENSIONS.SET', dimensions: FloatingPanelSize }
    /** 键盘改尺：推动 edge 对应的边，位移同样是屏幕坐标。 */
    | { type: 'DIMENSIONS.NUDGE', edge: FloatingPanelResizeEdge, dx: number, dy: number }
    | { type: 'WINDOW_STATE.SET', windowState: FloatingPanelWindowState }
    | { type: 'DRAG.START', point: FloatingPanelPoint }
    | { type: 'RESIZE.START', edge: FloatingPanelResizeEdge, point: FloatingPanelPoint }
    | { type: 'DRAG.MOVE', point: FloatingPanelPoint }
    | { type: 'DRAG.END' }
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开，part 说的是哪颗按钮
    | { type: 'PRESS.START', part: FloatingPanelPressedPart }
    | { type: 'PRESS.END', part: FloatingPanelPressedPart }
  tag: never
  guard: 'canDrag' | 'canInteract' | 'canResize' | 'isOpenControlled' | 'canPress'
  action:
    | 'invokeOnClose'
    | 'invokeOnOpen'
    | 'syncOpen'
    | 'setPosition'
    | 'nudgePosition'
    | 'setDimensions'
    | 'nudgeDimensions'
    | 'setWindowState'
    | 'startSession'
    | 'dragMove'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
  effect: 'trackPointer'
}

export interface FloatingPanelApi<T extends PropTypes = PropTypes> {
  open: boolean
  windowState: FloatingPanelWindowState
  position: FloatingPanelPosition
  dimensions: FloatingPanelSize
  /** 正在被指针移动。 */
  dragging: boolean
  /** 正在被指针改尺。 */
  resizing: boolean
  disabled: boolean
  /** 当前是否可移动：作者允许、未禁用、且不是铺满形态。 */
  canDrag: boolean
  /** 当前是否可改尺寸：作者允许、未禁用、且是常规形态。 */
  canResize: boolean
  setOpen: (next: boolean) => void
  setPosition: (next: FloatingPanelPosition) => void
  /** 尺寸会被夹进 minSize / maxSize 之后才落定。 */
  setDimensions: (next: FloatingPanelSize) => void
  setWindowState: (next: FloatingPanelWindowState) => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getHeaderProps: () => T['element']
  getTitleProps: () => T['element']
  getDragTriggerProps: () => T['button']
  /** 把手是 role=separator 的元素而不是按钮：方向键推动边，激活键在这里没有语义。 */
  getResizeTriggerProps: (props: FloatingPanelResizeTriggerProps) => T['element']
  getWindowStateTriggerProps: (props: FloatingPanelWindowStateTriggerProps) => T['button']
  getCloseTriggerProps: () => T['button']
  getBodyProps: () => T['element']
}
