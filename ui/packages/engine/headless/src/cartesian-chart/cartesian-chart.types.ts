/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 cartesian chart 类型契约。

import type { MachineSchema, PropTypes, Tone } from '@xihan-ui/core'
import type { Mark, NumberFormatSpec, Scene, SymbolName, TableModel } from '@xihan-ui/viz'
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
  ChartPattern,
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

/** 提示框里各系列的行序：series 按图例次序，descending / ascending 按数值由大到小 / 由小到大。 */
export type CartesianTooltipOrder = 'series' | 'descending' | 'ascending'

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
  /**
   * 自变量字段。写成二元组 [起, 止] 是分箱区间（直方图）：柱按区间的真实宽度画，自变量轴是数值轴，
   * 相邻两箱之间留一道表面间隙；提示框、可及名与数据表把键写成「起 – 止」。
   */
  x: string | readonly [string, string]
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
  /**
   * 瀑布：每一步接在上一步的累计值上，涨取涨色、跌取跌色；total 字段为真的行是小计，从 0 画到当前累计值，
   * 它的 y 被忽略。相邻两步之间连一道细线。瀑布不参与堆叠。
   */
  waterfall?: { total?: string }
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

/** 散点系列：每行一个点，看两个量的分布与相关；给 size 即气泡。 */
export interface CartesianScatterSeries extends CartesianSeriesBase {
  mark: 'scatter'
  x: string
  y: string
  /** 气泡：按面积映射这个字段（半径取平方根），全部散点系列共用一把尺；缺失、负值或 0 的行不画。 */
  size?: string
  /** 点的形状；缺省按色槽依次取圆、方、菱形、三角……颜色之外再多一道身份。 */
  symbol?: SymbolName
  /** 类目轴上的横向抖动：类目步长的比例 0–1。以数据身份为种子，重渲染不跳；数据会换序时给 datumId，同一个点才落在同一处。缺省 0。 */
  jitter?: number
  /** 数据身份字段：过渡里同一个点从旧位置滑到新位置、抖动的种子都取它；缺省按 x 与同一 x 上的出现次序。 */
  datumId?: string
  /**
   * 按值着色：点的颜色取这个字段在顺序色阶上的位置，全部按值着色的系列共用一把尺，图例里多一条色阶。
   * 写了它，这个系列不再取分类色（形状照旧随色槽）；这个字段缺失的点取色阶中点。
   */
  color?: string
}

/** K 线系列：每个键一根，开高低收四个字段；收盘不低于开盘为涨、低于开盘为跌，取涨跌色。 */
export interface CartesianCandlestickSeries extends CartesianSeriesBase {
  mark: 'candlestick'
  x: string
  open: string
  high: string
  low: string
  close: string
  /** candle 蜡烛（实体加影线，缺省），ohlc 美国线（竖线加左开右收两道短横）。 */
  style?: 'candle' | 'ohlc'
}

/** 箱线图算好的五数字段：每个键一行。 */
export interface CartesianBoxplotFields {
  min: string
  q1: string
  median: string
  q3: string
  max: string
}

/**
 * 箱线系列：y 写成字段名时，同一个 x 上的全部行是一组原始值，按 R-7 求四分位，须线到 1.5 倍四分距以内最远的点，
 * 其外为离群点；写成五数字段时每个键一行、直接用算好的统计量（没有离群点）。style: 'violin' 用核密度画出分布的轮廓，
 * 要原始值。
 */
export interface CartesianBoxplotSeries extends CartesianSeriesBase {
  mark: 'boxplot'
  x: string
  y: string | CartesianBoxplotFields
  /** box 箱线（缺省），violin 小提琴。 */
  style?: 'box' | 'violin'
  /** 画离群点，缺省 true；false 时须线直达最小与最大值。 */
  outliers?: boolean
}

export type CartesianSeries = CartesianBarSeries | CartesianLineSeries | CartesianScatterSeries | CartesianCandlestickSeries | CartesianBoxplotSeries

/**
 * 注释：画在数据之外、帮读者读数的参照。axis 是 x（自变量轴）或 y（数值轴），与屏幕方向无关；
 * 参考线与参考带的值计入该轴的定义域，数据范围之外的目标值也看得到。标签缺省写值。
 */
export type CartesianAnnotation
  = | {
    /** 参考线：目标、阈值、上一期的水平。 */
    kind: 'line'
    axis: 'x' | 'y'
    value: number | string | Date
    label?: string
  }
  | {
    /** 参考带：正常区间、促销期、夜间。 */
    kind: 'band'
    axis: 'x' | 'y'
    from: number | string | Date
    to: number | string | Date
    label?: string
  }
  | {
    /** 标出某个系列上的一个数据：最大、最小、最后一个，或指定 x 上的那个。 */
    kind: 'point'
    series: string
    at: 'max' | 'min' | 'last' | { x: number | string | Date }
    label?: string
  }
  | {
    /** 平均线：系列在可见数据上的均值。 */
    kind: 'average'
    series: string
    label?: string
  }
  | {
    /** 趋势线：最小二乘直线，或尾随窗口的移动平均（缺省 3 个位置）。 */
    kind: 'trend'
    series: string
    method: 'linear' | 'moving-average'
    window?: number
    label?: string
  }

