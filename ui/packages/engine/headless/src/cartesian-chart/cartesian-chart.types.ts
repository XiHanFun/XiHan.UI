/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 cartesian chart 类型契约。

import type { MachineSchema, PropTypes, Tone } from '@xihan-ui/core'
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
  ChartRow,
  ChartSummary,
  ChartTranslations,
} from '../shared/chart'
import type { CartesianOverlay } from './cartesian-chart.logic'
import type { CartesianModel, CartesianPipeline } from './cartesian-chart.model'

/** 朝向：vertical 自变量横排（柱状图），horizontal 即转置，自变量竖排（条形图）。 */
export type CartesianOrientation = 'vertical' | 'horizontal'

/** 提示框汇报什么：axis 同一个键上的全部系列，item 只报指针命中的那一个。 */
export type CartesianTrigger = 'axis' | 'item'

/** 坐标轴的比例尺；缺省按数据类型与系列推断。 */
export type CartesianScaleKind = 'band' | 'point' | 'linear' | 'log' | 'time' | 'utc'

/** 折线的插值：linear 折线，monotone 单调平滑（不越过数据点），step 系列为阶梯。 */
export type CartesianCurve = 'linear' | 'monotone' | 'step' | 'step-before' | 'step-after'

/** 横轴标签放不下时怎么办：auto 先转斜再隔显，rotate 只旋转，truncate 截断，wrap 折成两行。 */
export type CartesianLabelOverflow = 'auto' | 'rotate' | 'truncate' | 'wrap'

/**
 * 坐标轴刻度与提示框里数值的格式：数值轴给数字格式（紧凑记数、百分比、货币……），
 * 时间轴给 Intl 日期格式，或者直接给一个函数。
 */
export type CartesianAxisFormat = NumberFormatSpec | Intl.DateTimeFormatOptions | ((value: unknown) => string)

export interface CartesianSeriesBase {
  /** 系列 id，缺省取 y 的字段名；图例显隐、hiddenSeries 与部件上的 data-series-id 都用它。 */
  id?: string
  /** 图例与提示框里的名字，缺省同 id。 */
  name?: string
  /** 固定色槽 1–8：同一业务实体在不同图表里保持同色。 */
  slot?: number
  /** 语义系列：颜色本身带好坏含义时写语气，改用语气色；同一张图不混用分类色与语气色。 */
  tone?: Tone
}

/** 柱系列。 */
export interface CartesianBarSeries extends CartesianSeriesBase {
  mark: 'bar'
  /** 自变量字段。 */
  x: string
  /** 数值字段。 */
  y: string
  /** 同名的柱系列堆叠在一起。 */
  stack?: string
  /** 堆叠方式：none 逐段累加，expand 每列归一成百分比，diverging 正值向上、负值向下；同一堆叠组须一致。含负值时缺省 diverging。 */
  stackOffset?: 'none' | 'expand' | 'diverging'
  /**
   * 数据标签：inside 写在柱内居中，end 写在柱的远端外侧（负值翻到另一侧；堆叠中的段写在段内的远端）。
   * 放不下、与更要紧的标签重叠时不写。缺省 none。
   */
  labels?: 'none' | 'inside' | 'end'
}

/** 折线系列。 */
export interface CartesianLineSeries extends CartesianSeriesBase {
  mark: 'line'
  x: string
  y: string
  /** 插值，缺省 linear。 */
  curve?: CartesianCurve
  /** 画面积：折线下铺一层系列色淡洗。 */
  area?: boolean
  /** 同名的折线系列堆叠（堆叠面积）。 */
  stack?: string
  /** 堆叠方式：none 逐段累加，expand 每列归一成百分比。 */
  stackOffset?: 'none' | 'expand'
  /** 数据点：auto 点间距足够时显示，always 始终显示，none 不显示。缺省 auto。 */
  symbols?: 'auto' | 'always' | 'none'
  /** 缺失值处连上而不断开，缺省 false。 */
  connectNulls?: boolean
  /** 数据标签：end 把数值写在每个点的上方（横向时在右侧）。与更要紧的标签重叠时不写。缺省 none。 */
  labels?: 'none' | 'end'
  /** 线尾标签：在折线末端写系列名与末值，几条线挤在一起时上下推开；系列不多时可以代替图例。缺省 false。 */
  endLabel?: boolean
}

export type CartesianSeries = CartesianBarSeries | CartesianLineSeries

/** 一根坐标轴的配置。x 是自变量轴，y 是数值轴，与屏幕方向无关（orientation 决定画在哪边）。 */
export interface CartesianAxis {
  /** 比例尺；缺省按数据推断：含柱或非数值的自变量为 band，日期为 time，数值为 linear。 */
  scale?: CartesianScaleKind
  /** 类目轴的显式顺序。 */
  domain?: readonly (string | number)[]
  min?: number | Date
  max?: number | Date
  /** 两端取整到刻度上，数值轴缺省 true。 */
  nice?: boolean
  /** 数值轴包含 0；有柱系列时强制包含。 */
  zero?: boolean
  /** 刻度数量提示，或显式的刻度值。 */
  ticks?: number | readonly unknown[]
  format?: CartesianAxisFormat
  /** 轴标题。 */
  title?: string
  /** 画网格线；缺省数值轴画、类目轴不画。 */
  grid?: boolean
  labelOverflow?: CartesianLabelOverflow
  /** 反向。 */
  reverse?: boolean
}

