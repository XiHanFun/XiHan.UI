/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 funnel chart 类型契约。

import type {
  ChartTranslations,
} from '../shared/chart'

/** 阶段的形状：trapezoid 梯形（缺省，上下两边接着相邻阶段的宽度），bar 居中的条形，更利于比较。 */
export type FunnelShape = 'trapezoid' | 'bar'

/** 阶段的对齐：center 居中（缺省），start 靠起始边对齐，逐级缩短看得更清楚。 */
export type FunnelAlign = 'center' | 'start'

/** 阶段排列的方向：down 第一阶段在最上面（缺省），up 第一阶段在最下面（金字塔）。 */
export type FunnelDirection = 'down' | 'up'

/** 转化率的基准：previous 相对上一阶段（缺省），first 相对第一阶段，none 不写。 */
export type FunnelConversion = 'previous' | 'first' | 'none'

/** 阶段标签：outside 跟在各阶段的右边（缺省），inside 写在阶段里、描一圈承载面色，放不下时写到阶段右边。 */
export type FunnelLabels = 'inside' | 'outside'

/** 提示框里的一行：数值与两种转化率。 */
export interface FunnelTooltipRow {
  readonly key: 'value' | 'previous' | 'first'
  readonly name: string
  readonly value: string
}

/** 提示框的内容：头部是阶段名，下面是数值与两种转化率（第一阶段没有转化率）。 */
export interface FunnelTooltipModel {
  readonly header: string
  readonly rows: readonly FunnelTooltipRow[]
}

/** 摘要模型：摘要模板拿到的全部事实，数字已按 locale 写好。 */
export interface FunnelSummary {
  readonly stageCount: number
  readonly first: { readonly name: string, readonly value: string } | null
  readonly last: { readonly name: string, readonly value: string } | null
  /** 最后一个阶段相对第一个阶段的转化率；少于两个阶段时为 null。 */
  readonly overall: string | null
  /** 相对上一阶段流失最多的那一步；少于两个阶段时为 null。 */
  readonly steepest: { readonly from: string, readonly to: string, readonly rate: string } | null
}

export interface FunnelChartTranslations extends ChartTranslations {
  /** 数据表与提示框的列名 / 行名。 */
  nameLabel: string
  valueLabel: string
  previousLabel: string
  firstLabel: string
  summary: (model: FunnelSummary) => string
}

/** 场景里的一个标记在 DOM 里画成什么元素。 */
export type FunnelMarkTag = 'g' | 'path' | 'text'
