/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 cartesian chart 类型契约。

import type { Tone } from '@xihan-ui/core'
import type { AxisWindow, NumberFormatSpec, SymbolName } from '@xihan-ui/viz'
import type {
  ChartDatumDetails,
  ChartKey,
  ChartSummary,
  ChartTranslations,
} from '../shared/chart'

/** 朝向：vertical 自变量横排（柱状图），horizontal 即转置，自变量竖排（条形图）。 */
export type CartesianOrientation = 'vertical' | 'horizontal'

/** 提示框汇报什么：axis 同一个键上的全部系列，item 只报指针命中的那一个。 */
export type CartesianTrigger = 'axis' | 'item'

/**
 * 数据层画在哪：svg 每个标记一个节点；canvas 画在画布上（坐标轴、网格、注释、焦点代理与无障碍 DOM 仍是 SVG / DOM）；
 * auto 在数据层逐个成节点的标记（柱、点、K 线、箱线……，折线与面积按一条路径计）超过节点预算时改用画布。
 */
export type CartesianRenderer = 'svg' | 'canvas' | 'auto'

/** 提示框里各系列的行序：series 按图例次序，descending / ascending 按数值由大到小 / 由小到大。 */
export type CartesianTooltipOrder = 'series' | 'descending' | 'ascending'

/**
 * 坐标轴的比例尺；缺省按数据类型与系列推断。
 * 连续数值轴除线性与对数外还有 sqrt（平方根，面积感的量）、pow（幂，指数由 exponent 给）
 * 与 symlog（对称对数：跨越正负、含 0 的长尾数据）。
 */
export type CartesianScaleKind = 'band' | 'point' | 'linear' | 'log' | 'sqrt' | 'pow' | 'symlog' | 'time' | 'utc'

/** 连续数值轴的比例尺。 */
export type CartesianContinuousScaleKind = 'linear' | 'log' | 'sqrt' | 'pow' | 'symlog'

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
  /**
   * 数值字段。写成二元组 [下, 上] 是区间：柱从下端画到上端浮着（浮动柱，数值轴不强制含 0），
   * 棒棒糖形态时两头各一个点（哑铃）；提示框、可及名与数据表写成「下 – 上」。区间不参与堆叠。
   */
  y: string | readonly [string, string]
  /** 形态：bar 实心柱（缺省），lollipop 一根细杆顶一个点，类目多、柱挤在一起时更轻。 */
  shape?: 'bar' | 'lollipop'
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
  /** 数值字段。写成二元组 [下, 上] 是区间带（置信区间、正常范围）：只铺带、不画线，提示框写成「下 – 上」。 */
  y: string | readonly [string, string]
  /** 插值，缺省 linear。 */
  curve?: CartesianCurve
  /** 画面积：折线下铺一层系列色淡洗。 */
  area?: boolean
  /** 同名的折线系列堆叠（堆叠面积）。 */
  stack?: string
  /**
   * 堆叠方式：none 逐段累加，expand 每列归一成百分比，silhouette 以 0 为中线上下对称，
   * wiggle 让各层的摆动最小（流图，层按峰值出现的先后由内向外排）。同一堆叠组须一致。
   */
  stackOffset?: 'none' | 'expand' | 'silhouette' | 'wiggle'
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

/** 缩放的方向：x 沿自变量轴，y 沿数值轴。 */
export type CartesianZoom = 'none' | 'x' | 'y' | 'xy'

/**
 * 缩放窗口：两根轴各露出的一段，写定义域里的值。x 在类目轴上是首尾两个类目（含两端），在连续轴上是两端的值
 * （时间轴写 Date）；y 是数值轴的 [下, 上]。不写或写 null 是整条轴。多张图接到同一份窗口上即可联动。
 */
export interface CartesianWindow {
  readonly x?: readonly [ChartKey, ChartKey] | null
  readonly y?: readonly [number, number] | null
}

/** 两根轴的窗口换成整条轴上的比例 0–1：缩放条、手势与键盘都在比例上算。 */
export interface CartesianWindowRatio {
  readonly x: AxisWindow
  readonly y: AxisWindow
}

/** 缩放窗口变化时报告的内容。 */
export interface CartesianWindowChangeDetails {
  readonly window: CartesianWindow
}

/**
 * 一次拖动的起点：plot 在绘图区里平移（放大之后），start / end 拖缩放条的一端，window 拖缩放条的整个窗口。
 * from 是起点坐标（绘图区平移是绘图区里的像素，缩放条是轨道上的比例），size 是轨道或绘图区沿拖动方向的像素长度。
 */
export interface CartesianDrag {
  readonly target: 'plot' | 'start' | 'end' | 'window'
  readonly pointerId: number
  readonly from: { readonly x: number, readonly y: number }
  readonly size: { readonly x: number, readonly y: number }
  /** 按下时的窗口（比例）。 */
  readonly window: CartesianWindowRatio
}

/** 刷选的方向：x 沿自变量轴框一段，y 沿数值轴框一段，xy 框一个矩形。 */
export type CartesianBrush = 'none' | 'x' | 'y' | 'xy'

/** 刷选的范围：写法与缩放窗口相同，没刷的方向为 null（整条轴）。 */
export type CartesianBrushSelection = CartesianWindow

/** 刷选的范围变化时报告的内容：新范围（清掉为 null）与落在范围里的可见数据。 */
export interface CartesianBrushSelectionChangeDetails {
  readonly selection: CartesianBrushSelection | null
  /** 落在范围里的数据：按图例次序、再按自变量排；锚点（柱顶、点、线上的点、K 线的收盘）落在框里即算。 */
  readonly data: readonly ChartDatumDetails[]
}

/** 正在拖出的刷选框：按下与当前的指针位置（绘图区里的像素）。 */
export interface CartesianBrushing {
  readonly pointerId: number
  readonly from: { readonly x: number, readonly y: number }
  readonly to: { readonly x: number, readonly y: number }
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
  /** pow 轴的指数，正的有限数，缺省 1。 */
  exponent?: number
  /** symlog 轴 `sign(x) · log1p(|x| / c)` 里的 c，正数，缺省 1。越小越靠近对数，越大越靠近线性。 */
  constant?: number
  /**
   * 时间轴按哪个时区（IANA 名，如 `Asia/Shanghai`）排刻度、写标签：整点、整天、月初都落在这个时区的墙上时间上，
   * 提示框与数据表里的日期同样按它写。缺省 time 轴按运行环境所在时区、utc 轴按 UTC。
   */
  timeZone?: string
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
  /** 缩放条的可及名。 */
  zoomLabel: string
  /** 缩放条两端手柄的可及名。 */
  zoomStartLabel: string
  zoomEndLabel: string
  /** 箱线数据表的列名：五数与离群点。 */
  boxColumns: { min: string, q1: string, median: string, q3: string, max: string, outliers: string }
  /** 摘要末尾写注释的模板：参考线、参考带与平均线逐条写出名字与值。 */
  annotationSummary: (items: readonly CartesianAnnotationSummary[]) => string
  /** 摘要模板。 */
  summary: (model: ChartSummary) => string
}

/** 场景里的一个标记在 DOM 里画成什么元素。 */
export type CartesianMarkTag = 'g' | 'path' | 'text'
