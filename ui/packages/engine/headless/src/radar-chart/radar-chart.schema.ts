/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 radar chart 状态机与连接层契约，和不依赖实现的公开类型分开，避免类型环。

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
} from '../shared/chart'
import type { RadarModel, RadarPipeline } from './radar-chart.model'
import type {
  RadarChartTranslations,
  RadarCurve,
  RadarIndicator,
  RadarLegendItem,
  RadarMarkTag,
  RadarScale,
  RadarShape,
  RadarTooltipModel,
  RadarTooltipRow,
} from './radar-chart.types'

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

export interface RadarOverlay {
  /** 画在网格之上、数据之下：激活的指标轴。 */
  readonly under: readonly Mark[]
  /** 画在数据之上：焦点环。 */
  readonly over: readonly Mark[]
}

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
