/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 pie chart 状态机与连接层契约，和不依赖实现的公开类型分开，避免类型环。

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
import type { PieModel, PiePipeline } from './pie-chart.model'
import type {
  PieChartTranslations,
  PieLabelContent,
  PieLabelDetails,
  PieLabels,
  PieLegendItem,
  PieMarkTag,
  PieSort,
  PieSweep,
  PieTooltipModel,
  PieTooltipRow,
  PieVariant,
} from './pie-chart.types'

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
    /**
     * 扇区标签写什么：取一种内建写法，或给一个函数自己拼（返回空串的扇区不写）。
     * 缺省外侧写名字加占比、内侧只写占比。
     */
    labelContent?: PieLabelContent | ((details: PieLabelDetails) => string)
    /** 数值格式：提示框、标签、中心合计与数据表共用。 */
    format?: NumberFormatSpec | ((value: number) => string)
    translations?: Partial<PieChartTranslations>
  }
  context: ChartBaseContext
  computed: ChartBaseComputed
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

export interface PieOverlay {
  /** 画在扇区之上：焦点环。 */
  readonly over: readonly Mark[]
}

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
  /** 各扇区的纹理：画在绘图区的 defs 里，强制色、打印与环境开启纹理时扇区用它填充；「其他」没有纹理。 */
  patterns: readonly ChartPattern[]
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
  /** 绘图区的第一个子节点：各扇区的纹理定义在这里。 */
  getDefsProps: () => T['element']
  getPatternProps: (pattern: ChartPattern) => T['element']
  getPatternLineProps: (pattern: ChartPattern) => T['element']
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
