/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 radar chart 类型契约。

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
  ChartPattern,
  ChartRow,
  ChartTranslations,
} from '../shared/chart'
import type { RadarOverlay } from './radar-chart.logic'
import type { RadarModel, RadarPipeline } from './radar-chart.model'

/** 一个指标：数据里的字段、显示的名字与量程；量程不写时下限取 0（有负值时取最小值），上限按数据取整。 */
export interface RadarIndicator {
  readonly key: string
  /** 显示的名字，缺省同 key。 */
  readonly label?: string
  readonly min?: number
  readonly max?: number
}

/** 网格的形状：polygon 多边形（缺省），circle 同心圆。 */
export type RadarShape = 'polygon' | 'circle'

/** 量程：independent 每个指标自己的量程（缺省），shared 全部指标共用一个量程。 */
export type RadarScale = 'shared' | 'independent'

/** 轮廓的画法：linear 直线相连（缺省），catmull-rom 平滑地穿过每个顶点。 */
export type RadarCurve = 'linear' | 'catmull-rom'

/** 图例里的一项：一个实体（一个系列）一项。 */
export interface RadarLegendItem {
  readonly id: string
  readonly name: string
  /** 分类色槽 1–8。 */
  readonly slot: number
  readonly hidden: boolean
}

/** 提示框里的一行：一个可见系列在这个指标上的值。 */
export interface RadarTooltipRow {
  readonly seriesId: string
  readonly name: string
  readonly value: string
  readonly slot: number
}

/** 提示框的内容：头部是指标名，每个可见系列一行。 */
export interface RadarTooltipModel {
  readonly header: string
  readonly rows: readonly RadarTooltipRow[]
}

/** 摘要模型：摘要模板拿到的全部事实，数字已按 locale 写好。 */
export interface RadarSummary {
  readonly seriesCount: number
  readonly indicatorCount: number
  /** 每个可见系列最高与最低的指标（按在各自量程里的位置比）；没有值的系列两项为 null。 */
  readonly series: readonly {
    readonly name: string
    readonly highest: { readonly indicator: string, readonly value: string } | null
    readonly lowest: { readonly indicator: string, readonly value: string } | null
  }[]
}

export interface RadarChartTranslations extends ChartTranslations {
  /** 数据表首列（实体名）的列名。 */
  nameLabel: string
  summary: (model: RadarSummary) => string
}

export interface RadarChartSchema extends MachineSchema {
  props: ChartCommonProps & {
    /** 数据：对象数组，每行一个实体（一个系列）。 */
    data?: readonly ChartRow[]
    /** 实体名所在的字段：图例、提示框与数据表显示它，hiddenSeries 用它。 */
    nameField?: string
    /** 指标：3–10 个，按顺时针从 12 点方向排开。 */
    indicators?: readonly RadarIndicator[]
    /** 网格形状，缺省 polygon。 */
    shape?: RadarShape
    /** 轮廓里铺一层系列色的淡洗，缺省 true。 */
    area?: boolean
    /** 量程，缺省 independent。 */
    scale?: RadarScale
    /** 轮廓的画法，缺省 linear。 */
    curve?: RadarCurve
    /** 数值格式：提示框、可及名与数据表共用。 */
    format?: NumberFormatSpec | ((value: number) => string)
    translations?: Partial<RadarChartTranslations>
  }
  context: ChartBaseContext
  computed: ChartBaseComputed
  refs: ChartBaseRefs & {
    /** 管线：按输入引用分段记忆，悬停与聚焦不会让它重算。 */
    pipeline: RadarPipeline
  }
  state: 'idle'
  event: ChartBaseEvent
  tag: never
  guard: never
  action: ChartBaseAction | 'notifyActive' | 'reportIssues'
  effect: 'trackViewport'
}

/** 场景里的一个标记在 DOM 里画成什么元素。 */
export type RadarMarkTag = 'g' | 'path' | 'text'

export interface RadarChartApi<T extends PropTypes = PropTypes> {
  /** 管线产物：系列、量程、布局、场景与无障碍模型。 */
  model: RadarModel
  /** 要画的场景；尚未测量时为空场景。 */
  scene: Scene
  /** 前景层：激活的指标轴与焦点环。 */
  overlay: RadarOverlay
  /** 视口尚未测量（服务端与首帧）。 */
  measured: boolean
  /** 没有可画的数据（没有数据、全部隐藏或没有值）。 */
  empty: boolean
  legendItems: readonly RadarLegendItem[]
  /** 各系列的纹理：画在绘图区的 defs 里，强制色、打印与环境开启纹理时面积用它填充。 */
  patterns: readonly ChartPattern[]
  /** 激活的数据；没有时为 null。 */
  active: ChartDatumDetails | null
  /** 提示框内容；收起时为 null。 */
  tooltip: RadarTooltipModel | null
  summary: string
  /** 数据表模型：实体名一列，每个指标一列。 */
  table: TableModel
  emptyText: string
  tableCaption: string
  activeKey: ChartKey | null
  hiddenSeries: string[]
  /** 切换某个系列的显隐。 */
  toggleSeries: (id: string) => void
  /** 移动键盘锚点：只改锚点，不移动 DOM 焦点，也不派发回调。 */
  setFocusedDatum: (ref: { seriesId: string, index: number } | null) => void
  markTag: (mark: Mark) => RadarMarkTag
  getRootProps: () => T['element']
  getCaptionProps: () => T['element']
  getLegendProps: () => T['element']
  getLegendItemProps: (item: RadarLegendItem) => T['button']
  getLegendSwatchProps: (item: RadarLegendItem) => T['element']
  getLegendLabelProps: (item: RadarLegendItem) => T['element']
  getViewportProps: () => T['element']
  getPlotProps: () => T['element']
  /** 绘图区的第一个子节点：各系列的纹理定义在这里。 */
  getDefsProps: () => T['element']
  getPatternProps: (pattern: ChartPattern) => T['element']
  getPatternLineProps: (pattern: ChartPattern) => T['element']
  getMarkProps: (mark: Mark) => T['element']
  getTooltipProps: () => T['element']
  getTooltipHeaderProps: () => T['element']
  getTooltipRowProps: (row: RadarTooltipRow) => T['element']
  getTooltipSwatchProps: (row: RadarTooltipRow) => T['element']
  getTooltipValueProps: (row: RadarTooltipRow) => T['element']
  getTooltipNameProps: (row: RadarTooltipRow) => T['element']
  getEmptyProps: () => T['element']
  getSummaryProps: () => T['element']
  getTableProps: () => T['element']
}
