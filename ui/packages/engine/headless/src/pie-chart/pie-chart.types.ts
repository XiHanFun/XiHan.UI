/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 pie chart 类型契约。

import type {
  ChartTranslations,
} from '../shared/chart/types'

/** 形态：donut 环形（缺省），pie 实心饼。 */
export type PieVariant = 'pie' | 'donut'

/** 扫过的角度：full 一整圈，half 上半圈。 */
export type PieSweep = 'full' | 'half'

/** 扇区次序：descending 大的在前（缺省），none 按数据次序；「其他」始终排在最后。 */
export type PieSort = 'none' | 'descending'

/** 扇区标签：outside 画在外侧、带引导线（缺省），inside 画在扇区里，none 不画。 */
export type PieLabels = 'none' | 'inside' | 'outside'

/**
 * 扇区标签写什么：name-share 名字加占比，name-value 名字加数值，name 只写名字，
 * share 只写占比，value 只写数值。缺省外侧是 name-share、内侧是 share。
 */
export type PieLabelContent = 'name-share' | 'name-value' | 'name' | 'share' | 'value'

/** 自己拼扇区标签时拿到的事实：数值与占比按 locale 与 format 写好了。 */
export interface PieLabelDetails {
  readonly id: string
  /** 扇区名；「其他」取 translations.otherLabel。 */
  readonly name: string
  readonly value: number
  /** 占可见合计的比例，0–1。 */
  readonly share: number
  readonly formatted: { readonly value: string, readonly share: string }
  /** 是不是合并出来的「其他」。 */
  readonly other: boolean
}

/** 图例里的一项：一个扇区一项，「其他」也是一项。 */
export interface PieLegendItem {
  readonly id: string
  readonly name: string
  /** 分类色槽 1–8；「其他」为 null，取「其他」色。 */
  readonly slot: number | null
  /** 是不是合并出来的「其他」。 */
  readonly other: boolean
  readonly hidden: boolean
}

/** 提示框里的一行：色标、数值与说明。 */
export interface PieTooltipRow {
  readonly key: string
  /** 普通扇区写占比；「其他」的明细行写被合并的那一项的名字。 */
  readonly name: string
  readonly value: string
  readonly slot: number | null
  readonly other: boolean
}

/** 提示框的内容：头部是扇区名，下面是数值与占比；「其他」另列出被合并的各项。 */
export interface PieTooltipModel {
  readonly header: string
  readonly rows: readonly PieTooltipRow[]
}

/** 摘要模型：摘要模板拿到的全部事实，数字已按 locale 写好。 */
export interface PieSummary {
  readonly sliceCount: number
  readonly total: string
  /** 可见扇区按数值从大到小；没有数据时为空。 */
  readonly slices: readonly { readonly name: string, readonly value: string, readonly share: string }[]
}

export interface PieChartTranslations extends ChartTranslations {
  /** 环形中心缺省内容的说明文字（数值是合计）。 */
  centerLabel: string
  /** 数据表各列的列名。 */
  nameLabel: string
  valueLabel: string
  shareLabel: string
  summary: (model: PieSummary) => string
}

/** 场景里的一个标记在 DOM 里画成什么元素。 */
export type PieMarkTag = 'g' | 'path' | 'text'