/** 摘要里的一条注释：名字、所属系列（参考线与参考带为 null）与已写成文字的值。 */
export interface CartesianAnnotationSummary {
  readonly kind: 'line' | 'band' | 'average'
  readonly label: string
  readonly series: string | null
  readonly value: string
}

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
  readonly mark: 'bar' | 'line' | 'scatter' | 'candlestick' | 'boxplot'
  /** 有面积的折线：图例色标画成方块。 */
  readonly area: boolean
  /** 散点的形状：色标画成同一个形状；其余系列为 null。 */
  readonly symbol: SymbolName | null
  /** 按值着色的系列：色标取色阶中点。 */
  readonly sequential: boolean
  readonly hidden: boolean
}

/** 按值着色时图例里的色阶：名字与两端的值（已按格式写成文字）。 */
export interface CartesianLegendScale {
  readonly name: string
  readonly min: string
  readonly max: string
}

/** 提示框里的一行：色标、数值、系列名。 */
export interface CartesianTooltipRow {
  readonly seriesId: string
  readonly name: string
  readonly value: string
  readonly slot: number | null
  readonly tone: Tone | null
  readonly mark: 'bar' | 'line' | 'scatter' | 'candlestick' | 'boxplot'
  readonly area: boolean
  readonly symbol: SymbolName | null
  /** 按值着色的数据在色阶上的位置 0–1：色标画成它自己的颜色；其余为 null。 */
  readonly t: number | null
}

/** 提示框的内容：头部是自变量的格式化值，每个系列一行。 */
export interface CartesianTooltipModel {
  readonly header: string
  readonly rows: readonly CartesianTooltipRow[]
}

export interface CartesianChartTranslations extends ChartTranslations {
  /** 数据表第一列的列名，缺省取 x 轴标题。 */
  keyLabel: string
  /** 含散点时数据表改为每个数据一行：系列列的列名。 */
  seriesLabel: string
  /** 含散点时数据表数值列的列名，缺省取 y 轴标题。 */
  valueLabel: string
  /** 气泡大小在数据表、提示框与可及名里的名字。 */
  sizeLabel: string
  /** 按值着色的那个量在色阶图例、数据表、提示框与可及名里的名字。 */
  colorLabel: string
  /** 没写标签的参考线与参考带在摘要里的名字。 */
  referenceLabel: string
  /** 平均线的名字：缺省标签写「名字 均值」，摘要里写「名字（系列）：均值」。 */
  averageLabel: string
  /** K 线的开高低收在提示框、可及名与数据表里的写法（值已按数值轴的格式写好）。 */
  ohlcLabel: (values: { open: string, high: string, low: string, close: string }) => string
  /** K 线数据表四列的列名。 */
  ohlcColumns: { open: string, high: string, low: string, close: string }
  /** 箱线的五数在提示框与可及名里的写法（值已按数值轴的格式写好）。 */
  boxLabel: (values: { min: string, q1: string, median: string, q3: string, max: string }) => string
  /** 箱线数据表的列名：五数与离群点。 */
  boxColumns: { min: string, q1: string, median: string, q3: string, max: string, outliers: string }
  /** 摘要末尾写注释的模板：参考线、参考带与平均线逐条写出名字与值。 */
  annotationSummary: (items: readonly CartesianAnnotationSummary[]) => string
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
    /** 提示框汇报什么；缺省含柱或折线时 axis，只有散点时 item。 */
    trigger?: CartesianTrigger
    /** 堆叠柱的合计：每个堆叠组在最外端写出合计，含负值时正负两端各写一个；百分比堆叠不写。缺省 false。 */
    totals?: boolean
    /** 提示框里各系列的行序，缺省 series（按图例次序）；系列多、要一眼找到最大的时按数值排。 */
    tooltipOrder?: CartesianTooltipOrder
    /** 顺序色阶的色板：按值着色的点与色阶图例换到这个色相上；不写时取顺序色阶令牌。 */
    palette?: ChartPalette
    /** 注释：参考线、参考带、标出的数据、平均线与趋势线；只给眼睛看，摘要写出参考线、参考带与平均线。 */
    annotations?: readonly CartesianAnnotation[]
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
  /** 按值着色时图例里的色阶；没有按值着色的系列时为 null。 */
  legendScale: CartesianLegendScale | null
  /** 各系列的纹理：画在绘图区的 defs 里，强制色、打印与环境开启纹理时柱与面积用它填充。 */
  patterns: readonly ChartPattern[]
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
  /** 色阶图例：名字、低端的值、渐变条、高端的值依次排开，只给眼睛看。 */
  getLegendScaleProps: () => T['element']
  getLegendScaleNameProps: () => T['element']
  getLegendScaleBarProps: () => T['element']
  getLegendScaleValueProps: (edge: 'min' | 'max') => T['element']
  getViewportProps: () => T['element']
  getPlotProps: () => T['element']
  /** 绘图区的第一个子节点：各系列的纹理定义在这里。 */
  getDefsProps: () => T['element']
  getPatternProps: (pattern: ChartPattern) => T['element']
  getPatternLineProps: (pattern: ChartPattern) => T['element']
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
