/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 pie chart 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'
import type { Mark, NumberFormatSpec, Scene, TableModel } from '@xihan-ui/viz'
import type {
  ChartBaseAction,
  ChartBaseContext,
  ChartBaseEvent,
  ChartBaseRefs,
  ChartCommonProps,
  ChartDatumDetails,
  ChartKey,
  ChartRow,
  ChartTranslations,
} from '../shared/chart'
import type { PieOverlay } from './pie-chart.logic'
import type { PieModel, PiePipeline } from './pie-chart.model'

/** 形态：donut 环形（缺省），pie 实心饼。 */
export type PieVariant = 'pie' | 'donut'

/** 扫过的角度：full 一整圈，half 上半圈。 */
export type PieSweep = 'full' | 'half'

/** 扇区次序：descending 大的在前（缺省），none 按数据次序；「其他」始终排在最后。 */
export type PieSort = 'none' | 'descending'

/** 扇区标签：outside 画在外侧、带引导线（缺省），inside 画在扇区里，none 不画。 */
export type PieLabels = 'none' | 'inside' | 'outside'

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

export interface PieChartSchema extends MachineSchema {
  props: ChartCommonProps & {
    /** 数据：对象数组，每行一个扇区。 */
    data?: readonly ChartRow[]
    /** 扇区名所在的字段。 */
    nameField?: string
    /** 数值所在的字段。 */
    valueField?: string
    /** 形态，缺省 donut。 */
    variant?: PieVariant
    /** 南丁格尔玫瑰图：角度均分，半径按数值。 */
    rose?: boolean
    /** 扫过的角度，缺省 full。 */
    sweep?: PieSweep
    /** 扇区次序，缺省 descending。 */
    sort?: PieSort
    /** 最多保留几个扇区（含「其他」），缺省 6；多出来的小扇区并成「其他」。 */
    maxSlices?: number
    /** 扇区标签，缺省 outside。 */
    labels?: PieLabels
    /** 数值格式：提示框、标签、中心合计与数据表共用。 */
    format?: NumberFormatSpec | ((value: number) => string)
    translations?: Partial<PieChartTranslations>
  }
  context: ChartBaseContext
  computed: Record<string, never>
  refs: ChartBaseRefs & {
    /** 管线：按输入引用分段记忆，悬停与聚焦不会让它重算。 */
    pipeline: PiePipeline
  }
  state: 'idle'
  event: ChartBaseEvent
  tag: never
  guard: never
  action: ChartBaseAction | 'notifyActive' | 'reportIssues'
  effect: 'trackViewport'
}

/** 场景里的一个标记在 DOM 里画成什么元素。 */
export type PieMarkTag = 'g' | 'path' | 'text'

export interface PieChartApi<T extends PropTypes = PropTypes> {
  /** 管线产物：扇区、布局、场景与无障碍模型。 */
  model: PieModel
  /** 要画的场景；尚未测量时为空场景。 */
  scene: Scene
  /** 前景层：焦点环画在扇区之上。 */
  overlay: PieOverlay
  /** 视口尚未测量（服务端与首帧）。 */
  measured: boolean
  /** 没有可画的数据（全部为 0、没有数据或全部隐藏）。 */
  empty: boolean
  legendItems: readonly PieLegendItem[]
  /** 激活的扇区；没有时为 null。 */
  active: ChartDatumDetails | null
  /** 提示框内容；收起时为 null。 */
  tooltip: PieTooltipModel | null
  /** 环形中心的缺省内容：可见扇区的合计与说明文字。 */
  center: { readonly value: string, readonly label: string }
  summary: string
  /** 数据表模型：扇区名、数值、占比三列。 */
  table: TableModel
  emptyText: string
  tableCaption: string
  activeKey: ChartKey | null
  hiddenSeries: string[]
  /** 切换某个扇区的显隐。 */
  toggleSeries: (id: string) => void
  /** 移动键盘锚点：只改锚点，不移动 DOM 焦点，也不派发回调。 */
  setFocusedDatum: (ref: { seriesId: string, index: number } | null) => void
  markTag: (mark: Mark) => PieMarkTag
  getRootProps: () => T['element']
  getCaptionProps: () => T['element']
  getLegendProps: () => T['element']
  getLegendItemProps: (item: PieLegendItem) => T['button']
  getLegendSwatchProps: (item: PieLegendItem) => T['element']
  getLegendLabelProps: (item: PieLegendItem) => T['element']
  getViewportProps: () => T['element']
  getPlotProps: () => T['element']
  getMarkProps: (mark: Mark) => T['element']
  getCenterProps: () => T['element']
  getCenterValueProps: () => T['element']
  getCenterLabelProps: () => T['element']
  getTooltipProps: () => T['element']
  getTooltipHeaderProps: () => T['element']
  getTooltipRowProps: (row: PieTooltipRow) => T['element']
  getTooltipSwatchProps: (row: PieTooltipRow) => T['element']
  getTooltipValueProps: (row: PieTooltipRow) => T['element']
  getTooltipNameProps: (row: PieTooltipRow) => T['element']
  getEmptyProps: () => T['element']
  getSummaryProps: () => T['element']
  getTableProps: () => T['element']
}
