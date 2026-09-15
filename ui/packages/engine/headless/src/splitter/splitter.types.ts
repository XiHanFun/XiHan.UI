/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 splitter 类型契约。

import type { Direction, MachineSchema, Orientation, PropTypes } from '@xihan-ui/core'

/**
 * 一块面板的约束声明。数组顺序即面板在容器中的顺序，与作者书写的面板节点一一对应。
 * 整份都可以不提供：未提供即每块 0-100 自由调整、不可折叠。
 */
export interface SplitterPanelProps {
  /** 作者给该面板起的名字，用于派生它的 DOM id（分隔条的 aria-controls 指向它）。 */
  id: string
  /** 百分比下界，默认 0。 */
  min?: number
  /** 百分比上界，默认 100。 */
  max?: number
  /** 是否允许折叠，默认 false。 */
  collapsible?: boolean
  /** 折叠后的百分比，默认 0；collapsible 为假时不使用。 */
  collapsedSize?: number
}

export interface SplitterSizesChangeDetails {
  /** 每块面板的百分比，总和恒为 100。 */
  sizes: number[]
}

export interface SplitterSizesChangeEndDetails {
  sizes: number[]
  /** 刚被推动的分隔条的下标。 */
  index: number
}

export interface SplitterPoint {
  clientX: number
  clientY: number
}

/**
 * 一次拖拽从按下时刻起冻结的全部依据。
 * 每帧从按下时的布局加指针总位移重新计算，不累加每帧增量。
 */
export interface SplitterDragSession {
  /** 被拖动的分隔条下标。 */
  index: number
  origin: SplitterPoint
  /** 容器在排布轴上的像素长度；整场拖拽只测量一次。 */
  extent: number
  /** 按下时的百分比布局。 */
  sizes: number[]
}

/** 读屏文案，默认英文。分隔条外观相同，位次是它们唯一的区分。 */
export interface SplitterTranslations {
  /** 整组面板的名字。 */
  root: string
  /** 第 index 条分隔条的名字；index 从 0 起，total 是分隔条总数。 */
  resizeTrigger: (index: number, total: number) => string
}

export interface SplitterSchema extends MachineSchema {
  props: {
    /** 每块面板的百分比。提供即受控：内部不再自行修改，只发 onSizesChange。 */
    sizes?: number[]
    /** 非受控初值；未提供时按面板数等分。 */
    defaultSizes?: number[]
    /** 逐块的约束；数组长度同时决定面板块数。 */
    panels?: SplitterPanelProps[]
    /** 面板的排布轴，默认 horizontal（并排，左右拖动）；vertical 是上下堆叠，上下拖动。 */
    orientation?: Orientation
    /** 文字方向，默认 ltr；只对调水平排布下的左右两键与指针位移的正负。 */
    dir?: Direction
    /** 禁用：分隔条退出 Tab 序列、不可拖动也不可推动。 */
    disabled?: boolean
    /** 方向键的步长（百分比），默认 1。 */
    step?: number
    /** Shift + 方向键的步长（百分比），默认 10。 */
    largeStep?: number
    translations?: Partial<SplitterTranslations>
    /** 每次尺寸变化都发出；拖动过程中连续发出。 */
    onSizesChange?: (details: SplitterSizesChangeDetails) => void
    /** 只在一次操作结束时发出一次，适合用于保存布局。 */
    onSizesChangeEnd?: (details: SplitterSizesChangeEndDetails) => void
  }
  context: {
    /** 每块面板的百分比，总和恒为 100。 */
    sizes: number[]
    /** 正在被推动的分隔条下标：拖动期间是被抓住的分隔条，键盘操作时是聚焦的分隔条。 */
    activeIndex: number
  }
  computed: Record<string, never>
  refs: {
    /** 容器节点。拖拽开始时测量它的矩形换算像素与百分比，connect 一律不涉及 DOM。 */
    getRootEl: () => HTMLElement | null
    /** 当前这场拖拽的依据；不在拖拽中时为 null。 */
    drag: SplitterDragSession | null
    /** 面板折叠前的尺寸，展开时按它还原。 */
    restore: Map<number, number>
  }
  state: 'idle' | 'dragging'
  event:
    /** 整份赋值（作者的命令式出口）；写入前逐块夹进约束并把总和归位到 100。 */
    | { type: 'SIZES.SET', sizes: number[] }
    | { type: 'BOUNDARY.STEP', index: number, direction: 1 | -1, large?: boolean }
    | { type: 'BOUNDARY.TO_MIN', index: number }
    | { type: 'BOUNDARY.TO_MAX', index: number }
    | { type: 'BOUNDARY.SET', index: number, size: number }
    | { type: 'BOUNDARY.FOCUS', index: number }
    | { type: 'PANEL.COLLAPSE', index: number }
    | { type: 'PANEL.EXPAND', index: number }
    | { type: 'DRAG.START', index: number, point: SplitterPoint }
    | { type: 'DRAG.MOVE', point: SplitterPoint }
    | { type: 'DRAG.END' }
    /** 中途放弃本场拖拽：布局退回按下时刻，收尾回调不发出。 */
    | { type: 'DRAG.CANCEL' }
  tag: never
  guard: 'canResize'
  action:
    | 'setSizes'
    | 'setActiveIndex'
    | 'stepBoundary'
    | 'boundaryToMin'
    | 'boundaryToMax'
    | 'setBoundary'
    | 'collapse'
    | 'expand'
    | 'dragBoundary'
    | 'invokeChangeEnd'
    | 'clearDrag'
    | 'cancelDrag'
  effect: 'trackPointer' | 'trackCancelKey'
}

export interface SplitterPanelState {
  index: number
  /** 作者声明的名字；未声明时是下标的字符串形式。 */
  id: string
  /** 当前百分比。 */
  size: number
  /** 当前实际能收缩到的最小值（自身的下界与后面的面板能容纳的量，取较宽松的一个）。 */
  min: number
  /** 当前实际能扩展到的最大值。 */
  max: number
  collapsible: boolean
  collapsed: boolean
}

export interface SplitterApi<T extends PropTypes = PropTypes> {
  sizes: number[]
  panels: SplitterPanelState[]
  dragging: boolean
  disabled: boolean
  /** 整份赋值：逐块夹进约束、总和归位到 100 之后才落定。 */
  setSizes: (next: number[]) => void
  /**
   * 把第 index 块调整为 next，差额从它后面的面板中获取。
   * 最后一块没有属于自己的分隔条，它的尺寸是其余面板的余数，不可调整。
   */
  setPanelSize: (index: number, next: number) => void
  collapsePanel: (index: number) => void
  expandPanel: (index: number) => void
  /** 折叠时展开、展开时折叠；不可折叠的面板上是空操作。 */
  togglePanel: (index: number) => void
  getRootProps: () => T['element']
  getPanelProps: (index: number) => T['element']
  /** 第 index 条分隔条位于第 index 与第 index+1 块面板之间，调整的是前一块。 */
  getResizeTriggerProps: (index: number) => T['element']
}
