/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 拖放的类型契约。这一层只算几何，不碰 DOM。

/** 一块矩形，字段与 `DOMRect` 的同名字段一致，但不依赖 DOM 类型。 */
export interface DndRect {
  x: number
  y: number
  width: number
  height: number
}

/** 二维位移。 */
export interface DndDelta {
  x: number
  y: number
}

/**
 * 排序沿哪根轴走。
 * `both` 给换行网格用——落点按最近中心判，不按单轴先后。
 */
export type SortableAxis = 'horizontal' | 'vertical' | 'both'

export interface SortableProjectionInput {
  /**
   * 按 DOM 顺序排的项矩形，**取按下那一刻的快照**。
   * 不能每帧重量：让位之后的布局已经变了，拿变形后的几何再算落点会来回抖。
   */
  rects: readonly DndRect[]
  /** 被拖那一项的下标。 */
  from: number
  /** 指针相对按下点的位移。 */
  delta: DndDelta
  axis: SortableAxis
}

export interface SortableProjection {
  /** 此刻松手会落到第几位。没动或算不出来时等于 `from`。 */
  to: number
  /**
   * 每一项的位移，下标与 `rects` 对齐。
   * 被拖那一项是跟手位移，其余是让位位移；不动的项是零。
   */
  offsets: readonly DndDelta[]
}

/**
 * 单轴排布的主方向：沿轴正向排（上到下、左到右）为 1，反向（从右往左的水平排布）为 -1。
 * 列表里有两项以上时由首尾两项的先后判出，这里只在判不出时兜底。
 */
export type DndDirection = 1 | -1

export interface InsertionProjectionInput {
  /** 目标列表按 DOM 顺序排的项矩形，拖入那一刻的快照。 */
  rects: readonly DndRect[]
  /** 拖入项此刻的中心，视口坐标。 */
  point: DndDelta
  axis: 'horizontal' | 'vertical'
  /** 目标列表不足两项、判不出排布方向时按它算，缺省 1。 */
  direction?: DndDirection
}

export interface InsertionLayoutInput {
  /** 目标列表按 DOM 顺序排的项矩形，拖入那一刻的快照。 */
  rects: readonly DndRect[]
  /** 插在第几位：0 到项数，等于项数即排到末尾。 */
  index: number
  axis: 'horizontal' | 'vertical'
  /** 拖入项的尺寸：让位与落位都按它算。 */
  size: { width: number, height: number }
  /** 目标列表相邻两项之间的间距。 */
  gap: number
  /** 目标列表不足两项、判不出排布方向时按它算，缺省 1。 */
  direction?: DndDirection
  /** 目标列表的内容盒（容器矩形去掉边框与内边距），列表为空时拖入项落在它的起点上。 */
  box: DndRect
}

export interface SortableOffsetsInput {
  /** 按 DOM 顺序排的项矩形，按下那一刻的快照。 */
  rects: readonly DndRect[]
  from: number
  to: number
  /**
   * 被拖项的跟手位移。指针拖拽给它；键盘拖拽不给，被拖项直接落到目标槽位的起点。
   */
  dragDelta?: DndDelta
}
