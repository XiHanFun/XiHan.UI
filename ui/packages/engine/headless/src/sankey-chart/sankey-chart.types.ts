/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 sankey chart 类型契约。

import type { ChartTranslations } from '../shared/chart/types'

/** 一个节点：身份、显示的名字与分组；分组决定颜色与图例。 */
export interface SankeyNodeDatum {
  readonly id: string
  /** 显示的名字，缺省同 id。 */
  readonly name?: string
  /** 分组：同一组的节点同一个颜色，图例按组显隐。 */
  readonly group?: string
}

/** 一条流带：从源节点流到目标节点的量。 */
export interface SankeyLinkDatum {
  readonly source: string
  readonly target: string
  readonly value: number
}

/** 流向：horizontal 自左而右（缺省），vertical 自上而下。 */
export type SankeyOrientation = 'horizontal' | 'vertical'

/** 节点分到哪一列：justify 两端对齐（缺省），start 靠源头，end 靠汇点，center 居中。 */
export type SankeyNodeAlign = 'justify' | 'start' | 'end' | 'center'

/** 流带的颜色：neutral 中性色（缺省），source / target 取源 / 目标节点的颜色，gradient 从源节点渐变到目标节点。 */
export type SankeyLinkColor = 'neutral' | 'source' | 'target' | 'gradient'

/** 列内次序：auto 由布局按相连节点的位置排（缺省），input 保持数据次序。 */
export type SankeyNodeSort = 'auto' | 'input'

/** 图例里的一项：一个分组一项。 */
export interface SankeyLegendItem {
  readonly id: string
  readonly name: string
  /** 分类色槽 1–8。 */
  readonly slot: number
  readonly hidden: boolean
}

/** 提示框里的一行：节点的合计、一条流入或流出，或流带占两端的比例。 */
export interface SankeyTooltipRow {
  readonly key: string
  readonly name: string
  readonly value: string
  /** 这一行画哪个色槽的色标；不画时为 null。 */
  readonly slot: number | null
  /** value 合计，in 流入，out 流出，share 占比。 */
  readonly kind: 'value' | 'in' | 'out' | 'share'
}

/** 提示框的内容：节点写名字与流入流出的明细，流带写两端与流量。 */
export interface SankeyTooltipModel {
  readonly header: string
  readonly rows: readonly SankeyTooltipRow[]
}

/** 摘要模型：摘要模板拿到的全部事实，数字已按 locale 写好。 */
export interface SankeySummary {
  readonly nodeCount: number
  readonly linkCount: number
  /** 源头（没有流入的节点）的流出合计。 */
  readonly total: string
  /** 最大的一条流带；没有流带时为 null。 */
  readonly largest: { readonly source: string, readonly target: string, readonly value: string } | null
}

export interface SankeyChartTranslations extends ChartTranslations {
  /** 数据表与提示框里「源」的写法。 */
  sourceLabel: string
  /** 数据表与提示框里「目标」的写法。 */
  targetLabel: string
  /** 数据表与提示框里「流量」的写法。 */
  valueLabel: string
  /** 提示框里流入明细的前缀。 */
  inflowLabel: string
  /** 提示框里流出明细的前缀。 */
  outflowLabel: string
  summary: (model: SankeySummary) => string
}

/** 流带渐变：从源节点的颜色过渡到目标节点的颜色，画在绘图区的 defs 里。 */
export interface SankeyGradient {
  readonly id: string
  readonly x1: number
  readonly y1: number
  readonly x2: number
  readonly y2: number
  readonly from: number
  readonly to: number
}

/** 场景里的一个标记在 DOM 里画成什么元素。 */
export type SankeyMarkTag = 'g' | 'path' | 'text'
