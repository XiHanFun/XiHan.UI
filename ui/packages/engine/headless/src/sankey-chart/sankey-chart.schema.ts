/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 sankey chart 状态机与连接层契约，和不依赖实现的公开类型分开，避免类型环。

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
} from '../shared/chart'
import type { SankeyModel, SankeyPipeline } from './sankey-chart.model'
import type {
  SankeyChartTranslations,
  SankeyGradient,
  SankeyLegendItem,
  SankeyLinkColor,
  SankeyLinkDatum,
  SankeyMarkTag,
  SankeyNodeAlign,
  SankeyNodeDatum,
  SankeyNodeSort,
  SankeyOrientation,
  SankeyTooltipModel,
  SankeyTooltipRow,
} from './sankey-chart.types'

export interface SankeyChartSchema extends MachineSchema {
  props: ChartCommonProps & {
    /** 节点：身份、名字与分组；缺省按流带里出现的先后推断，没有名字与分组。 */
    nodes?: readonly SankeyNodeDatum[]
    /** 流带：源、目标与流量。成环、自环、负值与不存在的节点都报错。 */
    links?: readonly SankeyLinkDatum[]
    /** 流向，缺省 horizontal。 */
    orientation?: SankeyOrientation
    /** 节点分列的方式，缺省 justify。 */
    nodeAlign?: SankeyNodeAlign
    /** 流带的颜色，缺省 neutral。 */
    linkColor?: SankeyLinkColor
    /** 列内次序，缺省 auto。 */
    nodeSort?: SankeyNodeSort
    /** 数值格式：提示框、可及名与数据表共用。 */
    format?: NumberFormatSpec | ((value: number) => string)
    translations?: Partial<SankeyChartTranslations>
  }
  context: ChartBaseContext
  computed: ChartBaseComputed
  refs: ChartBaseRefs & {
    /** 管线：按输入引用分段记忆，悬停与聚焦不会让它重算。 */
    pipeline: SankeyPipeline
  }
  state: 'idle'
  event: ChartBaseEvent
  tag: never
  guard: never
  action: ChartBaseAction | 'notifyActive' | 'reportIssues'
  effect: 'trackViewport'
}

export interface SankeyOverlay {
  /** 画在节点之上：焦点环。 */
  readonly over: readonly Mark[]
}

export interface SankeyChartApi<T extends PropTypes = PropTypes> {
  /** 管线产物：图、布局、场景与无障碍模型。 */
  model: SankeyModel
  /** 要画的场景；尚未测量时为空场景。 */
  scene: Scene
  /** 前景层：焦点环。 */
  overlay: SankeyOverlay
  /** 视口尚未测量（服务端与首帧）。 */
  measured: boolean
  /** 没有可画的流带。 */
  empty: boolean
  legendItems: readonly SankeyLegendItem[]
  /** linkColor="gradient" 时每条流带一个渐变；其余时候为空。 */
  gradients: readonly SankeyGradient[]
  /** 激活的节点或流带；没有时为 null。 */
  active: ChartDatumDetails | null
  /** 提示框内容；收起时为 null。 */
  tooltip: SankeyTooltipModel | null
  summary: string
  /** 数据表模型：每条流带一行，源、目标与流量三列。 */
  table: TableModel
  emptyText: string
  tableCaption: string
  activeKey: ChartKey | null
  hiddenSeries: string[]
  /** 切换某个分组的显隐。 */
  toggleSeries: (id: string) => void
  /** 移动键盘锚点：只改锚点，不移动 DOM 焦点，也不派发回调。 */
  setFocusedDatum: (ref: { seriesId: string, index: number } | null) => void
  markTag: (mark: Mark) => SankeyMarkTag
  getRootProps: () => T['element']
  getCaptionProps: () => T['element']
  getLegendProps: () => T['element']
  getLegendItemProps: (item: SankeyLegendItem) => T['button']
  getLegendSwatchProps: (item: SankeyLegendItem) => T['element']
  getLegendLabelProps: (item: SankeyLegendItem) => T['element']
  getViewportProps: () => T['element']
  getPlotProps: () => T['element']
  /** 绘图区的第一个子节点：流带渐变定义在这里。 */
  getDefsProps: () => T['element']
  getGradientProps: (gradient: SankeyGradient) => T['element']
  getGradientStopProps: (gradient: SankeyGradient, at: 'from' | 'to') => T['element']
  getMarkProps: (mark: Mark) => T['element']
  getTooltipProps: () => T['element']
  getTooltipHeaderProps: () => T['element']
  getTooltipRowProps: (row: SankeyTooltipRow) => T['element']
  getTooltipSwatchProps: (row: SankeyTooltipRow) => T['element']
  getTooltipValueProps: (row: SankeyTooltipRow) => T['element']
  getTooltipNameProps: (row: SankeyTooltipRow) => T['element']
  getEmptyProps: () => T['element']
  getSummaryProps: () => T['element']
  getTableProps: () => T['element']
}
