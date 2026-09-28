/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 graph chart 类型契约。

import type {
  ChartTranslations,
} from '../shared/chart'

/** 一个节点：身份、名字、分组与数值；分组决定颜色与图例，数值决定面积。 */
export interface GraphNodeDatum {
  readonly id: string
  /** 显示的名字，缺省同 id。 */
  readonly name?: string
  readonly group?: string
  /** 数值：经平方根比例尺决定节点面积；不写时节点一样大。 */
  readonly value?: number
  /**
   * 预设坐标：layout 为 preset 时节点按它摆放。单位随意（经纬度、设计稿像素都行），
   * 整体等比缩放到绘图区里，纵轴向下为正。其余布局不读它。
   */
  readonly x?: number
  readonly y?: number
}

/** 一条连线：两端节点的身份，可选的权重决定线的粗细。 */
export interface GraphLinkDatum {
  readonly source: string
  readonly target: string
  readonly value?: number
  /** 连线上写的字（关系名）：画在连线中点，数据表里多一列。 */
  readonly label?: string
}

/**
 * 布局：force 力导（缺省），circular 环形，tree 树（根在左、自左而右），radial-tree 径向树（根在中间），
 * preset 按节点上写的 x / y 摆放（等比缩放到绘图区）。
 */
export type GraphLayout = 'force' | 'circular' | 'tree' | 'radial-tree' | 'preset'

/** 画布的平移缩放：k 是缩放倍数，(x, y) 是平移；节点的位置跟着变，大小与文字不变。 */
export interface GraphView {
  readonly k: number
  readonly x: number
  readonly y: number
}

/** 画布视图变化时对外报告的详情。 */
export interface GraphViewChangeDetails {
  view: GraphView
}

/** 图例里的一项：一个分组一项。 */
export interface GraphLegendItem {
  readonly id: string
  readonly name: string
  /** 分类色槽 1–8。 */
  readonly slot: number
  readonly hidden: boolean
}

/** 提示框里的一行：数值、连线数，有向时分出入。 */
export interface GraphTooltipRow {
  readonly key: string
  readonly name: string
  readonly value: string
}

export interface GraphTooltipModel {
  readonly header: string
  readonly rows: readonly GraphTooltipRow[]
}

/** 摘要模型：摘要模板拿到的全部事实，数字已按 locale 写好。 */
export interface GraphSummary {
  readonly nodeCount: number
  readonly linkCount: number
  /** 连线最多的节点；没有连线时为 null。 */
  readonly hub: { readonly name: string, readonly degree: number } | null
}

export interface GraphChartTranslations extends ChartTranslations {
  /** 数据表与提示框里「源」「目标」「权重」的写法。 */
  sourceLabel: string
  targetLabel: string
  valueLabel: string
  /** 数据表里连线上的字那一列的列名。 */
  linkLabel: string
  /** 提示框里连线数一行的名字。 */
  linksLabel: string
  /** 有向时入边与出边的名字。 */
  incomingLabel: string
  outgoingLabel: string
  summary: (model: GraphSummary) => string
}

/** 拖着的节点或平移中的画布。 */
export interface GraphDrag {
  readonly pointerId: number
  /** 拖着的节点；平移画布时为 null。 */
  readonly id: string | null
  /** 平移：按下时的指针位置与视图。 */
  readonly from: { readonly x: number, readonly y: number }
  readonly view: GraphView
}

/** 场景里的一个标记在 DOM 里画成什么元素。 */
export type GraphMarkTag = 'g' | 'path' | 'text'
