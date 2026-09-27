/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 funnel chart 状态机与连接层契约，和不依赖实现的公开类型分开，避免类型环。

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
} from '../shared/chart'
import type { FunnelModel, FunnelPipeline } from './funnel-chart.model'
import type {
  FunnelAlign,
  FunnelChartTranslations,
  FunnelConversion,
  FunnelDirection,
  FunnelLabels,
  FunnelMarkTag,
  FunnelShape,
  FunnelTooltipModel,
  FunnelTooltipRow,
} from './funnel-chart.types'

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

export interface FunnelOverlay {
  /** 画在阶段之上：焦点环。 */
  readonly over: readonly Mark[]
}

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