/** 图例里的一项。 */
export interface CartesianLegendItem {
  readonly id: string
  readonly name: string
  readonly slot: number | null
  readonly tone: Tone | null
  readonly mark: 'bar' | 'line'
  /** 有面积的折线：图例色标画成方块。 */
  readonly area: boolean
  readonly hidden: boolean
}

/** 提示框里的一行：色标、数值、系列名。 */
export interface CartesianTooltipRow {
  readonly seriesId: string
  readonly name: string
  readonly value: string
  readonly slot: number | null
  readonly tone: Tone | null
  readonly mark: 'bar' | 'line'
  readonly area: boolean
}

/** 提示框的内容：头部是自变量的格式化值，每个系列一行。 */
export interface CartesianTooltipModel {
  readonly header: string
  readonly rows: readonly CartesianTooltipRow[]
}

export interface CartesianChartTranslations extends ChartTranslations {
  /** 数据表第一列的列名，缺省取 x 轴标题。 */
  keyLabel: string
  /** 摘要模板。 */
  summary: (model: ChartSummary) => string
}

export interface CartesianChartSchema extends MachineSchema {
  props: ChartCommonProps & {
    /** 数据：对象数组，系列用字段名把列映射到通道。 */
    data?: readonly ChartRow[]
    series?: readonly CartesianSeries[]
    xAxis?: CartesianAxis
    yAxis?: CartesianAxis
    /** 朝向，缺省 vertical。 */
    orientation?: CartesianOrientation
    /** 提示框汇报什么；缺省含柱或折线时 axis。 */
    trigger?: CartesianTrigger
    /** 堆叠柱的合计：每个堆叠组在最外端写出合计，含负值时正负两端各写一个；百分比堆叠不写。缺省 false。 */
    totals?: boolean
    translations?: Partial<CartesianChartTranslations>
  }
  context: ChartBaseContext
  computed: ChartBaseComputed
  refs: ChartBaseRefs & {
    /** 管线：按输入引用分段记忆，悬停与聚焦不会让它重算。 */
    pipeline: CartesianPipeline
  }
  state: 'idle'
  event: ChartBaseEvent
  tag: never
  guard: never
  action: ChartBaseAction | 'notifyActive' | 'reportIssues'
  effect: 'trackViewport'
}

/** 场景里的一个标记在 DOM 里画成什么元素。 */
export type CartesianMarkTag = 'g' | 'path' | 'text'

export interface CartesianChartApi<T extends PropTypes = PropTypes> {
  /** 管线产物：比例尺、布局、场景与无障碍模型。 */
  model: CartesianModel
  /** 要画的场景；尚未测量时为空场景。 */
  scene: Scene
  /**
   * 前景层：随激活与聚焦变化的标记。绘图区按 back → under → data → over 的次序画：
   * 十字准线与类目带淡底在数据之下，激活的点与焦点环在数据之上。
   */
  overlay: CartesianOverlay
  /** 视口尚未测量（服务端与首帧）：绘图区只输出空的 svg。 */
  measured: boolean
  /** 没有可画的数据：空态部件据此显示。 */
  empty: boolean
  legendItems: readonly CartesianLegendItem[]
  /** 激活的数据；没有时为 null。 */
  active: ChartDatumDetails | null
  /** 提示框内容；收起时为 null。 */
  tooltip: CartesianTooltipModel | null
  /** 摘要文字。 */
  summary: string
  /** 数据表模型：视觉隐藏的数据表用它，也可以喂给 Table 组件做可见的表格视图。 */
  table: TableModel
  /** 空态文字。 */
  emptyText: string
  /** 数据表的标题。 */
  tableCaption: string
  /** 激活的自变量键。 */
  activeKey: ChartKey | null
  hiddenSeries: string[]
  /** 切换某个系列的显隐。 */
  toggleSeries: (id: string) => void
  /**
   * 移动键盘锚点。只改锚点不移动 DOM 焦点，也不派发回调；
   * 需要焦点跟随时自行调用元素的 focus()。
   */
  setFocusedDatum: (ref: { seriesId: string, index: number } | null) => void
  /** 标记画成什么元素。 */
  markTag: (mark: Mark) => CartesianMarkTag
  getRootProps: () => T['element']
  getCaptionProps: () => T['element']
  getLegendProps: () => T['element']
  getLegendItemProps: (item: CartesianLegendItem) => T['button']
  getLegendSwatchProps: (item: CartesianLegendItem) => T['element']
  getLegendLabelProps: (item: CartesianLegendItem) => T['element']
  getViewportProps: () => T['element']
  getPlotProps: () => T['element']
  /** 场景里一个标记的属性（含 path 的 d、文字的坐标）。 */
  getMarkProps: (mark: Mark) => T['element']
  getTooltipProps: () => T['element']
  getTooltipHeaderProps: () => T['element']
  getTooltipRowProps: (row: CartesianTooltipRow) => T['element']
  getTooltipSwatchProps: (row: CartesianTooltipRow) => T['element']
  getTooltipValueProps: (row: CartesianTooltipRow) => T['element']
  getTooltipNameProps: (row: CartesianTooltipRow) => T['element']
  getEmptyProps: () => T['element']
  getSummaryProps: () => T['element']
  getTableProps: () => T['element']
}
