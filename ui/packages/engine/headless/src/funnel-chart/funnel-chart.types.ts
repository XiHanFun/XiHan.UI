/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 funnel chart 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'
import type { Mark, NumberFormatSpec, Scene, TableModel } from '@xihan-ui/viz'
import type {
  ChartBaseAction,
  ChartBaseComputed,
  ChartBaseContext,
  ChartBaseEvent,
  ChartBaseRefs,
  ChartCommonProps,
  ChartDatumDetails,
  ChartKey,
  ChartPalette,
  ChartRow,
  ChartTranslations,
} from '../shared/chart'
import type { FunnelOverlay } from './funnel-chart.logic'
import type { FunnelModel, FunnelPipeline } from './funnel-chart.model'

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

export interface FunnelChartSchema extends MachineSchema {
  props: ChartCommonProps & {
    /** 数据：对象数组，按阶段的先后排好，每行一个阶段。 */
    data?: readonly ChartRow[]
    /** 阶段名所在的字段。 */
    nameField?: string
    /** 数值所在的字段。 */
    valueField?: string
    /** 阶段的形状，缺省 trapezoid。 */
    shape?: FunnelShape
    /** 阶段的对齐，缺省 center。 */
    align?: FunnelAlign
    /** 排列方向，缺省 down；up 即金字塔。 */
    direction?: FunnelDirection
    /** 转化率的基准，缺省 previous。 */
    conversion?: FunnelConversion
    /** 阶段标签，缺省 outside。 */
    labels?: FunnelLabels
    /** 顺序色阶的色板：阶段由深入浅取这个色相；不写时取顺序色阶令牌。 */
    palette?: ChartPalette
    /** 数值格式：标签、提示框、可及名与数据表共用。 */
    format?: NumberFormatSpec | ((value: number) => string)
    translations?: Partial<FunnelChartTranslations>
  }
  context: ChartBaseContext
  computed: ChartBaseComputed
  refs: ChartBaseRefs & {
    /** 管线：按输入引用分段记忆，悬停与聚焦不会让它重算。 */
    pipeline: FunnelPipeline
  }
  state: 'idle'
  event: ChartBaseEvent
  tag: never
  guard: never
  action: ChartBaseAction | 'notifyActive' | 'reportIssues'
  effect: 'trackViewport'
}

/** 场景里的一个标记在 DOM 里画成什么元素。 */
export type FunnelMarkTag = 'g' | 'path' | 'text'

export interface FunnelChartApi<T extends PropTypes = PropTypes> {
  /** 管线产物：阶段、布局、场景与无障碍模型。 */
  model: FunnelModel
  /** 要画的场景；尚未测量时为空场景。 */
  scene: Scene
  /** 前景层：焦点环画在阶段之上。 */
  overlay: FunnelOverlay
  /** 视口尚未测量（服务端与首帧）。 */
  measured: boolean
  /** 没有可画的阶段。 */
  empty: boolean
  /** 激活的阶段；没有时为 null。 */
  active: ChartDatumDetails | null
  /** 提示框内容；收起时为 null。 */
  tooltip: FunnelTooltipModel | null
  summary: string
  /** 数据表模型：阶段名、数值、相对上一阶段、相对第一阶段四列。 */
  table: TableModel
  emptyText: string
  tableCaption: string
  activeKey: ChartKey | null
  hiddenSeries: string[]
  /** 切换某个阶段的显隐：隐藏的阶段不画，转化率跳过它重算。 */
  toggleSeries: (id: string) => void
  /** 移动键盘锚点：只改锚点，不移动 DOM 焦点，也不派发回调。 */
  setFocusedDatum: (ref: { seriesId: string, index: number } | null) => void
  markTag: (mark: Mark) => FunnelMarkTag
  getRootProps: () => T['element']
  getCaptionProps: () => T['element']
  getViewportProps: () => T['element']
  getPlotProps: () => T['element']
  getMarkProps: (mark: Mark) => T['element']
  getTooltipProps: () => T['element']
  getTooltipHeaderProps: () => T['element']
  getTooltipRowProps: (row: FunnelTooltipRow) => T['element']
  getTooltipSwatchProps: (row: FunnelTooltipRow) => T['element']
  getTooltipValueProps: (row: FunnelTooltipRow) => T['element']
  getTooltipNameProps: (row: FunnelTooltipRow) => T['element']
  getEmptyProps: () => T['element']
  getSummaryProps: () => T['element']
  getTableProps: () => T['element']
}
