/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 virtualizer 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'
import type { VirtualizerAlign } from './virtualizer.geometry'
import type { VirtualizerKernel } from './virtualizer.kernel'
import type { VirtualizerItemState, VirtualizerSnapshot } from './virtualizer.sizing'

/**
 * 计算内核实例。区间、实测尺寸账本、多列分道全在它那一侧，本组件只负责它的生命周期与接线。
 * 滚动容器与条目都是 HTMLElement，不支持以 window 为滚动容器的形态。
 */
export type VirtualizerCore = VirtualizerKernel

export interface VirtualizerScrollToOptions {
  /** 默认 start。 */
  align?: VirtualizerAlign
}

/** 应渲染的内容变化时对外报告的详情，与 api 上的同名字段同源。 */
export interface VirtualizerRangeChangeDetails {
  virtualItems: readonly VirtualizerItemState[]
  totalSize: number
  startIndex: number | null
  endIndex: number | null
}

/** 条目的声明：作者在节点上声明自身的下标，连接层据此获取位移，不反查 DOM。 */
export interface VirtualizerItemProps {
  index: number
}

// 适配器挂载前填入；保持缺省时效应短路，机器状态照常转移但建不出内核、快照恒为空。
export interface VirtualizerRefs {
  /** 实际 overflow:auto 的层：内核的尺寸观察、滚动监听与滚动写回全部落在它身上。 */
  getViewportEl: () => HTMLElement | null
  /** 撑出总长的层。只用于给条目提供定位上下文，内核不识别它。 */
  getContentEl: () => HTMLElement | null
  /**
   * 计算内核，由状态机的效应在挂载后填入、退出时清空。
   * 它同时是内核是否存活的判据，停机后残留的回调用它比较即可判断。
   */
  getVirtualizer: () => VirtualizerCore | null
}

export interface VirtualizerSchema extends MachineSchema {
  props: {
    /** 总条数，默认 0。 */
    count?: number
    /**
     * 每条的估算主轴尺寸（px）。等高列表可以直接提供一个数字。
     * 未提供时按 0 计算：所有条目都会落进窗口，先渲染出来再依靠 measureElement 回填真实尺寸。
     */
    estimateSize?: number | ((index: number) => number)
    /** 可视区前后各多渲染的条数，默认 5。 */
    overscan?: number
    /** 横向列表（主轴是行内轴），默认 false。 */
    horizontal?: boolean
    /** 相邻两条之间的主轴间距（px），默认 0。位移由内核直接计算，不依靠外边距。 */
    gap?: number
    /** 条目身份。默认即下标；列表会增删时提供稳定 key，测量缓存才能跟随条目。 */
    getItemKey?: (index: number) => string | number
    /** 应渲染的区间变化。只在快照实际变化时回调，滚动但可见区间未变不会触发。 */
    onRangeChange?: (details: VirtualizerRangeChangeDetails) => void
    /**
     * 列表起点距滚动容器起点的距离（px），默认 0。
     * 列表上方还有其他内容（页头、筛选栏）时提供它，否则区间会整体偏移该段距离。
     */
    scrollMargin?: number
    /** 列表前后的内边距（px），默认 0。计入总长，第一条从 paddingStart 处起算。 */
    paddingStart?: number
    paddingEnd?: number
    /** 多列网格的列数，默认 1（单列）。条目按下标轮流落到各列上。 */
    lanes?: number
  }
  context: {
    /** 应渲染内容的唯一事实源。连接层只读取它，不涉及任何 DOM。 */
    snapshot: VirtualizerSnapshot
  }
  computed: Record<string, never>
  refs: VirtualizerRefs
  /**
   * 只有正在滚动这一件事进入状态，区间与尺寸是计算出的数据、存放在 context 中。
   * idle 静止；scrolling 滚动事件持续到达（内核自带停止判定）。
   */
  state: 'idle' | 'scrolling'
  event:
    /** 内核报告滚动开始。 */
    | { type: 'SCROLL.START' }
    /** 内核报告滚动停止。 */
    | { type: 'SCROLL.END' }
    /** 重新测量视口、丢弃实测尺寸整份重排。 */
    | { type: 'MEASURE' }
  tag: never
  guard: never
  action: 'syncOptions' | 'remeasure'
  effect: 'trackVirtualizer'
}

export interface VirtualizerApi<T extends PropTypes = PropTypes> {
  /** 当前应渲染的下标，以及它们的位移与尺寸。 */
  virtualItems: readonly VirtualizerItemState[]
  /** 整份列表的主轴总长（px）。 */
  totalSize: number
  /** 可视区首条下标（不含过扫描）；没有任何条目可容纳时为 null。 */
  startIndex: number | null
  /** 可视区末条下标（不含过扫描）；没有任何条目可容纳时为 null。 */
  endIndex: number | null
  horizontal: boolean
  lanes: number
  /** 正在滚动。 */
  scrolling: boolean
  /** 滚动到某一条。越界下标由内核夹取。 */
  scrollToIndex: (index: number, options?: VirtualizerScrollToOptions) => void
  /** 把条目节点的真实尺寸回填给内核（动态高度使用）。传 null 无副作用。 */
  measureElement: (element: HTMLElement | null) => void
  /** 丢弃全部实测尺寸重新按估算值排列。视口更换排版时使用。 */
  measure: () => void
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getContentProps: () => T['element']
  getItemProps: (props: VirtualizerItemProps) => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface VirtualizerTranslations {}
