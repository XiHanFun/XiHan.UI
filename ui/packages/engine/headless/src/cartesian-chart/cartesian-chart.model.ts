/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 直角坐标图的管线：规格归一 → 派生数据（隐藏系列、堆叠）→ 定义域 → 布局 → 场景 → 索引 → 无障碍。
// 每段只记住上一次的输入，悬停、聚焦与提示框开合不换任何一段的输入，整条管线走缓存。

import type { Tone } from '@xihan-ui/core'
import type {
  AxisLayout,
  AxisScale,
  AxisWindow,
  BandScale,
  ContinuousScale,
  CurveName,
  DensityPoint,
  FontSpec,
  KeyedPoint,
  LineMark,
  Mark,
  MarkPaint,
  NumberFormatSpec,
  PathMark,
  Rect,
  Scene,
  SymbolMark,
  SymbolName,
  TableModel,
  TextMark,
  TextMeasurer,
  TimeScale,
  WaterfallStep,
} from '@xihan-ui/viz'
import type { ChartKey, ChartLabelBox, ChartMetrics, ChartNumbers, ChartRow, ChartSize, ChartSpecIssue } from '../shared/chart'
import type {
  CartesianAnnotation,
  CartesianAnnotationSummary,
  CartesianAxis,
  CartesianAxisFormat,
  CartesianBarSeries,
  CartesianBoxplotFields,
  CartesianChartTranslations,
  CartesianCurve,
  CartesianLineSeries,
  CartesianOrientation,
  CartesianScaleKind,
  CartesianSeries,
  CartesianWindow,
  CartesianWindowRatio,
  CartesianZoom,
} from './cartesian-chart.types'
import { DIAGNOSTIC_CODES } from '@xihan-ui/core'
import {
  boxplotStats,
  buildTableModel,
  createNumberFormat,
  createScene,
  domainToWindow,
  FULL_WINDOW,
  indexRangeToWindow,
  inferDomain,
  isFullWindow,
  isVizError,
  jitter,
  kde,
  layoutAxis,
  linearRegression,
  lttb,
  movingAverage,
  needsSampling,
  scaleBand,
  scaleLinear,
  scaleLog,
  scalePoint,
  scaleTime,
  scaleUtc,
  solvePlotRect,
  stack,
  SYMBOL_NAMES,
  waterfall,
  windowToDomain,
} from '@xihan-ui/viz'
import { assignChartSeries, buildChartSummary, labelBox, memoizeLast, placeWithoutOverlap, settleColumn } from '../shared/chart'

/* ---------- 规格 ---------- */

/** 归一后的系列。 */
export interface CartesianSeriesSpec {
  readonly id: string
  readonly name: string
  readonly slot: number | null
  readonly tone: Tone | null
  /** 纹理序号：分类系列等于色槽，语义系列按声明次序。 */
  readonly pattern: number | null
  readonly mark: 'bar' | 'line' | 'scatter' | 'candlestick' | 'boxplot'
  /** 自变量字段；分箱的柱是区间的起点。 */
  readonly x: string
  /** 分箱的柱：区间止点的字段；不分箱为 null。 */
  readonly binEnd: string | null
  /** 数值字段：K 线是收盘。 */
  readonly y: string
  /** 箱线：原始值字段或算好的五数字段、画法与要不要离群点；不是箱线为 null。 */
  readonly box: { readonly raw: string | null, readonly stats: CartesianBoxplotFields | null, readonly style: 'box' | 'violin', readonly outliers: boolean } | null
  /** K 线：开高低收四个字段与画法；不是 K 线为 null。 */
  readonly ohlc: { readonly open: string, readonly high: string, readonly low: string, readonly close: string, readonly style: 'candle' | 'ohlc' } | null
  /** 散点：气泡大小的字段；不是气泡为 null。 */
  readonly size: string | null
  /** 散点的形状；其余系列为 null。 */
  readonly symbol: SymbolName | null
  /** 散点在类目轴上的抖动，类目步长的比例 0–1。 */
  readonly jitter: number
  /** 散点的数据身份字段；缺省为 null，按 x 与出现次序。 */
  readonly datumId: string | null
  /** 散点按值着色的字段；不按值着色为 null。 */
  readonly color: string | null
  /** 声明次序。 */
  readonly order: number
  /** 堆叠组；不堆叠为 null。 */
  readonly stack: string | null
  readonly stackOffset: 'none' | 'expand' | 'diverging' | 'silhouette' | 'wiggle'
  /** 区间：y 写成 [下, 上] 时下端的字段；不是区间为 null。 */
  readonly yLow: string | null
  /** 柱的形态：实心柱或棒棒糖。 */
  readonly shape: 'bar' | 'lollipop'
  readonly curve: CurveName
  readonly area: boolean
  readonly symbols: 'auto' | 'always' | 'none'
  readonly connectNulls: boolean
  /** 数据标签：柱可写 inside / end，折线只写 end。 */
  readonly labels: 'none' | 'inside' | 'end'
  /** 瀑布：小计字段（没有小计为 null）；不是瀑布为 null。 */
  readonly waterfall: { readonly total: string | null } | null
  /** 折线的线尾标签。 */
  readonly endLabel: boolean
}

export interface CartesianSpec {
  readonly rows: readonly ChartRow[]
  readonly series: readonly CartesianSeriesSpec[]
  readonly issues: readonly ChartSpecIssue[]
  readonly orientation: CartesianOrientation
  /** 自变量轴的比例尺。 */
  readonly keyScale: CartesianScaleKind
  /** 数值轴的比例尺。 */
  readonly valueScale: 'linear' | 'log'
  /** 自变量键，按轴上的次序。 */
  readonly keys: readonly ChartKey[]
  /** 键的身份串 → 在 keys 里的位置。 */
  readonly keyIndex: ReadonlyMap<string, number>
  readonly xAxis: CartesianAxis
  readonly yAxis: CartesianAxis
}

const CURVES: Record<CartesianCurve, CurveName> = {
  'linear': 'linear',
  'monotone': 'monotoneX',
  'step': 'step',
  'step-before': 'stepBefore',
  'step-after': 'stepAfter',
}

/** 键的身份串：日期按时间值，数字与字符串分开，避免 1 与 '1' 撞在一起。 */
export function cartesianKeyId(value: unknown): string | null {
  if (value instanceof Date)
    return Number.isNaN(value.valueOf()) ? null : `d${value.valueOf()}`
  if (typeof value === 'number')
    return Number.isFinite(value) ? `n${value}` : null
  if (typeof value === 'string')
    return `s${value}`
  return null
}

/** 定长数组，每格同一个初值；逐个 push 比预分配再填快，一万个键时差得明显。 */
function filled<T>(length: number, value: T): T[] {
  const out: T[] = []
  for (let i = 0; i < length; i++)
    out.push(value)
  return out
}

/** 数或日期写成数：日期取时间值；其余为 null。 */
function timeValue(value: unknown): number | null {
  if (value instanceof Date)
    return Number.isNaN(value.valueOf()) ? null : value.valueOf()
  return numberOf(value)
}

/** 缺失值：null、undefined、NaN 与非数都算缺失，不按 0 处理。 */
function numberOf(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/** 数值字段：系列 id 缺省取它，堆叠与负值判断都看它；K 线取收盘。 */
function valueFieldOf(s: CartesianSeries): string {
  if (s.mark === 'candlestick')
    return s.close
  if (s.mark === 'boxplot')
    return typeof s.y === 'string' ? s.y : s.y.median
  if (s.mark === 'scatter')
    return s.y
  return typeof s.y === 'string' ? s.y : s.y[1]
}

/** 区间的下端字段：柱与折线的 y 写成 [下, 上] 时取下端；不是区间为 null。 */
function lowFieldOf(s: CartesianSeries): string | null {
  return (s.mark === 'bar' || s.mark === 'line') && typeof s.y !== 'string' ? s.y[0] : null
}

/** 柱与折线能堆叠、写数据标签；散点与 K 线不能。 */
function stackable(s: CartesianSeries): s is CartesianBarSeries | CartesianLineSeries {
  return s.mark === 'bar' || s.mark === 'line'
}

/** 自变量字段：分箱的柱取区间的起点。 */
function xFieldOf(s: CartesianSeries): string {
  return typeof s.x === 'string' ? s.x : s.x[0]
}

/** 分箱的柱：区间的止点字段；不分箱为 null。 */
function binEndOf(s: CartesianSeries): string | null {
  return s.mark === 'bar' && typeof s.x !== 'string' ? s.x[1] : null
}

function inferKeyScale(rows: readonly ChartRow[], series: readonly CartesianSeries[], axis: CartesianAxis): CartesianScaleKind {
  if (axis.scale)
    return axis.scale
  // 分箱的柱落在数值轴上，按区间的真实宽度画；其余的柱、K 线与箱线是类目
  if (series.some(s => (s.mark === 'bar' && binEndOf(s) == null) || s.mark === 'candlestick' || s.mark === 'boxplot'))
    return 'band'
  let dates = 0
  let numbers = 0
  let others = 0
  for (const row of rows) {
    for (const s of series) {
      const value = row[xFieldOf(s)]
      if (value instanceof Date)
        dates += 1
      else if (typeof value === 'number')
        numbers += 1
      else if (value != null)
        others += 1
    }
  }
  if (others > 0 || dates + numbers === 0)
    return 'point'
  return dates > 0 && numbers === 0 ? 'time' : numbers > 0 && dates === 0 ? 'linear' : 'point'
}

export function normalizeCartesianSpec(
  data: readonly ChartRow[] | undefined,
  input: readonly CartesianSeries[] | undefined,
  xAxis: CartesianAxis | undefined,
  yAxis: CartesianAxis | undefined,
  orientation: CartesianOrientation | undefined,
): CartesianSpec {
  const rows = data ?? []
  const seriesInput = input ?? []
  const xa = xAxis ?? {}
  const ya = yAxis ?? {}
  const assignment = assignChartSeries(seriesInput.map(s => ({ id: s.id, field: valueFieldOf(s), name: s.name, slot: s.slot, tone: s.tone })))
  const issues: ChartSpecIssue[] = [...assignment.issues]

  // 字段在数据里一次都没出现，多半是拼错了：空数据不判，那时什么字段都「不存在」
  if (rows.length > 0) {
    for (const s of seriesInput) {
      const fields = s.mark === 'scatter'
        ? [s.x, s.y, s.size, s.datumId, s.color]
        : s.mark === 'bar'
          ? [xFieldOf(s), binEndOf(s), lowFieldOf(s), valueFieldOf(s), s.waterfall?.total]
          : s.mark === 'candlestick'
            ? [s.x, s.open, s.high, s.low, s.close]
            : s.mark === 'boxplot' ? [s.x, ...(typeof s.y === 'string' ? [s.y] : Object.values(s.y))] : [s.x, lowFieldOf(s), valueFieldOf(s)]
      for (const field of fields) {
        if (field == null)
          continue
        if (!rows.some(row => field in row))
          issues.push({ code: DIAGNOSTIC_CODES.chartUnknownField, message: `系列引用的字段「${field}」在数据里不存在`, detail: { field } })
      }
    }
  }

  // 小提琴要原始值才画得出密度：y 写成算好的五数字段时画不出来
  for (const s of seriesInput) {
    if (s.mark === 'boxplot' && s.style === 'violin' && typeof s.y !== 'string')
      issues.push({ code: DIAGNOSTIC_CODES.chartViolinRaw, message: '小提琴图要原始值：y 写成原始值的字段名', detail: { series: s.id ?? s.y.median } })
  }

  // 同一堆叠组的堆叠方式必须一致：柱与折线各自成组；散点不堆叠
  const offsets = new Map<string, Set<string>>()
  for (const s of seriesInput) {
    if (!stackable(s) || s.stack == null || s.stackOffset == null)
      continue
    const group = `${s.mark}:${s.stack}`
    const set = offsets.get(group) ?? new Set<string>()
    set.add(s.stackOffset)
    offsets.set(group, set)
  }
  for (const [group, set] of offsets) {
    if (set.size > 1)
      issues.push({ code: DIAGNOSTIC_CODES.chartStackOffsetConflict, message: `堆叠组「${group.slice(group.indexOf(':') + 1)}」的 stackOffset 不一致`, detail: { group, offsets: [...set] } })
  }

  // 柱的堆叠组里有负值时缺省 diverging：正负各自累加，互不抵消
  const hasNegative = (s: CartesianSeries): boolean => rows.some(row => (numberOf(row[valueFieldOf(s)]) ?? 0) < 0)
  const groupOffset = (s: CartesianSeries): CartesianSeriesSpec['stackOffset'] => {
    if (!stackable(s) || s.stack == null)
      return 'none'
    const members = seriesInput.filter((o): o is CartesianBarSeries | CartesianLineSeries => stackable(o) && o.mark === s.mark && o.stack === s.stack)
    const explicit = members.find(o => o.stackOffset != null)?.stackOffset
    if (explicit)
      return explicit
    return s.mark === 'bar' && members.some(hasNegative) ? 'diverging' : 'none'
  }

  const series = seriesInput.map((s, order): CartesianSeriesSpec => {
    const identity = assignment.series[order]!
    const scatter = s.mark === 'scatter' ? s : null
    return {
      id: identity.id,
      name: identity.name,
      slot: identity.slot,
      tone: identity.tone,
      pattern: identity.pattern,
      mark: s.mark,
      x: xFieldOf(s),
      binEnd: binEndOf(s),
      y: valueFieldOf(s),
      ohlc: s.mark === 'candlestick' ? { open: s.open, high: s.high, low: s.low, close: s.close, style: s.style ?? 'candle' } : null,
      box: s.mark === 'boxplot'
        ? { raw: typeof s.y === 'string' ? s.y : null, stats: typeof s.y === 'string' ? null : s.y, style: s.style ?? 'box', outliers: s.outliers !== false }
        : null,
      size: scatter?.size ?? null,
      // 缺省形状随色槽（语义系列随纹理序号）轮换：颜色分不清时形状还分得开
      // 棒棒糖的点是圆：图例与提示框的色标画成圆
      symbol: scatter
        ? scatter.symbol ?? SYMBOL_NAMES[((identity.slot ?? identity.pattern ?? 1) - 1) % SYMBOL_NAMES.length]!
        : s.mark === 'bar' && s.shape === 'lollipop' ? 'circle' : null,
      jitter: scatter ? Math.min(1, Math.max(0, Number.isFinite(scatter.jitter) ? scatter.jitter! : 0)) : 0,
      datumId: scatter?.datumId ?? null,
      color: scatter?.color ?? null,
      order,
      // 瀑布的每一步接在自己的累计值上，区间自己就有两端：都不参与堆叠
      stack: !stackable(s) || (s.mark === 'bar' && s.waterfall) || lowFieldOf(s) != null ? null : s.stack ?? null,
      waterfall: s.mark === 'bar' && s.waterfall ? { total: s.waterfall.total ?? null } : null,
      stackOffset: groupOffset(s),
      curve: s.mark === 'line' ? CURVES[s.curve ?? 'linear'] : 'linear',
      // 区间带只铺带：按面积画，定义域也盖住下端
      area: s.mark === 'line' && (s.area === true || lowFieldOf(s) != null),
      yLow: lowFieldOf(s),
      shape: s.mark === 'bar' ? s.shape ?? 'bar' : 'bar',
      symbols: s.mark === 'line' ? (s.symbols ?? 'auto') : 'none',
      connectNulls: s.mark === 'line' && s.connectNulls === true,
      labels: stackable(s) ? s.labels ?? 'none' : 'none',
      endLabel: s.mark === 'line' && s.endLabel === true,
    }
  })

  const keyScale = inferKeyScale(rows, seriesInput, xa)
  const keys: ChartKey[] = []
  const keyIndex = new Map<string, number>()
  const add = (value: ChartKey): void => {
    const id = cartesianKeyId(value)
    if (id == null || keyIndex.has(id))
      return
    keyIndex.set(id, keys.length)
    keys.push(value)
  }
  if ((keyScale === 'band' || keyScale === 'point') && xa.domain) {
    for (const value of xa.domain)
      add(value)
  }
  else {
    const seen: ChartKey[] = []
    for (const row of rows) {
      for (const s of seriesInput) {
        const value = row[xFieldOf(s)]
        if (value instanceof Date || typeof value === 'number' || typeof value === 'string')
          seen.push(value)
      }
    }
    // 连续轴按数值排序，类目轴保持首次出现的次序
    if (keyScale === 'linear' || keyScale === 'log' || keyScale === 'time' || keyScale === 'utc')
      seen.sort((a, b) => Number(a instanceof Date ? a.valueOf() : a) - Number(b instanceof Date ? b.valueOf() : b))
    for (const value of seen)
      add(value)
  }

  return {
    rows,
    series,
    issues,
    orientation: orientation ?? 'vertical',
    keyScale,
    valueScale: ya.scale === 'log' ? 'log' : 'linear',
    keys,
    keyIndex,
    xAxis: xa,
    yAxis: ya,
  }
}

/* ---------- 派生数据 ---------- */

/**
 * 一个系列的值与堆叠后的两端，数组按「位置」对齐：柱与折线每个键一个位置（即 keys 的位置），缺失为 null；
 * 散点每个点一个位置，按 x 在键序里的次序、同一 x 上按数据次序排。
 */
export interface CartesianSeriesValues {
  readonly spec: CartesianSeriesSpec
  /** 原始值。 */
  readonly values: readonly (number | null)[]
  /** 这个位置取自哪一行；没有时为 −1。 */
  readonly rows: readonly number[]
  /** 散点：位置 → 它的 x 在 keys 里的位置；柱与折线为 null（位置就是键的位置）。 */
  readonly keyAt: readonly number[] | null
  /** 散点：每个点的身份串，标记键与抖动的种子都取它；柱与折线为 null。 */
  readonly pointIds: readonly string[] | null
  /** 气泡的大小；不是气泡为 null。 */
  readonly sizes: readonly number[] | null
  /** 按值着色的值，缺失为 null；不按值着色为 null。 */
  readonly colors: readonly (number | null)[] | null
  /** 瀑布的每一步（与位置对齐）；不是瀑布为 null。 */
  readonly steps: readonly (WaterfallStep | null)[] | null
  /** 分箱的柱：每一箱区间的止点（日期取时间值）；不分箱为 null。 */
  readonly ends: readonly (number | null)[] | null
  /** K 线：每个键上的开高低收；不是 K 线为 null。 */
  readonly ohlc: readonly (CartesianOhlc | null)[] | null
  /** 箱线：每个键上的五数、离群点与小提琴的密度；不是箱线为 null。 */
  readonly boxes: readonly (CartesianBox | null)[] | null
  /** 区间：每个键上的下端（values 是上端）；不是区间为 null。 */
  readonly lows: readonly (number | null)[] | null
  /** 贴近基线的一端。 */
  readonly low: readonly (number | null)[]
  /** 值所在的一端。 */
  readonly high: readonly (number | null)[]
  /** 这一列朝该方向最外层的段（远离基线的一端做圆角）。 */
  readonly outermost: readonly boolean[]
}

export interface CartesianDerived {
  readonly spec: CartesianSpec
  /** 可见系列，按声明次序。 */
  readonly visible: readonly CartesianSeriesValues[]
  readonly issues: readonly ChartSpecIssue[]
  /** 数据引用（系列 id → 行号）→ 在系列里的位置；隐藏系列与没有值的行不在表里。 */
  readonly keyOfRow: ReadonlyMap<string, ReadonlyMap<number, number>>
}

/**
 * 散点的点：x 落在键序里、y 是数的行各一个点；气泡还要大小是正数。按 x 在键序里的次序排，同一 x 上按数据次序。
 * 身份缺省是「x 的身份串#同一 x 上的出现次序」：往后追加数据、改某个点的 y，已有的点都保持身份。
 */
function scatterPoints(spec: CartesianSpec, s: CartesianSeriesSpec): Omit<CartesianSeriesValues, 'low' | 'high' | 'outermost'> {
  const points: { row: number, at: number, value: number, size: number, color: number | null, id: string }[] = []
  const seen = new Map<number, number>()
  const ids = new Set<string>()
  spec.rows.forEach((row, index) => {
    const key = cartesianKeyId(row[s.x])
    const at = key == null ? undefined : spec.keyIndex.get(key)
    if (at === undefined)
      return
    // 出现次序按 x 合法的每一行数：某行的 y 由缺失变成有值时，别的点不换身份
    const occurrence = seen.get(at) ?? 0
    seen.set(at, occurrence + 1)
    const value = numberOf(row[s.y])
    const size = s.size == null ? 1 : numberOf(row[s.size])
    if (value == null || size == null || size <= 0)
      return
    const own = s.datumId == null ? null : cartesianKeyId(row[s.datumId])
    let id = own ?? `${key}#${occurrence}`
    // 作者给的身份撞了：后来的那个加上行号，标记键不能重
    if (ids.has(id))
      id = `${id}#${index}`
    ids.add(id)
    points.push({ row: index, at, value, size, color: s.color == null ? null : numberOf(row[s.color]), id })
  })
  points.sort((a, b) => a.at - b.at || a.row - b.row)
  return {
    spec: s,
    values: points.map(p => p.value),
    rows: points.map(p => p.row),
    keyAt: points.map(p => p.at),
    pointIds: points.map(p => p.id),
    sizes: s.size == null ? null : points.map(p => p.size),
    colors: s.color == null ? null : points.map(p => p.color),
    steps: null,
    ends: null,
    ohlc: null,
    boxes: null,
    lows: null,
  }
}

/** 箱线一个键上的统计：须线两端、四分位与中位数、须线外的离群点、小提琴的密度轮廓。 */
export interface CartesianBox {
  readonly min: number
  readonly q1: number
  readonly median: number
  readonly q3: number
  readonly max: number
  readonly outliers: readonly number[]
  /** 小提琴的密度：在最小到最大值之间均匀取样；箱线为 null。 */
  readonly density: readonly DensityPoint[] | null
}

/** 小提琴轮廓的取样点数。 */
const VIOLIN_SAMPLES = 32

/**
 * 箱线：原始值按 x 分组求五数（R-7 四分位，须线到 1.5 倍四分距以内最远的点，其外为离群点；不要离群点时须线直达两端），
 * 小提琴另求核密度；算好的五数每个键取第一行，五个数须依次不减，否则报 chart.invalid-range。数值是中位数。
 */
function boxplotValues(spec: CartesianSpec, s: CartesianSeriesSpec, issues: ChartSpecIssue[]): Omit<CartesianSeriesValues, 'low' | 'high' | 'outermost'> {
  const n = spec.keys.length
  const box = s.box!
  const rows = filled(n, -1)
  const groups = Array.from({ length: n }, (): number[] => [])
  const given = filled<CartesianBox | null>(n, null)
  spec.rows.forEach((row, index) => {
    const id = cartesianKeyId(row[s.x])
    const at = id == null ? undefined : spec.keyIndex.get(id)
    if (at === undefined)
      return
    if (box.raw != null) {
      const v = numberOf(row[box.raw])
      if (v == null)
        return
      if (rows[at] === -1)
        rows[at] = index
      groups[at]!.push(v)
      return
    }
    if (rows[at] !== -1)
      return
    rows[at] = index
    const f = box.stats!
    const five = [row[f.min], row[f.q1], row[f.median], row[f.q3], row[f.max]].map(numberOf)
    if (five.some(v => v == null))
      return
    const [min, q1, median, q3, max] = five as number[]
    if (!(min! <= q1! && q1! <= median! && median! <= q3! && q3! <= max!)) {
      issues.push({ code: DIAGNOSTIC_CODES.chartInvalidRange, message: '箱线的五数必须依次不减：最小 ≤ 下四分位 ≤ 中位数 ≤ 上四分位 ≤ 最大', detail: { series: s.id, row: index, five } })
      return
    }
    given[at] = { min: min!, q1: q1!, median: median!, q3: q3!, max: max!, outliers: [], density: null }
  })
  const boxes = box.raw == null
    ? given
    : groups.map((values): CartesianBox | null => {
        const stats = boxplotStats(values)
        if (!stats)
          return null
        // 不要离群点：须线直达最小与最大值
        return {
          min: box.outliers ? stats.lowWhisker : stats.min,
          q1: stats.q1,
          median: stats.median,
          q3: stats.q3,
          max: box.outliers ? stats.highWhisker : stats.max,
          outliers: box.outliers ? stats.outliers : [],
          density: box.style === 'violin' ? kde(values, { points: VIOLIN_SAMPLES, extent: [stats.min, stats.max] }) : null,
        }
      })
  return { spec: s, values: boxes.map(b => b?.median ?? null), rows, keyAt: null, pointIds: null, sizes: null, colors: null, steps: null, ends: null, ohlc: null, boxes, lows: null }
}

/** K 线一个键上的开高低收。 */
export interface CartesianOhlc {
  readonly open: number
  readonly high: number
  readonly low: number
  readonly close: number
}

/**
 * K 线：每个键取第一行的开高低收，四个都是数才算一根；数值（提示框、摘要、数据表的主值）是收盘。
 * 最低价高于开盘或收盘、最高价低于开盘或收盘的行报 chart.ohlc-range，整张图按规格不合法处理。
 */
function candlestickValues(spec: CartesianSpec, s: CartesianSeriesSpec, rows: readonly number[], issues: ChartSpecIssue[]): Omit<CartesianSeriesValues, 'low' | 'high' | 'outermost'> {
  const fields = s.ohlc!
  const ohlc = rows.map((r): CartesianOhlc | null => {
    const row = r < 0 ? undefined : spec.rows[r]
    if (!row)
      return null
    const [open, high, low, close] = [row[fields.open], row[fields.high], row[fields.low], row[fields.close]].map(numberOf)
    if (open == null || high == null || low == null || close == null)
      return null
    if (low > Math.min(open, close) || high < Math.max(open, close)) {
      issues.push({ code: DIAGNOSTIC_CODES.chartOhlcRange, message: 'K 线的最低价不能高于开盘或收盘，最高价不能低于开盘或收盘', detail: { series: s.id, row: r, open, high, low, close } })
      return null
    }
    return { open, high, low, close }
  })
  return { spec: s, values: ohlc.map(o => o?.close ?? null), rows, keyAt: null, pointIds: null, sizes: null, colors: null, steps: null, ends: null, ohlc, boxes: null, lows: null }
}

export function deriveCartesian(spec: CartesianSpec, hiddenSeries: readonly string[]): CartesianDerived {
  const hidden = new Set(hiddenSeries)
  const issues: ChartSpecIssue[] = []
  const n = spec.keys.length
  const base = spec.series.filter(s => !hidden.has(s.id)).map((s) => {
    if (s.mark === 'scatter')
      return scatterPoints(spec, s)
    const values = filled<number | null>(n, null)
    const rows = filled(n, -1)
    const ends = s.binEnd == null ? null : filled<number | null>(n, null)
    const lows = s.yLow == null ? null : filled<number | null>(n, null)
    spec.rows.forEach((row, index) => {
      const id = cartesianKeyId(row[s.x])
      const at = id == null ? undefined : spec.keyIndex.get(id)
      // 同一个键出现在多行时取第一行：一个标记对应一行数据
      if (at === undefined || rows[at] !== -1)
        return
      rows[at] = index
      values[at] = numberOf(row[s.y])
      if (lows) {
        // 区间：下端不能高过上端；缺了一端这个键上没有区间
        const low = numberOf(row[s.yLow!])
        const high = values[at]
        if (low != null && high != null && low > high)
          issues.push({ code: DIAGNOSTIC_CODES.chartInvalidRange, message: '区间的下端不能高于上端', detail: { series: s.id, row: index, low, high } })
        if (low == null || high == null)
          values[at] = null
        else
          lows[at] = low
      }
      if (ends) {
        // 分箱的止点必须在起点之后：区间倒过来或缺了止点，这一箱画不出宽度
        const start = timeValue(row[s.x])
        const end = timeValue(row[s.binEnd!])
        if (end == null || start == null || end <= start)
          issues.push({ code: DIAGNOSTIC_CODES.chartInvalidRange, message: '分箱区间的止点必须是数，且在起点之后', detail: { series: s.id, row: index, start: row[s.x], end: row[s.binEnd!] } })
        else
          ends[at] = end
      }
    })
    if (s.ohlc)
      return candlestickValues(spec, s, rows, issues)
    if (s.box)
      return boxplotValues(spec, s, issues)
    if (!s.waterfall)
      return { spec: s, values, rows, keyAt: null, pointIds: null, sizes: null, colors: null, steps: null, ends, ohlc: null, boxes: null, lows }
    // 瀑布：小计行的 y 被忽略，数值取算出来的累计值；缺失的一步不画、不改累计
    const total = s.waterfall.total
    const steps = waterfall(values, rows.map(r => total != null && r >= 0 && Boolean(spec.rows[r]![total])))
    return { spec: s, values: steps.map(step => step?.value ?? null), rows, keyAt: null, pointIds: null, sizes: null, colors: null, steps, ends: null, ohlc: null, boxes: null, lows: null }
  })

  const stacked = new Map<string, { low: (number | null)[], high: (number | null)[], outermost: boolean[] }>()
  const groups = new Map<string, typeof base>()
  for (const entry of base) {
    if (entry.spec.stack == null)
      continue
    const group = `${entry.spec.mark}:${entry.spec.stack}`
    groups.set(group, [...(groups.get(group) ?? []), entry])
  }
  for (const members of groups.values()) {
    const offset = members[0]!.spec.stackOffset
    try {
      const result = stack(Array.from({ length: n }, (_, j) => j), {
        keys: members.map(m => m.spec.id),
        value: (j, key) => members.find(m => m.spec.id === key)?.values[j] ?? null,
        offset,
        // 流图的层按峰值出现的先后由内向外排：早出峰的在中间，整体摆动最小
        order: offset === 'wiggle' ? 'insideOut' : 'none',
      })
      for (const s of result) {
        stacked.set(s.key, {
          low: s.segments.map(seg => (seg.defined ? seg.y0 : null)),
          high: s.segments.map(seg => (seg.defined ? seg.y1 : null)),
          outermost: s.segments.map(seg => seg.outermost),
        })
      }
    }
    catch (error) {
      if (!isVizError(error))
        throw error
      // 重复的系列 id 在归一那一段已经报过；这里只剩百分比堆叠的负值
      if (error.code === 'XH_VIZ_NEGATIVE_SHARE')
        issues.push({ code: DIAGNOSTIC_CODES.chartNegativeShare, message: error.message, detail: { ...error.detail } })
    }
  }

  const visible = base.map((entry): CartesianSeriesValues => {
    const s = stacked.get(entry.spec.id)
    if (s)
      return { ...entry, ...s }
    if (entry.keyAt)
      return { ...entry, low: entry.values, high: entry.values, outermost: entry.values.map(() => true) }
    // 区间从下端画到上端
    if (entry.lows)
      return { ...entry, low: entry.lows, high: entry.values, outermost: entry.values.map(() => true) }
    // 箱线的两端是须线与离群点的最远处：定义域要盖住它们
    if (entry.boxes) {
      const reach = (b: CartesianBox | null, side: 'low' | 'high'): number | null => (b == null
        ? null
        : side === 'low' ? Math.min(b.min, ...b.outliers) : Math.max(b.max, ...b.outliers))
      return { ...entry, low: entry.boxes.map(b => reach(b, 'low')), high: entry.boxes.map(b => reach(b, 'high')), outermost: entry.values.map(() => true) }
    }
    // K 线的两端是最低价与最高价：定义域要盖住整根影线
    if (entry.ohlc)
      return { ...entry, low: entry.ohlc.map(o => o?.low ?? null), high: entry.ohlc.map(o => o?.high ?? null), outermost: entry.values.map(() => true) }
    // 瀑布的柱从这一步的起点画到终点：两端都浮在空中，离起点远的一端做圆角
    if (entry.steps)
      return { ...entry, low: entry.steps.map(step => step?.base ?? null), high: entry.steps.map(step => step?.end ?? null), outermost: entry.values.map(() => true) }
    return {
      ...entry,
      low: entry.values.map(v => (v == null ? null : 0)),
      high: entry.values,
      outermost: entry.values.map(() => true),
    }
  })
  const keyOfRow = new Map<string, Map<number, number>>()
  for (const s of visible) {
    const own = new Map<number, number>()
    s.rows.forEach((row, j) => {
      if (row >= 0 && s.values[j] != null)
        own.set(row, j)
    })
    keyOfRow.set(s.spec.id, own)
  }
  return { spec, visible, issues, keyOfRow }
}

/* ---------- 定义域 ---------- */

export interface CartesianDomains {
  readonly derived: CartesianDerived
  /** 数值轴的定义域（未取整；取整在布局里按刻度数做）。 */
  readonly value: readonly [number, number]
  /** 连续自变量轴的定义域；类目轴为 null。 */
  readonly key: readonly [number, number] | null
  /** 百分比堆叠：数值轴刻度写成百分比。 */
  readonly percent: boolean
  /** 气泡大小的上界：全部可见气泡共用一把尺；没有气泡为 null。 */
  readonly size: number | null
  /** 按值着色的值域：全部可见的按值着色系列共用一把尺；没有按值着色为 null。 */
  readonly color: readonly [number, number] | null
  readonly issues: readonly ChartSpecIssue[]
}

function toNumber(value: number | Date | undefined): number | undefined {
  return value instanceof Date ? value.valueOf() : value
}

/** 注释落在某根轴上的值（数与日期）：参考线的值、参考带的两端。类目名不在此列。 */
function annotationExtent(annotations: readonly CartesianAnnotation[], axis: 'x' | 'y'): number[] {
  const out: number[] = []
  const push = (value: unknown): void => {
    const n = value instanceof Date ? value.valueOf() : value
    if (typeof n === 'number' && Number.isFinite(n))
      out.push(n)
  }
  for (const a of annotations) {
    if (a.kind === 'line' && a.axis === axis) {
      push(a.value)
    }
    else if (a.kind === 'band' && a.axis === axis) {
      push(a.from)
      push(a.to)
    }
  }
  return out
}

export function cartesianDomains(derived: CartesianDerived, annotations: readonly CartesianAnnotation[]): CartesianDomains {
  const { spec } = derived
  const issues: ChartSpecIssue[] = []
  // 柱从 0 长出，长度就是数值：数值轴含 0；浮着的区间柱不从 0 长出，不强制
  const bars = derived.visible.some(s => s.spec.mark === 'bar' && !s.lows)
  const percent = derived.visible.length > 0 && derived.visible.every(s => s.spec.stack != null && s.spec.stackOffset === 'expand')
  const values: number[] = []
  for (const s of derived.visible) {
    for (let j = 0; j < s.high.length; j++) {
      const hi = s.high[j]
      const lo = s.low[j]
      if (hi != null)
        values.push(hi)
      if (lo != null && (s.spec.mark === 'bar' || s.spec.mark === 'candlestick' || s.spec.mark === 'boxplot'))
        values.push(lo)
      else if (lo != null && s.spec.area)
        values.push(lo)
    }
  }
  // 参考线与参考带的值计入所在轴的定义域：数据范围之外的目标值也看得到
  values.push(...annotationExtent(annotations, 'y'))
  const log = spec.valueScale === 'log'
  let value: [number, number]
  try {
    value = percent && spec.yAxis.min == null && spec.yAxis.max == null
      ? [0, 1]
      : inferDomain(values, {
          min: toNumber(spec.yAxis.min),
          max: toNumber(spec.yAxis.max),
          zero: !log && (spec.yAxis.zero ?? false),
          bars: bars && !log,
        })
  }
  catch (error) {
    if (!isVizError(error))
      throw error
    issues.push({ code: DIAGNOSTIC_CODES.chartBarBaseline, message: error.message, detail: { ...error.detail } })
    value = [0, 1]
  }
  if (log && (value[0] <= 0 || value[1] <= 0)) {
    issues.push({ code: DIAGNOSTIC_CODES.chartLogDomain, message: '对数轴的定义域必须全为正数', detail: { domain: value } })
    value = [1, 10]
  }

  let key: [number, number] | null = null
  if (spec.keyScale !== 'band' && spec.keyScale !== 'point') {
    // 分箱的柱：最后一箱的止点也要在轴上
    const ends = derived.visible.flatMap(s => (s.ends ?? []).filter((v): v is number => v != null))
    const numbers = [...spec.keys.map(k => (k instanceof Date ? k.valueOf() : Number(k))), ...ends, ...annotationExtent(annotations, 'x')].filter(Number.isFinite)
    const low = toNumber(spec.xAxis.min) ?? Math.min(...numbers)
    const high = toNumber(spec.xAxis.max) ?? Math.max(...numbers)
    key = numbers.length === 0 && spec.xAxis.min == null ? [0, 1] : low === high ? [low - 1, high + 1] : [low, high]
    if (spec.keyScale === 'log' && (key[0] <= 0 || key[1] <= 0)) {
      issues.push({ code: DIAGNOSTIC_CODES.chartLogDomain, message: '对数轴的定义域必须全为正数', detail: { domain: key } })
      key = [1, 10]
    }
  }
  let size: number | null = null
  for (const s of derived.visible) {
    for (const v of s.sizes ?? [])
      size = Math.max(size ?? 0, v)
  }
  let color: [number, number] | null = null
  for (const s of derived.visible) {
    for (const v of s.colors ?? []) {
      if (v != null)
        color = color ? [Math.min(color[0], v), Math.max(color[1], v)] : [v, v]
    }
  }
  return { derived, value, key, percent, size, color, issues }
}

/* ---------- 格式 ---------- */

export interface CartesianFormats {
  /** 自变量键写成文字：提示框头部、数据表首列、可及名。 */
  readonly key: (key: ChartKey) => string
  /** 数值写成文字。 */
  readonly value: (value: number) => string
  /** 与坐标轴无关的量（气泡大小、按值着色的值）写成文字：按语言的缺省数字格式。 */
  readonly measure: (value: number) => string
}

function isDateFormat(format: CartesianAxisFormat | undefined): format is Intl.DateTimeFormatOptions {
  return typeof format === 'object' && format != null && !('style' in format) && !('notation' in format) && !('precision' in format)
}

const DATE_DEFAULT: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }

/** 分箱的键写成「起 – 止」：止点与起点同类（日期轴上是日期）。 */
export function formatBin(formats: CartesianFormats, key: ChartKey, end: number): string {
  return `${formats.key(key)} – ${formats.key(key instanceof Date ? new Date(end) : end)}`
}

export function cartesianFormats(spec: CartesianSpec, locale: string): CartesianFormats {
  const keyFormat = spec.xAxis.format
  const valueFormat = spec.yAxis.format
  const dates = new Intl.DateTimeFormat(locale, isDateFormat(keyFormat) ? keyFormat : DATE_DEFAULT)
  const keyNumbers = createNumberFormat(locale, typeof keyFormat === 'object' && !isDateFormat(keyFormat) ? keyFormat : {})
  const values = typeof valueFormat === 'function'
    ? (v: number) => valueFormat(v)
    : createNumberFormat(locale, typeof valueFormat === 'object' && !isDateFormat(valueFormat) ? valueFormat : {})
  return {
    key: (key) => {
      if (typeof keyFormat === 'function')
        return keyFormat(key)
      if (key instanceof Date)
        return dates.format(key)
      return typeof key === 'number' ? keyNumbers(key) : key
    },
    value: values,
    measure: createNumberFormat(locale, {}),
  }
}

/* ---------- 布局 ---------- */

export interface CartesianLayout {
  readonly domains: CartesianDomains
  readonly size: ChartSize
  readonly plot: Rect
  /** 自变量轴的比例尺：类目轴为 band / point，连续轴为 linear / log / time。 */
  readonly keyScale: AxisScale
  readonly valueScale: ContinuousScale
  readonly keyAxis: AxisLayout
  readonly valueAxis: AxisLayout
  /** 每个键在自变量方向上的像素中心；分箱的柱是箱的正中。 */
  readonly keyCenters: readonly number[]
  /** 分箱的柱：键的位置 → 这一箱两端的像素（起点、止点）。 */
  readonly binSpans: ReadonlyMap<number, readonly [number, number]>
  /** 类目轴的带宽；连续轴为 0。 */
  readonly bandwidth: number
  readonly font: FontSpec
  readonly metrics: ChartMetrics
  readonly measurer: TextMeasurer
  readonly formats: CartesianFormats
  /** 堆叠柱写合计。 */
  readonly totals: boolean
  /** 注释：参考线、参考带、标出的数据、平均线与趋势线。 */
  readonly annotations: readonly CartesianAnnotation[]
  /** 平均线缺省标签的前缀。 */
  readonly averageLabel: string
  /** 生效的缩放窗口在两根轴上的比例：不能缩放的方向是整条轴。 */
  readonly window: CartesianWindowRatio
  /** 连续轴或数值轴被缩放：窗外的标记要裁掉。 */
  readonly clipped: boolean
  /** 连续自变量轴取整后的整条定义域（日期取时间值）：缩放窗口的比例对着它；类目轴为 null。 */
  readonly keyExtent: readonly [number, number] | null
  /** 类目轴被缩放时露出的键的下标范围（含两端）；没缩放是整条。 */
  readonly keyRange: readonly [number, number]
  /** 数值轴取整后的整条定义域：y 窗口的比例对着它。 */
  readonly valueExtent: readonly [number, number]
}

/** 连续自变量轴上的键换成数：日期取时间值。 */
function keyNumber(key: ChartKey): number {
  return key instanceof Date ? key.valueOf() : Number(key)
}

/** 定义域里的一段换成整条轴上的比例；两端不是有限数、对数轴取到非正数或整条轴只有一个值时是整条轴。 */
function ratioOf(range: readonly [number, number], full: readonly [number, number], kind: 'linear' | 'log'): AxisWindow {
  const valid = (v: number): boolean => Number.isFinite(v) && (kind !== 'log' || v > 0)
  return range.every(valid) && full.every(valid) && full[0] !== full[1] ? domainToWindow(range, full, kind) : FULL_WINDOW
}

function isCategoryScale(scale: AxisScale): scale is BandScale<string | number> {
  return scale.kind === 'band' || scale.kind === 'point'
}

/** 类目轴的键：日期换成时间值当键，格式器再按日期写。 */
function categoryKey(key: ChartKey): string | number {
  return key instanceof Date ? key.valueOf() : key
}

export function layoutCartesian(
  domains: CartesianDomains,
  size: ChartSize,
  metrics: ChartMetrics,
  measurer: TextMeasurer,
  measurerVersion: number,
  locale: string,
  totals: boolean,
  annotations: readonly CartesianAnnotation[],
  averageLabel: string,
  zoom: CartesianZoom,
  zoomWindow: CartesianWindow,
): CartesianLayout {
  void measurerVersion
  const { spec } = domains.derived
  const vertical = spec.orientation === 'vertical'
  const font = metrics.font
  const formats = cartesianFormats(spec, locale)
  const categoryKeys = spec.keys.map(categoryKey)
  const keyOf = new Map(categoryKeys.map((k, i) => [k, spec.keys[i]!]))
  const keyAxisConfig = spec.xAxis
  // 缩放窗口写的是定义域里的值，这里换成整条轴上的比例；不能缩放的方向是整条轴。
  // 类目轴按窗口露出一段键，连续轴与数值轴按窗口换定义域
  const zoomX = zoom === 'x' || zoom === 'xy'
  const zoomY = zoom === 'y' || zoom === 'xy'
  const category = spec.keyScale === 'band' || spec.keyScale === 'point'
  const keyKind = spec.keyScale === 'log' ? 'log' : 'linear'
  let windowX: AxisWindow = FULL_WINDOW
  let keyRange: [number, number] = [0, categoryKeys.length - 1]
  if (category && zoomX && zoomWindow.x && categoryKeys.length > 0) {
    // 两端的类目不在数据里时取轴的那一端：数据往后推、窗口的首个类目滚出去时窗口照样有效
    const indexOf = (key: ChartKey, missing: number): number => {
      const i = categoryKeys.indexOf(categoryKey(key))
      return i < 0 ? missing : i
    }
    const a = indexOf(zoomWindow.x[0], 0)
    const b = indexOf(zoomWindow.x[1], categoryKeys.length - 1)
    keyRange = [Math.min(a, b), Math.max(a, b)]
    windowX = indexRangeToWindow(keyRange[0], keyRange[1], categoryKeys.length)
  }
  const shownKeys = categoryKeys.slice(keyRange[0], keyRange[1] + 1)
  const barCount = domains.derived.visible.some(s => s.spec.mark === 'bar')
  const scatterOnly = spec.series.length > 0 && spec.series.every(s => s.mark === 'scatter')
  // 散点落在定义域两端时整个点要在绘图区里、不压在坐标轴线上：连续轴两端各收进一截，气泡收进最大半径，
  // 普通的点收进一个点的直径（半径加上与轴线之间的一道空隙）
  const scattered = domains.derived.visible.some(s => s.spec.mark === 'scatter')
  const margin = domains.size != null ? metrics.barMax : scattered ? metrics.pointSize : 0
  const inset = ([a, b]: [number, number]): [number, number] => {
    const dir = Math.sign(b - a) || 1
    return Math.abs(b - a) > margin * 4 ? [a + dir * margin, b - dir * margin] : [a, b]
  }

  // 自变量轴沿哪个方向；horizontal 下类目自上而下排
  const along = (plot: Rect): [number, number] => vertical
    ? (keyAxisConfig.reverse ? [plot.x + plot.width, plot.x] : [plot.x, plot.x + plot.width])
    : (keyAxisConfig.reverse ? [plot.y + plot.height, plot.y] : [plot.y, plot.y + plot.height])
  const across = (plot: Rect): [number, number] => inset(vertical
    ? (spec.yAxis.reverse ? [plot.y, plot.y + plot.height] : [plot.y + plot.height, plot.y])
    : (spec.yAxis.reverse ? [plot.x + plot.width, plot.x] : [plot.x, plot.x + plot.width]))

  let keyExtent: [number, number] | null = null
  let valueExtent: [number, number] = [domains.value[0], domains.value[1]]
  let windowY: AxisWindow = FULL_WINDOW
  const keyScaleOf = (plot: Rect): AxisScale => {
    const range = along(plot)
    if (spec.keyScale === 'band')
      return scaleBand({ domain: shownKeys, range, paddingInner: barCount ? 0.2 : 0.1, paddingOuter: barCount ? 0.1 : 0.05 })
    if (spec.keyScale === 'point')
      return scalePoint({ domain: shownKeys, range, paddingOuter: 0.5 })
    const [lo, hi] = domains.key ?? [0, 1]
    const inner = inset(range)
    const make = ([a, b]: readonly [number, number]): AxisScale => {
      if (spec.keyScale === 'time')
        return scaleTime({ domain: [new Date(a), new Date(b)], range: inner })
      if (spec.keyScale === 'utc')
        return scaleUtc({ domain: [new Date(a), new Date(b)], range: inner })
      return spec.keyScale === 'log' ? scaleLog({ domain: [a, b], range: inner }) : scaleLinear({ domain: [a, b], range: inner })
    }
    let full = make([lo, hi])
    // 只有散点时自变量是一个量而不是序列：两端缺省取整到刻度上，与数值轴一致
    if ((spec.xAxis.nice ?? scatterOnly) && spec.keyScale !== 'time' && spec.keyScale !== 'utc')
      full = (full as ContinuousScale).nice()
    // 窗口按取整后的整条轴换算：越出整条轴的部分夹回来
    const extent = (full.domain as readonly (number | Date)[]).map(v => (v instanceof Date ? v.valueOf() : v)) as [number, number]
    keyExtent = extent
    if (zoomX && zoomWindow.x)
      windowX = ratioOf([keyNumber(zoomWindow.x[0]), keyNumber(zoomWindow.x[1])], extent, keyKind)
    if (isFullWindow(windowX))
      return full
    return make(windowToDomain(windowX, extent, keyKind))
  }

  const valueSpec: NumberFormatSpec = typeof spec.yAxis.format === 'object' && !isDateFormat(spec.yAxis.format)
    ? spec.yAxis.format
    : domains.percent ? { style: 'percent' } : {}
  // 数值轴的刻度数按像素密度推：纵轴 2.5 倍行高一个；横轴按两端标签的实测宽度加两行字高的间隙一个。
  // 取整、坐标轴的刻度与标签精度用同一个数，末端才落在刻度上
  const endLabelWidth = (): number => {
    const format = typeof spec.yAxis.format === 'function'
      ? spec.yAxis.format
      : createNumberFormat(locale, valueSpec) as (value: number) => string
    return Math.max(...domains.value.map(v => measurer.measure(format(v), font).width))
  }
  const valueTickCount = (range: readonly number[]): number => typeof spec.yAxis.ticks === 'number'
    ? spec.yAxis.ticks
    : Math.max(2, Math.floor(Math.abs(range[1]! - range[0]!) / (vertical ? font.lineHeight * 2.5 : endLabelWidth() + font.lineHeight * 2)))
  // 柱端外侧的标签与合计写在绘图区里：值域两端各收进一截，最高（最低）的那根柱外面也有地方写
  const pad = labelPadding(domains.derived, totals, formats, measurer, font, metrics)
  const valueScaleOf = (plot: Rect): ContinuousScale => {
    const [r0, r1] = across(plot)
    const dir = Math.sign(r1 - r0) || 1
    const range: [number, number] = [r0 + dir * pad.low, r1 - dir * pad.high]
    const [lo, hi] = domains.value
    const make = ([a, b]: readonly [number, number]): ContinuousScale => (spec.valueScale === 'log' ? scaleLog({ domain: [a, b], range }) : scaleLinear({ domain: [a, b], range }))
    const base = make([lo, hi])
    const full = spec.yAxis.nice === false || domains.percent ? base : base.nice(valueTickCount(range))
    const valueKind = spec.valueScale === 'log' ? 'log' : 'linear'
    valueExtent = full.domain as [number, number]
    windowY = zoomY && zoomWindow.y ? ratioOf(zoomWindow.y, valueExtent, valueKind) : FULL_WINDOW
    if (isFullWindow(windowY))
      return full
    return make(windowToDomain(windowY, valueExtent, valueKind))
  }

  const valueTickFormat = (scale: AxisScale) => (value: unknown): string => {
    if (typeof spec.yAxis.format === 'function')
      return spec.yAxis.format(value)
    const continuous = scale as ContinuousScale
    return continuous.tickFormat(locale, valueTickCount(continuous.range), valueSpec)(value as number)
  }
  const keyTickFormat = (scale: AxisScale) => (value: unknown): string => {
    if (isCategoryScale(scale))
      return formats.key(keyOf.get(value as string | number) ?? (value as ChartKey))
    if (typeof spec.xAxis.format === 'function')
      return spec.xAxis.format(value)
    if (scale.kind === 'time' || scale.kind === 'utc') {
      if (isDateFormat(spec.xAxis.format))
        return new Intl.DateTimeFormat(locale, spec.xAxis.format).format(value as Date)
      return (scale as TimeScale).tickFormat(locale)(value as Date)
    }
    return (scale as ContinuousScale).tickFormat(locale)(value as number)
  }

  const common = {
    measure: measurer,
    font,
    minLabelGap: metrics.labelGap * 2,
    labelGap: metrics.labelGap,
  }
  const maxLabel = Math.max(48, size.width * 0.3)
  const keyPosition = vertical ? 'bottom' : 'left'
  const valuePosition = vertical ? 'left' : 'bottom'
  // 类目轴不画刻度线（标签居中于带），连续自变量轴画；数值轴只有标签与网格
  const keyTicks = spec.keyScale === 'band' || spec.keyScale === 'point' ? 0 : metrics.tickLength

  // 上沿留半行：纵轴最上面那个刻度标签居中于绘图区上沿。连续横轴的最后一个标签居中于右沿，右边留出它的一半
  const lastValueLabel = formats.value(domains.value[1])
  const rightInset = !vertical || (spec.keyScale !== 'band' && spec.keyScale !== 'point')
    ? Math.ceil(measurer.measure(vertical ? formats.key(spec.keys.at(-1) ?? '') : lastValueLabel, font).width / 2)
    : 0
  // 竖向的线尾标签写在最后一个点的右边：右边距取它与连续横轴末端标签所需的较大者
  const endInset = vertical ? pad.end : 0
  const outer: Rect = {
    x: 0,
    y: Math.ceil(font.lineHeight / 2),
    width: Math.max(0, size.width - Math.max(rightInset, endInset)),
    height: Math.max(0, size.height - Math.ceil(font.lineHeight / 2)),
  }

  let keyFormatScale: AxisScale | null = null
  let valueFormatScale: AxisScale | null = null
  const valueAxisConfig = {
    ...common,
    format: (v: unknown) => valueTickFormat(valueFormatScale as AxisScale)(v),
    ticks: spec.yAxis.ticks,
    labelOverflow: spec.yAxis.labelOverflow ?? 'auto',
    maxLabelSize: maxLabel,
    tickLength: 0,
    title: spec.yAxis.title,
  } as const
  const solved = solvePlotRect({
    outer,
    axes: {
      [keyPosition]: {
        ...common,
        format: (v: unknown) => keyTickFormat(keyFormatScale as AxisScale)(v),
        ticks: spec.xAxis.ticks,
        labelOverflow: spec.xAxis.labelOverflow ?? 'auto',
        maxLabelSize: maxLabel,
        tickLength: keyTicks,
        title: spec.xAxis.title,
      },
      [valuePosition]: valueAxisConfig,
    },
    scales: {
      [keyPosition]: (plot: Rect) => (keyFormatScale = keyScaleOf(plot)),
      [valuePosition]: (plot: Rect) => (valueFormatScale = valueScaleOf(plot)),
    },
  })

  const keyScale = solved.scales[keyPosition] as AxisScale
  const valueScale = solved.scales[valuePosition] as ContinuousScale
  // 横向的数值轴按取整用的同一个刻度数重排：坐标轴自己按标签宽度排出的刻度更密，步长与取整对不上，
  // 定义域的末端会落在两个刻度之间。横向数值轴在底边，厚度只随字高，重排不改绘图区
  const valueAxis = vertical || Array.isArray(spec.yAxis.ticks)
    ? solved.axes[valuePosition] as AxisLayout
    : layoutAxis({ ...valueAxisConfig, scale: valueScale, position: valuePosition, ticks: valueTickCount(valueScale.range) })
  const bandwidth = isCategoryScale(keyScale) ? keyScale.bandwidth : 0
  // 分箱的柱：每一箱在自变量方向上的两端像素，键的中心落在箱的正中
  const binSpans = new Map<number, readonly [number, number]>()
  if (!isCategoryScale(keyScale)) {
    const mapKey = (v: number): number => (keyScale.map as (v: unknown) => number | undefined)(spec.keyScale === 'time' || spec.keyScale === 'utc' ? new Date(v) : v) ?? Number.NaN
    for (const s of domains.derived.visible) {
      s.ends?.forEach((end, j) => {
        const key = spec.keys[j]!
        if (end == null || binSpans.has(j))
          return
        const span = [mapKey(key instanceof Date ? key.valueOf() : Number(key)), mapKey(end)] as const
        if (span.every(Number.isFinite))
          binSpans.set(j, span)
      })
    }
  }
  const keyCenters = spec.keys.map((key, j) => {
    if (isCategoryScale(keyScale)) {
      const at = (keyScale.map as (k: string | number) => number | undefined)(categoryKey(key))
      return at == null ? Number.NaN : at + bandwidth / 2
    }
    const span = binSpans.get(j)
    if (span)
      return (span[0] + span[1]) / 2
    const at = (keyScale.map as (v: unknown) => number | undefined)(key)
    return at ?? Number.NaN
  })
  return {
    keyExtent,
    valueExtent,
    window: { x: windowX, y: windowY },
    clipped: (!category && !isFullWindow(windowX)) || !isFullWindow(windowY),
    keyRange,
    binSpans,
    domains,
    size,
    plot: solved.plot,
    keyScale,
    valueScale,
    keyAxis: solved.axes[keyPosition] as AxisLayout,
    valueAxis,
    keyCenters,
    bandwidth,
    font,
    metrics,
    measurer,
    formats,
    totals,
    annotations,
    averageLabel,
  }
}

/** 堆叠组的合计：每个键上正值与负值各自的和。百分比堆叠不写合计。 */
function stackTotals(derived: CartesianDerived): Map<string, { positive: (number | null)[], negative: (number | null)[], members: CartesianSeriesValues[] }> {
  const groups = new Map<string, { positive: (number | null)[], negative: (number | null)[], members: CartesianSeriesValues[] }>()
  const n = derived.spec.keys.length
  for (const s of derived.visible) {
    if (s.spec.mark !== 'bar' || s.spec.stack == null || s.spec.stackOffset === 'expand')
      continue
    const group = groups.get(s.spec.stack) ?? { positive: filled<number | null>(n, null), negative: filled<number | null>(n, null), members: [] }
    group.members.push(s)
    s.values.forEach((v, j) => {
      if (v == null)
        return
      if (v >= 0)
        group.positive[j] = (group.positive[j] ?? 0) + v
      else
        group.negative[j] = (group.negative[j] ?? 0) + v
    })
    groups.set(s.spec.stack, group)
  }
  return groups
}

/** 线尾标签的文字：系列名与末值。 */
function endLabelText(s: CartesianSeriesValues, formats: CartesianFormats): { text: string, index: number } | null {
  for (let j = s.values.length - 1; j >= 0; j--) {
    const v = s.values[j]
    if (v != null)
      return { text: `${s.spec.name} ${formats.value(v)}`, index: j }
  }
  return null
}

/**
 * 标签要占的地方：high 与 low 是数值轴两端要收进的像素（柱端外侧的标签、合计、折线点上的标签），
 * end 是竖向时线尾标签要的右边距。竖向只要一行字高，横向要最宽的那个标签。
 */
function labelPadding(
  derived: CartesianDerived,
  totals: boolean,
  formats: CartesianFormats,
  measurer: TextMeasurer,
  font: FontSpec,
  metrics: ChartMetrics,
): { high: number, low: number, end: number } {
  const vertical = derived.spec.orientation === 'vertical'
  const gap = metrics.labelGap
  const across = (text: string): number => (vertical ? font.lineHeight : measurer.measure(text, font).width) + gap
  let high = 0
  let low = 0
  let end = 0
  for (const s of derived.visible) {
    // 棒棒糖的点落在数值上：贴着定义域两端的点整个落在绘图区里，两端各收进一个点的半径加描边环
    if (s.spec.mark === 'bar' && s.spec.shape === 'lollipop') {
      const reach = metrics.pointSize * 0.75 + metrics.gap
      high = Math.max(high, reach)
      low = Math.max(low, reach)
    }
    const outside = s.spec.mark === 'bar' && s.spec.labels === 'end' && s.spec.stack == null
    const onPoints = s.spec.mark === 'line' && s.spec.labels === 'end'
    if (outside || onPoints) {
      for (const v of s.values) {
        if (v == null)
          continue
        const need = across(formats.value(v)) + (onPoints ? metrics.pointSize / 2 : 0)
        // 折线点上的标签总写在点的上方（横向在右侧），不随正负翻面
        if (v >= 0 || onPoints)
          high = Math.max(high, need)
        else
          low = Math.max(low, need)
      }
    }
    if (s.spec.endLabel) {
      const label = endLabelText(s, formats)
      if (label) {
        // 被推开时整列再往右挪出引导线的长度：按挪开的情形留足
        const width = measurer.measure(label.text, font).width + gap * 6 + metrics.pointSize / 2
        if (vertical)
          end = Math.max(end, width)
        else
          high = Math.max(high, width)
      }
    }
  }
  if (totals) {
    for (const group of stackTotals(derived).values()) {
      for (const v of group.positive) {
        if (v != null)
          high = Math.max(high, across(formats.value(v)))
      }
      for (const v of group.negative) {
        if (v != null)
          low = Math.max(low, across(formats.value(v)))
      }
    }
  }
  return { high: Math.ceil(high), low: Math.ceil(low), end: Math.ceil(end) }
}

/* ---------- 场景 ---------- */

/** 场景里一个数据标记的归属：连接层按它写部件属性、可及名与键盘遍历。 */
export interface CartesianMarkInfo {
  readonly seriesId: string
  /** 在系列里的位置（见 CartesianSeriesValues）；系列分组与整条折线为 −1。 */
  readonly position: number
}

export interface CartesianScene {
  readonly layout: CartesianLayout
  readonly scene: Scene
  /** 标记键 → 归属。 */
  readonly info: ReadonlyMap<string, CartesianMarkInfo>
  /** 数据在绘图区里的锚点：系列 id → 每个键上的 (x, y)，没有值为 null。 */
  readonly anchors: ReadonlyMap<string, readonly ({ x: number, y: number } | null)[]>
  /** 数据标签写在哪儿：inside 压在色块上（字取配对的前景色），end 写在标记外。 */
  readonly placements: ReadonlyMap<string, 'inside' | 'end'>
  /** 标签键 → 它写的数与写法：更新过渡里标签上的数从旧值滚到新值，逐帧按同一写法重写。 */
  readonly labelValues: ReadonlyMap<string, CartesianLabelValue>
  /** 注释的标记与标签键 → 它是哪种注释、跟着哪个系列（参考线与参考带不跟系列）。 */
  readonly annotations: ReadonlyMap<string, CartesianAnnotationInfo>
  /** 缩放后要裁到的矩形（绘图区）：窗外的标记不露出来；没缩放连续轴与数值轴时为 null。 */
  readonly clip: Rect | null
}

/** 注释标记的归属：连接层据此写 data-kind、系列的色槽与淡出。 */
export interface CartesianAnnotationInfo {
  readonly kind: CartesianAnnotation['kind']
  readonly seriesId: string | null
  /** 趋势线的算法：最小二乘直线是推算（虚线），移动平均是数据的平滑（实线）。 */
  readonly method?: 'linear' | 'moving-average'
}

/** 标签写的数，以及把数写成标签文字的写法。 */
export interface CartesianLabelValue {
  readonly value: number
  readonly format: (value: number) => string
}

const LABEL_NUMBERS = new WeakMap<CartesianScene, ChartNumbers>()

/** 交给过渡内核滚动的数：每个标签一个，按标签键取。 */
export function cartesianLabelNumbers(scene: CartesianScene | null): ChartNumbers {
  if (!scene)
    return {}
  let numbers = LABEL_NUMBERS.get(scene)
  if (!numbers) {
    numbers = Object.fromEntries([...scene.labelValues].map(([key, label]) => [key, label.value]))
    LABEL_NUMBERS.set(scene, numbers)
  }
  return numbers
}

/** 1px 线对齐到像素中心，避免被抗锯齿拉成两像素的灰线。 */
function crisp(value: number): number {
  return Math.round(value) + 0.5
}

function line(key: string, part: string, x1: number, y1: number, x2: number, y2: number): PathMark {
  return { kind: 'path', key, part, d: `M${x1},${y1}L${x2},${y2}` }
}

/**
 * 数据标记的身份：取自变量的值而不是它在键序里的位置。类目换了次序、时间序列往后推了一格，
 * 同一个数据仍是同一个标记，过渡里从旧位置滑到新位置，而不是按位置错配成别的数据的高度。
 * 键序里的键都是合法的，身份串一定存在。
 */
export function cartesianDatumId(key: ChartKey): string {
  return cartesianKeyId(key)!
}

/** 网格线画成两点的折线：过渡里按端点插值，刻度换位时跟着滑过去。 */
function gridLine(key: string, x1: number, y1: number, x2: number, y2: number): LineMark {
  return { kind: 'line', key, part: 'grid-line', curve: 'linear', points: [{ key: 'a', x: x1, y: y1 }, { key: 'b', x: x2, y: y2 }] }
}

/** 刻度的身份：按刻度值而不是下标，定义域变了之后同一个值的刻度滑到新位置，新值淡入、旧值淡出。 */
function tickId(tick: AxisLayout['ticks'][number]): string {
  return tick.value instanceof Date ? String(tick.value.valueOf()) : String(tick.value)
}

function axisMarks(
  prefix: string,
  axis: AxisLayout,
  position: 'bottom' | 'left',
  plot: Rect,
  metrics: ChartMetrics,
  options: { line: boolean, ticks: boolean, title?: string },
): Mark[] {
  const marks: Mark[] = []
  const { tickLength, labelGap } = metrics
  const lineHeight = metrics.font.lineHeight
  const bottom = plot.y + plot.height
  if (options.line) {
    marks.push(position === 'bottom'
      ? line(`${prefix}:line`, 'axis-line', plot.x, crisp(bottom), plot.x + plot.width, crisp(bottom))
      : line(`${prefix}:line`, 'axis-line', crisp(plot.x), plot.y, crisp(plot.x), bottom))
  }
  if (options.ticks && tickLength > 0) {
    const d = axis.ticks
      .filter(t => Number.isFinite(t.offset))
      .map(t => (position === 'bottom'
        ? `M${crisp(t.offset)},${bottom}L${crisp(t.offset)},${bottom + tickLength}`
        : `M${plot.x},${crisp(t.offset)}L${plot.x - tickLength},${crisp(t.offset)}`))
      .join('')
    if (d)
      marks.push({ kind: 'path', key: `${prefix}:ticks`, part: 'tick', d })
  }
  const shift = (options.ticks ? tickLength : 0) + labelGap
  for (const tick of axis.ticks) {
    if (!tick.visible || !Number.isFinite(tick.offset))
      continue
    tick.lines.forEach((text, n) => {
      const key = `${prefix}:label:${tickId(tick)}:${n}`
      if (position === 'bottom') {
        const y = bottom + shift + n * lineHeight
        marks.push(tick.rotate === 0
          ? { kind: 'text', key, part: 'tick-label', x: tick.offset, y, text, anchor: 'middle', baseline: 'top' }
          : { kind: 'text', key, part: 'tick-label', x: tick.offset, y, text, anchor: 'end', baseline: 'middle', rotate: tick.rotate })
      }
      else {
        const y = tick.offset + (n - (tick.lines.length - 1) / 2) * lineHeight
        marks.push({ kind: 'text', key, part: 'tick-label', x: plot.x - shift, y, text, anchor: 'end', baseline: 'middle' })
      }
    })
  }
  if (options.title) {
    marks.push(position === 'bottom'
      ? { kind: 'text', key: `${prefix}:title`, part: 'axis-title', x: plot.x + plot.width / 2, y: bottom + axis.thickness, text: options.title, anchor: 'middle', baseline: 'bottom' }
      : { kind: 'text', key: `${prefix}:title`, part: 'axis-title', x: plot.x - axis.thickness, y: plot.y + plot.height / 2, text: options.title, anchor: 'middle', baseline: 'top', rotate: -90 })
  }
  return marks
}

export function cartesianScene(layout: CartesianLayout, version: number): CartesianScene {
  const { domains, plot, metrics } = layout
  const { spec } = domains.derived
  const vertical = spec.orientation === 'vertical'
  const info = new Map<string, CartesianMarkInfo>()
  const anchors = new Map<string, ({ x: number, y: number } | null)[]>()
  const toValue = (v: number): number => layout.valueScale.map(v) ?? Number.NaN
  const point = (along: number, value: number): { x: number, y: number } => (vertical ? { x: along, y: value } : { x: value, y: along })

  // —— 网格 ——
  const back: Mark[] = []
  const gridLines: Mark[] = []
  if (spec.yAxis.grid !== false) {
    for (const tick of layout.valueAxis.ticks) {
      if (!Number.isFinite(tick.offset))
        continue
      const at = crisp(tick.offset)
      gridLines.push(vertical
        ? gridLine(`grid:v:${tickId(tick)}`, plot.x, at, plot.x + plot.width, at)
        : gridLine(`grid:v:${tickId(tick)}`, at, plot.y, at, plot.y + plot.height))
    }
  }
  // 只有散点、自变量是连续量时两个方向都画网格：两根轴地位相同，读点的位置两边都要参照
  const scatterOnly = spec.series.length > 0 && spec.series.every(s => s.mark === 'scatter')
  if (spec.xAxis.grid ?? (scatterOnly && spec.keyScale !== 'band' && spec.keyScale !== 'point')) {
    for (const tick of layout.keyAxis.ticks) {
      if (!Number.isFinite(tick.offset))
        continue
      const at = crisp(tick.offset)
      gridLines.push(vertical
        ? gridLine(`grid:k:${tickId(tick)}`, at, plot.y, at, plot.y + plot.height)
        : gridLine(`grid:k:${tickId(tick)}`, plot.x, at, plot.x + plot.width, at))
    }
  }
  back.push({ kind: 'group', key: 'grid', part: 'grid', children: gridLines })
  const keyAxisPosition = vertical ? 'bottom' : 'left'
  const valueAxisPosition = vertical ? 'left' : 'bottom'
  const continuousKey = spec.keyScale !== 'band' && spec.keyScale !== 'point'
  back.push({
    kind: 'group',
    key: 'axis:x',
    part: 'axis',
    children: axisMarks('axis:x', layout.keyAxis, keyAxisPosition, plot, metrics, { line: true, ticks: continuousKey, title: spec.xAxis.title }),
  })
  back.push({
    kind: 'group',
    key: 'axis:y',
    part: 'axis',
    children: axisMarks('axis:y', layout.valueAxis, valueAxisPosition, plot, metrics, { line: false, ticks: false, title: spec.yAxis.title }),
  })

  // —— 柱：同一个键上，每个不堆叠的柱系列占一格，每个堆叠组合占一格；格宽不超过柱厚上限，余量留白 ——
  const barSlots: string[] = []
  for (const s of domains.derived.visible) {
    if (s.spec.mark !== 'bar')
      continue
    const slot = s.spec.stack == null ? `s:${s.spec.id}` : `g:${s.spec.stack}`
    if (!barSlots.includes(slot))
      barSlots.push(slot)
  }
  const gap = metrics.gap
  const band = layout.bandwidth
  const slotCount = Math.max(1, barSlots.length)
  const thickness = band > 0
    ? Math.max(1, Math.min(metrics.barMax, (band - (slotCount - 1) * gap) / slotCount))
    : Math.max(1, Math.min(metrics.barMax, 8))
  const groupWidth = slotCount * thickness + (slotCount - 1) * gap
  const radius = Math.min(metrics.radius, thickness / 2)
  const baseline = toValue(spec.valueScale === 'log' ? layout.valueScale.domain[0]! : 0)

  const data: Mark[] = []
  const bars = new Map<string, BarBox>()
  for (const s of domains.derived.visible) {
    const id = s.spec.id
    const paint = {
      ...(s.spec.slot != null ? { slot: s.spec.slot } : {}),
      ...(s.spec.tone != null ? { tone: s.spec.tone } : {}),
      ...(s.spec.pattern != null ? { pattern: s.spec.pattern } : {}),
    }
    const children: Mark[] = []
    const seriesAnchors = filled<{ x: number, y: number } | null>(s.values.length, null)
    anchors.set(id, seriesAnchors)
    info.set(`series:${id}`, { seriesId: id, position: -1 })

    if (s.spec.mark === 'scatter') {
      children.push(...scatterMarks(layout, s, paint, seriesAnchors, info))
    }
    else if (s.spec.mark === 'candlestick') {
      children.push(...candleMarks(layout, s, paint, seriesAnchors, info))
    }
    else if (s.spec.mark === 'boxplot') {
      children.push(...boxMarks(layout, s, paint, seriesAnchors, info))
    }
    else if (s.spec.mark === 'bar') {
      const slotIndex = barSlots.indexOf(s.spec.stack == null ? `s:${id}` : `g:${s.spec.stack}`)
      for (let j = 0; j < spec.keys.length; j++) {
        const lo = s.low[j]
        const hi = s.high[j]
        const center = layout.keyCenters[j]!
        if (lo == null || hi == null || !Number.isFinite(center))
          continue
        // 分箱的柱按箱的真实宽度画，相邻两箱之间留一道表面间隙
        const span = s.ends ? layout.binSpans.get(j) : undefined
        if (s.ends && !span)
          continue
        const width = span ? Math.max(1, Math.abs(span[1] - span[0]) - gap) : thickness
        const start = span ? Math.min(span[0], span[1]) + gap / 2 : center - groupWidth / 2 + slotIndex * (thickness + gap)
        // 对数轴上没有 0：不堆叠的柱从定义域下界长起；区间柱从自己的下端画起
        const a = s.spec.stack == null && !s.lows && spec.valueScale === 'log' ? baseline : toValue(lo)
        const b = toValue(hi)
        if (!Number.isFinite(a) || !Number.isFinite(b))
          continue
        // 堆叠段之间留一道表面间隙：不是最外层的段，远离基线的一端让出 gap
        const positive = vertical ? b <= a : b >= a
        const outer = s.outermost[j] ?? true
        let far = b
        if (!outer && Math.abs(b - a) > gap)
          far = positive ? (vertical ? b + gap : b - gap) : (vertical ? b - gap : b + gap)
        if (!outer && Math.abs(b - a) <= gap)
          continue
        const key = `${id}:${cartesianDatumId(spec.keys[j]!)}`
        const rowIndex = s.rows[j]!
        info.set(key, { seriesId: id, position: j })
        const rect = vertical
          ? { x: start, y: Math.min(a, far), width, height: Math.abs(far - a) }
          : { x: Math.min(a, far), y: start, width: Math.abs(far - a), height: width }
        seriesAnchors[j] = point(start + width / 2, b)
        if (s.spec.shape === 'lollipop') {
          // 棒棒糖：细杆从基线（区间的下端）画到数值，顶一个点；区间时两头各一个点（哑铃），只有上端的点可聚焦。
          // 标签的落位按点的外沿算：杆的矩形沿数值方向两头各让出一个点的半径
          const r = metrics.pointSize * 0.75
          const c = crisp(start + width / 2)
          const datum = cartesianDatumId(spec.keys[j]!)
          const head = (at: number): { x: number, y: number } => (vertical ? { x: c, y: at } : { x: at, y: c })
          children.push({ kind: 'path', key: `${id}:stem:${datum}`, part: 'stem', d: vertical ? `M${c},${a}L${c},${b}` : `M${a},${c}L${b},${c}`, paint })
          if (s.lows)
            children.push({ kind: 'symbol', key: `${id}:low:${datum}`, part: 'point', ...head(a), size: Math.PI * r * r, symbol: 'circle', paint, a11y: { label: '', focusable: false } })
          children.push({ kind: 'symbol', key, part: 'point', ...head(b), size: Math.PI * r * r, symbol: 'circle', datum: { seriesId: id, index: rowIndex }, paint, a11y: { label: '', focusable: true } })
          const grown = vertical
            ? { x: c - r, y: rect.y - r, width: r * 2, height: rect.height + r * 2 }
            : { x: rect.x - r, y: c - r, width: rect.width + r * 2, height: r * 2 }
          bars.set(key, { ...grown, positive, stacked: false, row: rowIndex })
          continue
        }
        children.push({
          kind: 'rect',
          key,
          part: 'bar',
          ...rect,
          cornerRadius: outer ? Math.min(radius, width / 2) : 0,
          orientation: vertical ? 'vertical' : 'horizontal',
          // 基线在哪一端：纵向正值在下端（end）、负值在上端；横向正值在左端（start）。
          // 区间柱两头都是数据、都悬空：四角都圆
          baseline: s.lows ? 'none' : vertical ? (positive ? 'end' : 'start') : (positive ? 'start' : 'end'),
          datum: { seriesId: id, index: rowIndex },
          // 瀑布的一步按涨跌取色，小计保持系列色
          paint: s.steps?.[j] && !s.steps[j]!.total ? { ...paint, trend: s.steps[j]!.trend } : paint,
          a11y: { label: '', focusable: true },
        })
        bars.set(key, { ...rect, positive, stacked: s.spec.stack != null, row: rowIndex })
      }
      if (s.steps)
        children.push(...waterfallConnectors(s, spec.keys, bars, toValue, vertical))
    }
    else {
      const points: KeyedPoint[] = []
      const markers: Mark[] = []
      for (let j = 0; j < spec.keys.length; j++) {
        const hi = s.high[j]
        const lo = s.low[j]
        const center = layout.keyCenters[j]!
        const defined = hi != null && Number.isFinite(center)
        if (!defined && s.spec.connectNulls)
          continue
        const v = defined ? toValue(hi) : Number.NaN
        const base = lo != null ? toValue(lo) : baseline
        const p = point(center, v)
        const b = point(center, base)
        // 面积的基线：纵向是 y0，横向是 x0
        points.push(vertical
          ? { key: cartesianDatumId(spec.keys[j]!), x: p.x, y: p.y, y0: b.y, defined }
          : { key: cartesianDatumId(spec.keys[j]!), x: p.x, y: p.y, x0: b.x, defined })
        if (defined) {
          // 区间带的锚点在带的正中：提示框与焦点代理落在带里，不贴着上沿
          seriesAnchors[j] = s.lows ? point(center, (v + base) / 2) : p
          info.set(`${id}:${cartesianDatumId(spec.keys[j]!)}`, { seriesId: id, position: j })
        }
      }
      // 单调平滑沿自变量方向求：横向时自变量是 y
      const curve: CurveName = !vertical && s.spec.curve === 'monotoneX' ? 'monotoneY' : s.spec.curve
      // 点比绘图区沿自变量方向的像素多一倍以上时降采样：只取露在窗口里的一段（两头各带一个窗外的点），
      // 用 LTTB 保住形状；提示框、焦点与数据表仍按全部的点
      const extent = vertical ? plot.width : plot.height
      const drawn = needsSampling(points.length, extent) ? sampleLine(points, vertical, plot) : points
      if (s.spec.area)
        children.push({ kind: 'area', key: `${id}:area`, part: 'area-fill', points: drawn, curve, orientation: spec.orientation, paint, a11y: { label: '', focusable: false } })
      // 区间带只铺带：不画线，也不逐点画点
      if (s.lows) {
        data.push({ kind: 'group', key: `series:${id}`, part: 'series', children })
        continue
      }
      children.push({
        kind: 'line',
        key: `${id}:line`,
        part: 'line',
        points: drawn.map(({ key, x, y, defined }) => ({ key, x, y, defined })),
        curve,
        datum: { seriesId: id, index: 0 },
        paint,
        a11y: { label: '', focusable: true },
      })
      // 数据点：点间距够宽（16px）时才画，太密的点连成一片反而看不清线
      const spacing = spec.keys.length > 1 ? keyStep(layout) : Number.POSITIVE_INFINITY
      const show = s.spec.symbols === 'always' || (s.spec.symbols === 'auto' && spacing >= 16)
      if (show) {
        const size = Math.PI * (metrics.pointSize / 2) ** 2
        for (const [j, anchor] of seriesAnchors.entries()) {
          if (anchor)
            markers.push({ kind: 'symbol', key: `${id}:m:${cartesianDatumId(spec.keys[j]!)}`, part: 'dot', x: anchor.x, y: anchor.y, size, symbol: 'circle', paint, a11y: { label: '', focusable: false } })
        }
      }
      children.push(...markers)
    }
    data.push({ kind: 'group', key: `series:${id}`, part: 'series', children })
  }

  // 参考带垫在网格之上、数据之下；参考线、标出的点、平均线与趋势线压在数据之上；注释的标签与数据标签一起落位
  const notes = cartesianAnnotations(layout, anchors)
  back.splice(1, 0, ...notes.back)
  const labels = cartesianLabels(layout, bars, anchors, notes.labels)
  const scene = createScene({ version, layers: { back, data, front: [...notes.front, ...labels.marks] }, bounds: { x: 0, y: 0, width: layout.size.width, height: layout.size.height } })
  return { layout, scene, info, anchors, placements: labels.placements, labelValues: labels.values, annotations: notes.info, clip: layout.clipped ? plot : null }
}

/**
 * 散点的标记：每个点一个形状，本身就是可聚焦的数据标记。气泡按面积映射大小，半径取平方根，
 * 大的先画、小的压在上面，免得小气泡被整个盖住。类目轴上的抖动以点的身份为种子。
 */
function scatterMarks(
  layout: CartesianLayout,
  s: CartesianSeriesValues,
  paint: MarkPaint,
  anchors: ({ x: number, y: number } | null)[],
  info: Map<string, CartesianMarkInfo>,
): SymbolMark[] {
  const { metrics, domains } = layout
  const vertical = domains.derived.spec.orientation === 'vertical'
  const id = s.spec.id
  const category = isCategoryScale(layout.keyScale)
  const step = category ? ((layout.keyScale as { step?: number }).step ?? layout.bandwidth) : 0
  const marks: { mark: SymbolMark, radius: number }[] = []
  s.values.forEach((v, p) => {
    const center = layout.keyCenters[s.keyAt![p]!]!
    const across = v == null ? Number.NaN : layout.valueScale.map(v) ?? Number.NaN
    if (!Number.isFinite(center) || !Number.isFinite(across))
      return
    const pointId = s.pointIds![p]!
    const along = center + (s.spec.jitter > 0 && step > 0 ? jitter(`${id}:${pointId}`, s.spec.jitter * step) : 0)
    const size = s.sizes?.[p]
    const radius = size != null && domains.size
      ? Math.max(metrics.lineWidth, metrics.barMax * Math.sqrt(size / domains.size))
      : metrics.pointSize / 2
    const at = vertical ? { x: along, y: across } : { x: across, y: along }
    const key = `${id}:${pointId}`
    const t = colorPosition(domains.color, s.colors?.[p])
    anchors[p] = at
    info.set(key, { seriesId: id, position: p })
    marks.push({
      radius,
      mark: {
        kind: 'symbol',
        key,
        part: 'point',
        x: at.x,
        y: at.y,
        size: Math.PI * radius * radius,
        symbol: s.spec.symbol ?? 'circle',
        datum: { seriesId: id, index: s.rows[p]! },
        paint: t == null ? paint : { ...paint, t },
        a11y: { label: '', focusable: true },
      },
    })
  })
  if (s.sizes)
    marks.sort((a, b) => b.radius - a.radius)
  return marks.map(m => m.mark)
}

/**
 * 点在色阶上的起点：点小，色阶最浅的那一段压在承载面上几乎看不见，点只用色阶上从这里到终点的一段。
 * 色阶图例的渐变按同一段画（皮肤里的渐变起点与它对应），图例读到的颜色就是点上的颜色。
 */
export const POINT_COLOR_FLOOR = 0.3

/** 按值着色的值在点的色阶上的位置 POINT_COLOR_FLOOR–1；值域只有一个值时取这一段的中点，值缺失时为 null。 */
export function colorPosition(domain: readonly [number, number] | null, value: number | null | undefined): number | null {
  if (!domain || value == null)
    return null
  const [lo, hi] = domain
  const t = hi === lo ? 0.5 : Math.min(1, Math.max(0, (value - lo) / (hi - lo)))
  return POINT_COLOR_FLOOR + (1 - POINT_COLOR_FLOOR) * t
}

/**
 * 折线降采样：先只留露在绘图区里的一段（两头各带一个窗外的点，线从边上连进来），再按绘图区的像素数用 LTTB 取点。
 * 缺失值把线分成几段，LTTB 按段分配名额，断开的地方仍然断开。
 */
function sampleLine(points: readonly KeyedPoint[], vertical: boolean, plot: Rect): KeyedPoint[] {
  const along = (p: KeyedPoint): number => (vertical ? p.x : p.y)
  const [lo, hi] = vertical ? [plot.x, plot.x + plot.width] : [plot.y, plot.y + plot.height]
  let first = points.findIndex(p => along(p) >= lo)
  let last = points.length - 1
  while (last >= 0 && !(along(points[last]!) <= hi))
    last -= 1
  if (first < 0 || last < first)
    return []
  first = Math.max(0, first - 1)
  last = Math.min(points.length - 1, last + 1)
  const shown = points.slice(first, last + 1)
  const extent = hi - lo
  if (!needsSampling(shown.length, extent))
    return shown
  return lttb(shown, Math.max(2, Math.round(extent)), p => along(p), p => (p.defined === false ? Number.NaN : vertical ? p.y : p.x))
}

/** 键间距：类目轴取步长，连续轴取相邻两个键中心的最小间距；只有一个键时退回柱厚上限。 */
function keyStep(layout: CartesianLayout): number {
  if (isCategoryScale(layout.keyScale))
    return (layout.keyScale as { step?: number }).step ?? layout.bandwidth
  const centers = layout.keyCenters.filter(Number.isFinite).sort((a, b) => a - b)
  let step = Number.POSITIVE_INFINITY
  for (let i = 1; i < centers.length; i++)
    step = Math.min(step, centers[i]! - centers[i - 1]!)
  return Number.isFinite(step) ? step : layout.metrics.barMax
}

/**
 * 箱线：须线（中线加两端短横）、箱（下四分位到上四分位）、中位线与离群点；小提琴画核密度的对称轮廓与中位线。
 * 箱宽取键间距的六成，不超过两倍柱厚上限；小提琴的宽度按整个系列里最大的密度归一，各组之间可以比较。
 * 箱与小提琴轮廓是可聚焦的数据标记，锚点是中位数。
 */
function boxMarks(
  layout: CartesianLayout,
  s: CartesianSeriesValues,
  paint: MarkPaint,
  anchors: ({ x: number, y: number } | null)[],
  info: Map<string, CartesianMarkInfo>,
): Mark[] {
  const { domains, metrics, keyCenters } = layout
  const { spec } = domains.derived
  const vertical = spec.orientation === 'vertical'
  const id = s.spec.id
  const width = Math.max(1, Math.min(metrics.barMax * 2, keyStep(layout) * 0.6))
  const toValue = (v: number): number => layout.valueScale.map(v) ?? Number.NaN
  const at = (along: number, across: number): string => (vertical ? `${along},${across}` : `${across},${along}`)
  const maxDensity = Math.max(0, ...s.boxes!.flatMap(b => b?.density?.map(p => p.density) ?? []))
  const outlierSize = Math.PI * (metrics.pointSize / 3) ** 2
  const marks: Mark[] = []
  s.boxes!.forEach((b, j) => {
    const center = keyCenters[j]!
    if (!b || !Number.isFinite(center))
      return
    const datum = cartesianDatumId(spec.keys[j]!)
    const key = `${id}:${datum}`
    const ref = { seriesId: id, index: s.rows[j]! }
    const c = crisp(center)
    const median = toValue(b.median)
    info.set(key, { seriesId: id, position: j })
    anchors[j] = vertical ? { x: center, y: median } : { x: median, y: center }
    const mid = crisp(median)
    if (b.density && maxDensity > 0) {
      const left = b.density.map(p => at(c - (p.density / maxDensity) * (width / 2), toValue(p.value)))
      const right = [...b.density].reverse().map(p => at(c + (p.density / maxDensity) * (width / 2), toValue(p.value)))
      marks.push({ kind: 'path', key, part: 'box', d: `M${left.join('L')}L${right.join('L')}Z`, datum: ref, paint, a11y: { label: '', focusable: true } })
      marks.push({ kind: 'path', key: `${id}:median:${datum}`, part: 'median', d: `M${at(c - width / 4, mid)}L${at(c + width / 4, mid)}`, paint })
      return
    }
    const [lo, q1, q3, hi] = [toValue(b.min), toValue(b.q1), toValue(b.q3), toValue(b.max)]
    const cap = width / 4
    marks.push({
      kind: 'path',
      key: `${id}:whisker:${datum}`,
      part: 'whisker',
      d: `M${at(c, hi)}L${at(c, q3)}M${at(c, q1)}L${at(c, lo)}M${at(c - cap, crisp(hi))}L${at(c + cap, crisp(hi))}M${at(c - cap, crisp(lo))}L${at(c + cap, crisp(lo))}`,
      paint,
    })
    const [top, bottom] = [Math.min(q1, q3), Math.max(q1, q3)]
    const span = Math.max(1, bottom - top)
    marks.push({
      kind: 'rect',
      key,
      part: 'box',
      ...(vertical ? { x: c - width / 2, y: top, width, height: span } : { x: top, y: c - width / 2, width: span, height: width }),
      cornerRadius: Math.min(metrics.radius, width / 2, span / 2),
      orientation: vertical ? 'vertical' : 'horizontal',
      // 箱体悬在上下四分位之间，不贴基线：四角都圆
      baseline: 'none',
      datum: ref,
      paint,
      a11y: { label: '', focusable: true },
    })
    marks.push({ kind: 'path', key: `${id}:median:${datum}`, part: 'median', d: `M${at(c - width / 2, mid)}L${at(c + width / 2, mid)}`, paint })
    b.outliers.forEach((v, i) => {
      const across = toValue(v)
      marks.push({ kind: 'symbol', key: `${id}:outlier:${datum}:${i}`, part: 'outlier', ...(vertical ? { x: center, y: across } : { x: across, y: center }), size: outlierSize, symbol: 'circle', paint })
    })
  })
  return marks
}

/**
 * K 线：每个键一根。蜡烛是影线（最低到最高）加实体（开盘到收盘，至少一像素高，十字星也看得见）；
 * 美国线是一条竖线加左开右收两道短横。收盘不低于开盘为涨、低于开盘为跌，写在 paint.trend 上。
 * 实体的宽度取键间距的七成，不超过柱厚上限；焦点与命中落在实体（美国线落在整根线）上，锚点是收盘价。
 */
function candleMarks(
  layout: CartesianLayout,
  s: CartesianSeriesValues,
  paint: MarkPaint,
  anchors: ({ x: number, y: number } | null)[],
  info: Map<string, CartesianMarkInfo>,
): Mark[] {
  const { domains, metrics, keyCenters } = layout
  const { spec } = domains.derived
  const vertical = spec.orientation === 'vertical'
  const id = s.spec.id
  const ohlc = s.spec.ohlc!
  const width = Math.max(1, Math.min(metrics.barMax, keyStep(layout) * 0.7))
  const toValue = (v: number): number => layout.valueScale.map(v) ?? Number.NaN
  const at = (along: number, across: number): string => (vertical ? `${along},${across}` : `${across},${along}`)
  const marks: Mark[] = []
  s.ohlc!.forEach((o, j) => {
    const center = keyCenters[j]!
    if (!o || !Number.isFinite(center))
      return
    const [open, high, low, close] = [toValue(o.open), toValue(o.high), toValue(o.low), toValue(o.close)]
    if (![open, high, low, close].every(Number.isFinite))
      return
    const datum = cartesianDatumId(spec.keys[j]!)
    const key = `${id}:${datum}`
    const trend: 'rise' | 'fall' = o.close >= o.open ? 'rise' : 'fall'
    const own = { ...paint, trend }
    const ref = { seriesId: id, index: s.rows[j]! }
    info.set(key, { seriesId: id, position: j })
    anchors[j] = vertical ? { x: center, y: close } : { x: close, y: center }
    // 影线对齐到像素中心，实体与短横以同一个中心摆放：两者严格对中
    const c = crisp(center)
    if (ohlc.style === 'ohlc') {
      const d = `M${at(c, high)}L${at(c, low)}M${at(c - width / 2, open)}L${at(c, open)}M${at(c, close)}L${at(c + width / 2, close)}`
      marks.push({ kind: 'path', key, part: 'candle', d, datum: ref, paint: own, a11y: { label: '', focusable: true } })
      return
    }
    marks.push({ kind: 'path', key: `${id}:wick:${datum}`, part: 'wick', d: `M${at(c, high)}L${at(c, low)}`, paint: own })
    const [lo, hi] = [Math.min(open, close), Math.max(open, close)]
    const span = Math.max(1, hi - lo)
    const start = c - width / 2
    marks.push({
      kind: 'rect',
      key,
      part: 'candle',
      ...(vertical ? { x: start, y: lo, width, height: span } : { x: lo, y: start, width: span, height: width }),
      orientation: vertical ? 'vertical' : 'horizontal',
      datum: ref,
      paint: own,
      a11y: { label: '', focusable: true },
    })
  })
  return marks
}

/**
 * 瀑布的连接线：上一步的终点与下一步的起点同高，一道细线把两根柱连起来，读者顺着它看出累计是怎么走的。
 * 缺失的一步跳过，连到下一根画出来的柱。
 */
function waterfallConnectors(
  s: CartesianSeriesValues,
  keys: readonly ChartKey[],
  bars: ReadonlyMap<string, BarBox>,
  toValue: (v: number) => number,
  vertical: boolean,
): PathMark[] {
  const id = s.spec.id
  const marks: PathMark[] = []
  let previous: { box: BarBox, level: number, datum: string } | null = null
  s.steps!.forEach((step, j) => {
    const datum = cartesianDatumId(keys[j]!)
    const box = step ? bars.get(`${id}:${datum}`) : undefined
    if (!step || !box)
      return
    if (previous) {
      const at = crisp(previous.level)
      const from = previous.box
      marks.push({
        kind: 'path',
        key: `${id}:link:${previous.datum}`,
        part: 'connector',
        d: vertical ? `M${from.x + from.width},${at}L${box.x},${at}` : `M${at},${from.y + from.height}L${at},${box.y}`,
      })
    }
    previous = { box, level: toValue(step.end), datum }
  })
  return marks
}

/* ---------- 注释 ---------- */

/** 注释的产物：垫在数据下的参考带、压在数据上的线与点、待落位的标签，以及每个标记归哪种注释。 */
interface CartesianAnnotationMarks {
  readonly back: Mark[]
  readonly front: Mark[]
  readonly labels: LabelCandidate[]
  readonly info: Map<string, CartesianAnnotationInfo>
}

/** 趋势线移动平均的缺省窗口。 */
const TREND_WINDOW = 3

/** 注释的标签排在数据标签之前落位：数据标签挤不下时让给注释。 */
const ANNOTATION_LABEL_PRIORITY = 4

/**
 * 注释指向的系列不存在、指向的类目不在轴上时报出来：这条注释不画，图照常画。
 * 系列被图例隐藏不算：那是读者的操作，注释随系列一起收起。
 */
export function cartesianAnnotationIssues(spec: CartesianSpec, annotations: readonly CartesianAnnotation[]): ChartSpecIssue[] {
  const issues: ChartSpecIssue[] = []
  const ids = new Set(spec.series.map(s => s.id))
  const category = spec.keyScale === 'band' || spec.keyScale === 'point'
  const onAxis = (value: unknown): boolean => {
    const id = cartesianKeyId(value)
    return id != null && spec.keyIndex.has(id)
  }
  annotations.forEach((a, index) => {
    if (a.kind === 'point' || a.kind === 'average' || a.kind === 'trend') {
      if (!ids.has(a.series))
        issues.push({ code: DIAGNOSTIC_CODES.chartAnnotationTarget, message: `注释指向的系列「${a.series}」不存在`, detail: { index, series: a.series } })
      if (a.kind === 'point' && typeof a.at === 'object' && !onAxis(a.at.x))
        issues.push({ code: DIAGNOSTIC_CODES.chartAnnotationTarget, message: '注释要标出的 x 不在自变量轴上', detail: { index, x: a.at.x } })
      return
    }
    if (a.axis !== 'x' || !category)
      return
    const keys = a.kind === 'line' ? [a.value] : [a.from, a.to]
    for (const key of keys) {
      if (!onAxis(key))
        issues.push({ code: DIAGNOSTIC_CODES.chartAnnotationTarget, message: `注释指向的类目「${String(key)}」不在自变量轴上`, detail: { index, key } })
    }
  })
  return issues
}

/**
 * 注释的几何：参考线横跨（纵贯）绘图区，参考带铺满另一个方向；标出的点画一圈环；平均线是系列均值处的一条线；
 * 趋势线是最小二乘直线或移动平均折线。标签缺省写值，与数据标签一起按重要性落位，注释优先。
 * 指向隐藏系列、不在轴上的注释不画（后者由规格那一段报诊断）。
 */
function cartesianAnnotations(
  layout: CartesianLayout,
  anchors: ReadonlyMap<string, readonly ({ x: number, y: number } | null)[]>,
): CartesianAnnotationMarks {
  const { domains, plot, metrics, formats, font, measurer, annotations, averageLabel } = layout
  const { spec, visible } = domains.derived
  const vertical = spec.orientation === 'vertical'
  const gap = metrics.labelGap
  const out: CartesianAnnotationMarks = { back: [], front: [], labels: [], info: new Map() }
  if (annotations.length === 0)
    return out
  const category = isCategoryScale(layout.keyScale)
  const time = spec.keyScale === 'time' || spec.keyScale === 'utc'
  const step = category ? ((layout.keyScale as { step?: number }).step ?? layout.bandwidth) : 0
  const [valueLo, valueHi] = [Math.min(...layout.valueScale.range), Math.max(...layout.valueScale.range)]
  const clampAcross = (v: number): number => Math.min(valueHi, Math.max(valueLo, v))

  // 数值轴上的一个值 → 像素；自变量轴上的一个键（或它的数值）→ 像素中心
  const valueAt = (v: unknown): number => {
    const n = v instanceof Date ? v.valueOf() : v
    return typeof n === 'number' && Number.isFinite(n) ? layout.valueScale.map(n) ?? Number.NaN : Number.NaN
  }
  const keyAt = (k: unknown): number => {
    if (category) {
      const id = cartesianKeyId(k)
      const j = id == null ? undefined : spec.keyIndex.get(id)
      return j == null ? Number.NaN : layout.keyCenters[j]!
    }
    const n = k instanceof Date ? k.valueOf() : k
    if (typeof n !== 'number' || !Number.isFinite(n))
      return Number.NaN
    return (layout.keyScale.map as (v: unknown) => number | undefined)(time ? new Date(n) : n) ?? Number.NaN
  }
  /** 一个位置在趋势计算里的横坐标：类目轴取键的序号，连续轴取键的数值。 */
  const trendX = (s: CartesianSeriesValues, p: number): number => {
    const j = s.keyAt ? s.keyAt[p]! : p
    if (category)
      return j
    const key = spec.keys[j]!
    return key instanceof Date ? key.valueOf() : Number(key)
  }
  const trendAlong = (x: number): number => (category ? layout.keyCenters[Math.round(x)] ?? Number.NaN : keyAt(x))
  const pointOf = (along: number, across: number): { x: number, y: number } => (vertical ? { x: along, y: across } : { x: across, y: along })

  /** 标签：主落点越出视口（线或点贴着上沿、右沿）时改用备选落点，翻到线或点的另一侧。 */
  const label = (key: string, text: CartesianLabelValue, at: LabelAt, fallback?: LabelAt): void => {
    const shown = text.format(text.value)
    const width = measurer.measure(shown, font).width
    const boxOf = ([x, y, anchor, baseline]: LabelAt): ChartLabelBox => labelBox(x, y, width, font.lineHeight, anchor, baseline)
    const fits = (box: ChartLabelBox): boolean => box.x >= 0 && box.y >= 0 && box.x + box.width <= layout.size.width && box.y + box.height <= layout.size.height
    const chosen = fallback && !fits(boxOf(at)) ? fallback : at
    const [x, y, anchor, baseline] = chosen
    out.labels.push({
      mark: { kind: 'text', key, part: 'annotation-label', x, y, text: shown, anchor, baseline },
      box: boxOf(chosen),
      priority: ANNOTATION_LABEL_PRIORITY,
      placement: 'end',
      label: text,
    })
  }
  const fixed = (text: string): CartesianLabelValue => ({ value: 0, format: () => text })
  const twoPoints = (key: string, a: { x: number, y: number }, b: { x: number, y: number }): LineMark => ({
    kind: 'line',
    key,
    part: 'annotation',
    curve: 'linear',
    points: [{ key: 'a', ...a }, { key: 'b', ...b }],
  })
  /** 一条横跨（纵贯）绘图区的线：cross 为真时它沿自变量方向铺开（落在数值轴上的某个值处）。 */
  const spanLine = (key: string, at: number, onValueAxis: boolean): LineMark => {
    const horizontal = onValueAxis === vertical
    const c = crisp(at)
    return horizontal
      ? twoPoints(key, { x: plot.x, y: c }, { x: plot.x + plot.width, y: c })
      : twoPoints(key, { x: c, y: plot.y }, { x: c, y: plot.y + plot.height })
  }
  /** 线的标签：横线写在右端的上方（贴着上沿时写在下方），竖线写在上端的右侧（贴着右沿时写在左侧）。 */
  const spanLabelAt = (at: number, onValueAxis: boolean): [LabelAt, LabelAt] => (onValueAxis === vertical
    ? [[plot.x + plot.width - gap, at - gap, 'end', 'bottom'], [plot.x + plot.width - gap, at + gap, 'end', 'top']]
    : [[at + gap, plot.y + gap, 'start', 'top'], [at - gap, plot.y + gap, 'end', 'top']])

  annotations.forEach((a, index) => {
    const key = `annotation:${index}`
    const labelKey = `annotation-label:${index}`
    if (a.kind === 'line') {
      const onValueAxis = a.axis === 'y'
      const at = onValueAxis ? valueAt(a.value) : keyAt(a.value)
      if (!Number.isFinite(at))
        return
      out.front.push(spanLine(key, at, onValueAxis))
      out.info.set(key, { kind: 'line', seriesId: null })
      const n = a.value instanceof Date ? a.value.valueOf() : a.value
      const text: CartesianLabelValue = a.label != null
        ? fixed(a.label)
        : onValueAxis && typeof n === 'number'
          ? { value: n, format: formats.value }
          : fixed(formats.key(a.value))
      label(labelKey, text, ...spanLabelAt(at, onValueAxis))
      out.info.set(labelKey, { kind: 'line', seriesId: null })
      return
    }
    if (a.kind === 'band') {
      const onValueAxis = a.axis === 'y'
      let [from, to] = onValueAxis ? [valueAt(a.from), valueAt(a.to)] : [keyAt(a.from), keyAt(a.to)]
      if (!Number.isFinite(from) || !Number.isFinite(to))
        return
      // 类目轴上的参考带盖满两端类目的整条带
      if (!onValueAxis && category) {
        const [lo, hi] = [Math.min(from, to), Math.max(from, to)]
        ;[from, to] = [lo - step / 2, hi + step / 2]
      }
      const lo = Math.min(from, to)
      const hi = Math.max(from, to)
      const horizontal = onValueAxis === vertical
      const rect = horizontal
        ? { x: plot.x, y: Math.max(plot.y, lo), width: plot.width, height: Math.max(0, Math.min(plot.y + plot.height, hi) - Math.max(plot.y, lo)) }
        : { x: Math.max(plot.x, lo), y: plot.y, width: Math.max(0, Math.min(plot.x + plot.width, hi) - Math.max(plot.x, lo)), height: plot.height }
      out.back.push({ kind: 'rect', key, part: 'annotation', ...rect })
      out.info.set(key, { kind: 'band', seriesId: null })
      const format = (v: unknown): string => (onValueAxis && typeof v === 'number' ? formats.value(v) : formats.key(v as ChartKey))
      const toNumber = (v: unknown): unknown => (v instanceof Date && onValueAxis ? v.valueOf() : v)
      label(labelKey, fixed(a.label ?? `${format(toNumber(a.from))} – ${format(toNumber(a.to))}`), [rect.x + gap, rect.y + gap, 'start', 'top'])
      out.info.set(labelKey, { kind: 'band', seriesId: null })
      return
    }
    const s = visible.find(v => v.spec.id === a.series)
    if (!s)
      return
    const seriesAnchors = anchors.get(s.spec.id) ?? []
    const present = s.values.map((v, p) => (v == null ? -1 : p)).filter(p => p >= 0)
    if (present.length === 0)
      return
    if (a.kind === 'point') {
      let p = -1
      if (a.at === 'last') {
        p = present.at(-1)!
      }
      else if (a.at === 'max' || a.at === 'min') {
        const sign = a.at === 'max' ? 1 : -1
        p = present.reduce((best, q) => (sign * s.values[q]! > sign * s.values[best]! ? q : best), present[0]!)
      }
      else {
        const id = cartesianKeyId(a.at.x)
        const j = id == null ? undefined : spec.keyIndex.get(id)
        p = j == null ? -1 : s.keyAt ? s.keyAt.indexOf(j) : j
      }
      const anchor = p < 0 || s.values[p] == null ? null : seriesAnchors[p]
      if (!anchor)
        return
      const r = metrics.pointSize / 2 + metrics.gap * 2
      out.front.push({ kind: 'symbol', key, part: 'annotation', x: anchor.x, y: anchor.y, size: Math.PI * r * r, symbol: 'circle' })
      out.info.set(key, { kind: 'point', seriesId: s.spec.id })
      const value = s.values[p]!
      const text: CartesianLabelValue = a.label != null ? fixed(a.label) : { value, format: formats.value }
      label(
        labelKey,
        text,
        vertical ? [anchor.x, anchor.y - r - gap, 'middle', 'bottom'] : [anchor.x + r + gap, anchor.y, 'start', 'middle'],
        vertical ? [anchor.x, anchor.y + r + gap, 'middle', 'top'] : [anchor.x - r - gap, anchor.y, 'end', 'middle'],
      )
      out.info.set(labelKey, { kind: 'point', seriesId: s.spec.id })
      return
    }
    if (a.kind === 'average') {
      let sum = 0
      for (const p of present)
        sum += s.values[p]!
      const mean = sum / present.length
      const at = valueAt(mean)
      if (!Number.isFinite(at))
        return
      out.front.push(spanLine(key, at, true))
      out.info.set(key, { kind: 'average', seriesId: s.spec.id })
      const own = a.label
      label(labelKey, { value: mean, format: v => own ?? `${averageLabel} ${formats.value(v)}` }, ...spanLabelAt(at, true))
      out.info.set(labelKey, { kind: 'average', seriesId: s.spec.id })
      return
    }
    // 趋势线：最小二乘直线从最左画到最右；移动平均沿每个位置一个点，凑不满窗口的位置断开
    let line: LineMark | null = null
    if (a.method === 'linear') {
      const fit = linearRegression(present.map(p => ({ x: trendX(s, p), y: s.values[p]! })))
      if (!fit)
        return
      const xs = present.map(p => trendX(s, p))
      const [x0, x1] = [Math.min(...xs), Math.max(...xs)]
      const a0 = pointOf(trendAlong(x0), clampAcross(valueAt(fit.predict(x0))))
      const a1 = pointOf(trendAlong(x1), clampAcross(valueAt(fit.predict(x1))))
      if (![a0.x, a0.y, a1.x, a1.y].every(Number.isFinite))
        return
      line = twoPoints(key, a0, a1)
    }
    else {
      const smooth = movingAverage(s.values, Math.max(1, Math.floor(a.window ?? TREND_WINDOW)))
      const points: KeyedPoint[] = s.values.map((_, p) => {
        const v = smooth[p]
        const at = pointOf(trendAlong(trendX(s, p)), v == null ? Number.NaN : valueAt(v))
        return { key: s.pointIds?.[p] ?? cartesianDatumId(spec.keys[p]!), x: at.x, y: at.y, defined: v != null && Number.isFinite(at.x) && Number.isFinite(at.y) }
      })
      line = { kind: 'line', key, part: 'annotation', curve: 'linear', points }
    }
    out.front.push(line)
    out.info.set(key, { kind: 'trend', seriesId: s.spec.id, method: a.method })
    const last = [...line.points].reverse().find(p => p.defined !== false)
    if (a.label != null && last)
      label(labelKey, fixed(a.label), vertical ? [last.x, last.y - gap, 'end', 'bottom'] : [last.x + gap, last.y, 'start', 'middle'])
    out.info.set(labelKey, { kind: 'trend', seriesId: s.spec.id })
  })
  return out
}

/** 一根柱在绘图区里的矩形，以及写标签要知道的事：远端朝上（右）还是朝下（左）、是不是堆叠中的一段。 */
interface BarBox extends Rect {
  /** 远端朝上（竖向）或朝右（横向）。 */
  readonly positive: boolean
  readonly stacked: boolean
  readonly row: number
}

type LabelAnchor = 'start' | 'middle' | 'end'
type LabelBaseline = 'top' | 'middle' | 'bottom'
type LabelAt = readonly [number, number, LabelAnchor, LabelBaseline]

interface LabelCandidate {
  readonly mark: TextMark
  readonly box: ChartLabelBox
  readonly priority: number
  readonly placement: 'inside' | 'end'
  readonly label: CartesianLabelValue
}

/**
 * 数据标签、堆叠合计与线尾标签，写在前景层。按重要性落位：合计最先，其次线尾标签，最后逐个数据的标签；
 * 与已落位的重叠、越出视口就不写。柱内的标签放不下（字比柱宽、比柱短）不写。
 */
function cartesianLabels(
  layout: CartesianLayout,
  bars: ReadonlyMap<string, BarBox>,
  anchors: ReadonlyMap<string, readonly ({ x: number, y: number } | null)[]>,
  extra: readonly LabelCandidate[],
): { marks: Mark[], placements: ReadonlyMap<string, 'inside' | 'end'>, values: ReadonlyMap<string, CartesianLabelValue> } {
  const { domains, metrics, font, formats, measurer, size, plot } = layout
  const { spec, visible } = domains.derived
  const vertical = spec.orientation === 'vertical'
  const gap = metrics.labelGap
  const lineHeight = font.lineHeight
  const half = metrics.pointSize / 2
  const candidates: LabelCandidate[] = []
  const widthOf = (text: string): number => measurer.measure(text, font).width
  const add = (
    key: string,
    part: string,
    label: CartesianLabelValue,
    at: LabelAt,
    placement: 'inside' | 'end',
    priority: number,
    extra: Partial<Pick<TextMark, 'datum' | 'paint'>> = {},
  ): void => {
    const [x, y, anchor, baseline] = at
    // 缩放后窗外的数据不写标签：标签落在绘图区（外扩一行字高）之外就不要
    if (layout.clipped && !(x >= plot.x - lineHeight && x <= plot.x + plot.width + lineHeight && y >= plot.y - lineHeight && y <= plot.y + plot.height + lineHeight))
      return
    const text = label.format(label.value)
    candidates.push({
      mark: { kind: 'text', key, part, x, y, text, anchor, baseline, ...extra },
      box: labelBox(x, y, widthOf(text), lineHeight, anchor, baseline),
      priority,
      placement,
      label,
    })
  }
  const valueOf = (value: number): CartesianLabelValue => ({ value, format: formats.value })
  // 柱内放得下：字不比柱厚宽，柱长容得下一行字与两端的间隙
  const fits = (text: string, box: BarBox): boolean => {
    const width = widthOf(text)
    return vertical
      ? width + 2 <= box.width && lineHeight + gap * 2 <= box.height
      : lineHeight + 2 <= box.height && width + gap * 2 <= box.width
  }
  const outside = (box: BarBox): LabelAt => {
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    if (vertical)
      return box.positive ? [cx, box.y - gap, 'middle', 'bottom'] : [cx, box.y + box.height + gap, 'middle', 'top']
    return box.positive ? [box.x + box.width + gap, cy, 'start', 'middle'] : [box.x - gap, cy, 'end', 'middle']
  }

  for (const s of visible) {
    const id = s.spec.id
    const paint = { ...(s.spec.slot != null ? { slot: s.spec.slot } : {}), ...(s.spec.tone != null ? { tone: s.spec.tone } : {}) }
    if (s.spec.mark === 'bar' && s.spec.labels !== 'none') {
      spec.keys.forEach((k, j) => {
        const key = `${id}:${cartesianDatumId(k)}`
        const box = bars.get(key)
        const v = s.values[j]
        if (!box || v == null)
          return
        const text = formats.value(v)
        const datum = { seriesId: id, index: box.row }
        const cx = box.x + box.width / 2
        const cy = box.y + box.height / 2
        if (s.spec.labels === 'inside' || box.stacked) {
          if (!fits(text, box))
            return
          // 堆叠中的段写 end：段外是下一段，写在段内的远端
          const at: LabelAt = s.spec.labels === 'inside'
            ? [cx, cy, 'middle', 'middle']
            : vertical
              ? (box.positive ? [cx, box.y + gap, 'middle', 'top'] : [cx, box.y + box.height - gap, 'middle', 'bottom'])
              : (box.positive ? [box.x + box.width - gap, cy, 'end', 'middle'] : [box.x + gap, cy, 'start', 'middle'])
          add(`label:${key}`, 'data-label', valueOf(v), at, 'inside', 1, { datum, paint })
        }
        else {
          add(`label:${key}`, 'data-label', valueOf(v), outside(box), 'end', 1, { datum, paint })
        }
      })
    }
    if (s.spec.mark === 'line' && s.spec.labels === 'end') {
      anchors.get(id)?.forEach((p, j) => {
        const v = s.values[j]
        if (!p || v == null)
          return
        const at: LabelAt = vertical
          ? [p.x, p.y - half - gap, 'middle', 'bottom']
          : [p.x + half + gap, p.y, 'start', 'middle']
        add(`label:${id}:${cartesianDatumId(spec.keys[j]!)}`, 'data-label', valueOf(v), at, 'end', 1, { datum: { seriesId: id, index: s.rows[j]! }, paint })
      })
    }
  }

  if (layout.totals) {
    for (const [stack, group] of stackTotals(domains.derived)) {
      spec.keys.forEach((k, j) => {
        for (const sign of ['positive', 'negative'] as const) {
          const sum = group[sign][j]
          if (sum == null)
            continue
          const boxes = group.members
            .filter(m => m.values[j] != null && (sign === 'positive' ? m.values[j]! >= 0 : m.values[j]! < 0))
            .map(m => bars.get(`${m.spec.id}:${cartesianDatumId(k)}`))
            .filter((b): b is BarBox => b != null)
          const first = boxes[0]
          if (!first)
            continue
          // 这一侧最外层那段的远端：把它收成一条零宽（零高）的边，外侧落位与单根柱相同
          const edge: BarBox = vertical
            ? (first.positive
                ? { ...first, y: Math.min(...boxes.map(b => b.y)), height: 0 }
                : { ...first, y: Math.max(...boxes.map(b => b.y + b.height)), height: 0 })
            : (first.positive
                ? { ...first, x: Math.max(...boxes.map(b => b.x + b.width)), width: 0 }
                : { ...first, x: Math.min(...boxes.map(b => b.x)), width: 0 })
          add(`total:${stack}:${cartesianDatumId(k)}:${sign === 'positive' ? '+' : '-'}`, 'total-label', valueOf(sum), outside(edge), 'end', 3)
        }
      })
    }
  }

  // 线尾标签写在最后一个点的右边；竖向时几条线挤在一起，上下推开，挤不下去掉末值最小的。
  // 有标签被推离了线尾的高度，整列往右挪出一段，被推开的用引导线连回线尾
  const ends: { s: CartesianSeriesValues, label: CartesianLabelValue, x: number, y: number, px: number, py: number, value: number }[] = []
  for (const s of visible) {
    if (!s.spec.endLabel)
      continue
    const label = endLabelText(s, formats)
    const p = label ? anchors.get(s.spec.id)?.[label.index] : null
    if (!label || !p)
      continue
    const last = s.values[label.index]!
    const name = s.spec.name
    ends.push({
      s,
      label: { value: last, format: value => `${name} ${formats.value(value)}` },
      x: p.x + half + gap * 2,
      y: p.y,
      px: p.x,
      py: p.y,
      value: Math.abs(last),
    })
  }
  const settled = vertical ? settleColumn(ends, plot.y + lineHeight / 2, plot.y + plot.height - lineHeight / 2, lineHeight) : ends
  const moved = (end: { y: number, py: number }): boolean => Math.abs(end.y - end.py) > lineHeight / 4
  const run = settled.some(moved) ? gap * 4 : 0
  const leaders = new Map<string, LineMark>()
  for (const end of settled) {
    const id = end.s.spec.id
    const paint = { ...(end.s.spec.slot != null ? { slot: end.s.spec.slot } : {}), ...(end.s.spec.tone != null ? { tone: end.s.spec.tone } : {}) }
    const datum = { seriesId: id, index: 0 }
    const x = end.x + run
    add(`end:${id}`, 'end-label', end.label, [x, end.y, 'start', 'middle'], 'end', 2, { datum, paint })
    if (moved(end)) {
      leaders.set(`end:${id}`, {
        kind: 'line',
        key: `end-leader:${id}`,
        part: 'leader-line',
        curve: 'linear',
        points: [{ key: 'from', x: end.px + half + 1, y: end.py }, { key: 'to', x: x - gap / 2, y: end.y }],
        datum,
        paint,
      })
    }
  }

  candidates.push(...extra)
  const kept = placeWithoutOverlap(candidates, { x: 0, y: 0, width: size.width, height: size.height })
  // 标签没落位，它的引导线也不画
  const lines = kept.map(c => leaders.get(c.mark.key)).filter((line): line is LineMark => line != null)
  return {
    marks: [...lines, ...kept.map(c => c.mark)],
    placements: new Map(kept.map(c => [c.mark.key, c.placement])),
    values: new Map(kept.map(c => [c.mark.key, c.label])),
  }
}

/**
 * 首次出现从哪一帧起跑：折线原样在场，由描线关键帧从头描到尾；数据点原样在场，等笔尖到了由样式淡入；
 * 面积在场但全透明，随描线一起淡入；柱不在场，从基线长出；坐标轴与标签不在场，淡入。
 */
export function cartesianEntryScene(target: Scene): Scene {
  const seed = (marks: readonly Mark[]): Mark[] => marks.flatMap((mark): Mark[] => {
    if (mark.kind === 'group')
      return [{ ...mark, children: seed(mark.children) }]
    if (mark.kind === 'line' || mark.part === 'dot')
      return [mark]
    if (mark.kind === 'area')
      return [{ ...mark, opacity: 0 }]
    return []
  })
  // 标签原样在场，等柱长到或笔尖扫到由样式淡入
  return createScene({ version: 0, layers: { data: seed(target.layers.data), front: target.layers.front }, bounds: target.bounds })
}

/** 柱的标签在柱长到八成多时出现；合计、线尾标签与注释等全部长完、描完再出现。 */
const BAR_LABEL_AT = 0.85
const TOTAL_LABEL_AT = 0.95
const END_LABEL_AT = 1

/**
 * 首次出现时逐个出现的标记在入场进程里的位置（0–1）：
 * 数据点与折线上的标签按从起点量起的折线长度占全长的比例，笔尖扫到时出现（平滑曲线按折线段近似）；
 * 柱的标签等柱快长完，合计与线尾标签最后出现。
 */
export function cartesianRevealAt(target: Scene): ReadonlyMap<string, number> {
  const at = new Map<string, number>()
  // 系列 id → 折线上每个点（按点的 key）的位置
  const along = new Map<string, Map<string, number>>()
  for (const group of target.layers.data) {
    if (group.kind !== 'group')
      continue
    const line = group.children.find((m): m is LineMark => m.kind === 'line')
    if (!line)
      continue
    const id = group.key.slice('series:'.length)
    const lengths = new Map<string, number>()
    let total = 0
    let last: { x: number, y: number } | null = null
    for (const p of line.points) {
      if (p.defined === false) {
        last = null
        continue
      }
      if (last)
        total += Math.hypot(p.x - last.x, p.y - last.y)
      lengths.set(p.key, total)
      last = p
    }
    const fractions = new Map([...lengths].map(([key, length]) => [key, total > 0 ? length / total : 0]))
    along.set(id, fractions)
    const prefix = `${id}:m:`
    for (const mark of group.children) {
      if (mark.part === 'dot' && mark.key.startsWith(prefix)) {
        const fraction = fractions.get(mark.key.slice(prefix.length))
        if (fraction != null)
          at.set(mark.key, fraction)
      }
    }
  }
  for (const mark of target.layers.front) {
    if (mark.part === 'total-label') {
      at.set(mark.key, TOTAL_LABEL_AT)
    }
    else if (mark.part === 'end-label' || mark.part === 'leader-line' || mark.part === 'annotation' || mark.part === 'annotation-label') {
      at.set(mark.key, END_LABEL_AT)
    }
    else if (mark.part === 'data-label') {
      const id = mark.datum?.seriesId
      const fraction = id == null ? undefined : along.get(id)?.get(mark.key.slice(`label:${id}:`.length))
      at.set(mark.key, fraction ?? BAR_LABEL_AT)
    }
  }
  return at
}

/* ---------- 无障碍 ---------- */

/**
 * 摘要里的注释：参考线、参考带与平均线写出名字与值（注释本身对读屏隐藏，信息由摘要承担）；
 * 标出的点与趋势线不写：前者的值在数据表里，后者是由数据推出来的。
 */
function annotationSummaryItems(
  derived: CartesianDerived,
  annotations: readonly CartesianAnnotation[],
  formats: CartesianFormats,
  translations: CartesianChartTranslations,
): CartesianAnnotationSummary[] {
  const items: CartesianAnnotationSummary[] = []
  const text = (axis: 'x' | 'y', v: unknown): string => {
    const n = v instanceof Date && axis === 'y' ? v.valueOf() : v
    return axis === 'y' && typeof n === 'number' ? formats.value(n) : formats.key(v as ChartKey)
  }
  for (const a of annotations) {
    if (a.kind === 'line') {
      items.push({ kind: 'line', label: a.label ?? translations.referenceLabel, series: null, value: text(a.axis, a.value) })
    }
    else if (a.kind === 'band') {
      items.push({ kind: 'band', label: a.label ?? translations.referenceLabel, series: null, value: `${text(a.axis, a.from)} – ${text(a.axis, a.to)}` })
    }
    else if (a.kind === 'average') {
      const s = derived.visible.find(v => v.spec.id === a.series)
      const values = s?.values.filter((v): v is number => v != null) ?? []
      if (!s || values.length === 0)
        continue
      items.push({ kind: 'average', label: a.label ?? translations.averageLabel, series: s.spec.name, value: formats.value(values.reduce((sum, v) => sum + v, 0) / values.length) })
    }
  }
  return items
}

export function cartesianA11y(
  derived: CartesianDerived,
  locale: string,
  translations: CartesianChartTranslations,
  annotations: readonly CartesianAnnotation[],
): { summary: string, table: TableModel, formats: CartesianFormats } {
  const { spec } = derived
  const base = cartesianFormats(spec, locale)
  // 分箱的键在摘要与数据表里写成「起 – 止」
  const bins = new Map<string, number>()
  for (const s of derived.visible) {
    s.ends?.forEach((end, j) => {
      const id = cartesianKeyId(spec.keys[j])
      if (end != null && id != null && !bins.has(id))
        bins.set(id, end)
    })
  }
  const formats: CartesianFormats = bins.size === 0
    ? base
    : { ...base, key: (key) => {
        const end = bins.get(cartesianKeyId(key) ?? '')
        return end == null ? base.key(key) : formatBin(base, key, end)
      } }
  // 规格不合法（id 重复）时也要给出摘要与数据表：同一个 id 只取第一个系列
  const ids = new Set<string>()
  const unique = derived.visible.filter(s => !ids.has(s.spec.id) && ids.add(s.spec.id))
  const series = unique.map(s => ({
    id: s.spec.id,
    name: s.spec.name,
    points: s.keyAt
      ? s.values.map((value, p) => ({ key: spec.keys[s.keyAt![p]!]!, value }))
      : spec.keys.map((key, j) => ({ key, value: s.values[j] ?? null })),
  }))
  const notes = annotationSummaryItems(derived, annotations, formats, translations)
  const summary = [
    translations.summary(buildChartSummary(series, { formatKey: k => formats.key(k as ChartKey), formatValue: v => formats.value(v) })),
    ...(notes.length > 0 ? [translations.annotationSummary(notes)] : []),
  ].join(' ')
  // 含散点时一个 x 上可以有多个点，按键对齐的宽表放不下：改成每个数据一行的长表；K 线一个键四个价，每个价一列
  const table = unique.some(s => s.keyAt)
    ? pointTable(unique, spec, formats, translations)
    : unique.some(s => s.ohlc || s.boxes || s.lows)
      ? statsTable(unique, spec, formats, translations)
      : buildTableModel({
          keyLabel: translations.keyLabel,
          series,
          formatKey: k => formats.key(k as ChartKey),
          formatValue: v => formats.value(v),
          missingText: translations.missingValue,
        })
  return { summary, table, formats }
}

/**
 * K 线、箱线与区间的数据表：首列是自变量，K 线系列开高低收各一列、箱线系列五数与离群点各一列
 * （多个系列时列名带上系列名），区间写成一格「下 – 上」，其余系列各一列。
 */
function statsTable(
  series: readonly CartesianSeriesValues[],
  spec: CartesianSpec,
  formats: CartesianFormats,
  translations: CartesianChartTranslations,
): TableModel {
  const ohlcFields = ['open', 'high', 'low', 'close'] as const
  const boxFields = ['min', 'q1', 'median', 'q3', 'max', 'outliers'] as const
  const many = series.length > 1
  const columns: TableModel['columns'][number][] = [{ id: 'key', label: translations.keyLabel }]
  const label = (s: CartesianSeriesValues, name: string): string => (many ? `${s.spec.name} ${name}` : name)
  for (const s of series) {
    if (s.ohlc) {
      for (const f of ohlcFields)
        columns.push({ id: `${s.spec.id}:${f}`, label: label(s, translations.ohlcColumns[f]) })
    }
    else if (s.boxes) {
      for (const f of boxFields)
        columns.push({ id: `${s.spec.id}:${f}`, label: label(s, translations.boxColumns[f]) })
    }
    else {
      columns.push({ id: s.spec.id, label: s.spec.name })
    }
  }
  const cell = (v: number | null | undefined): TableModel['rows'][number]['cells'][number] =>
    v == null ? { value: null, text: translations.missingValue } : { value: v, text: formats.value(v) }
  return {
    columns,
    rows: spec.keys.map(key => ({
      key,
      cells: [
        { value: key, text: formats.key(key) },
        ...series.flatMap((s) => {
          const j = spec.keyIndex.get(cartesianKeyId(key)!)!
          if (s.ohlc)
            return ohlcFields.map(f => cell(s.ohlc![j]?.[f]))
          const box = s.boxes?.[j]
          if (s.boxes) {
            // 离群点写成一格：逐个列出；没有离群点写空
            const outliers = box?.outliers ?? []
            return [...boxFields.slice(0, 5).map(f => cell(box?.[f as 'min'])), { value: outliers, text: outliers.map(formats.value).join(', ') }]
          }
          // 区间写成一格「下 – 上」
          const low = s.lows?.[j]
          const high = s.values[j]
          if (s.lows)
            return [low == null || high == null ? cell(null) : { value: [low, high], text: `${formats.value(low)} – ${formats.value(high)}` }]
          return [cell(high)]
        }),
      ],
    })),
  }
}

/** 长表：系列、x、y 各一列，有气泡时再加大小一列、按值着色时再加一列；每个有值的数据一行，系列按声明次序、系列内按位置。 */
function pointTable(
  series: readonly CartesianSeriesValues[],
  spec: CartesianSpec,
  formats: CartesianFormats,
  translations: CartesianChartTranslations,
): TableModel {
  const sized = series.some(s => s.sizes)
  const colored = series.some(s => s.colors)
  const cell = (v: number | null | undefined): TableModel['rows'][number]['cells'][number] =>
    v == null ? { value: null, text: translations.missingValue } : { value: v, text: formats.measure(v) }
  const rows: TableModel['rows'][number][] = []
  for (const s of series) {
    s.values.forEach((value, p) => {
      if (value == null)
        return
      const key = spec.keys[s.keyAt ? s.keyAt[p]! : p]!
      rows.push({
        key: `${s.spec.id}:${s.pointIds?.[p] ?? cartesianDatumId(key)}`,
        cells: [
          { value: s.spec.name, text: s.spec.name },
          { value: key, text: formats.key(key) },
          { value, text: formats.value(value) },
          ...(sized ? [cell(s.sizes?.[p])] : []),
          ...(colored ? [cell(s.colors?.[p])] : []),
        ],
      })
    })
  }
  return {
    columns: [
      { id: 'series', label: translations.seriesLabel },
      { id: 'key', label: translations.keyLabel },
      { id: 'value', label: translations.valueLabel },
      ...(sized ? [{ id: 'size', label: translations.sizeLabel }] : []),
      ...(colored ? [{ id: 'color', label: translations.colorLabel }] : []),
    ],
    rows,
  }
}

/* ---------- 管线 ---------- */

export interface CartesianPipelineInput {
  readonly data: readonly ChartRow[] | undefined
  readonly series: readonly CartesianSeries[] | undefined
  readonly xAxis: CartesianAxis | undefined
  readonly yAxis: CartesianAxis | undefined
  readonly orientation: CartesianOrientation | undefined
  readonly hiddenSeries: readonly string[]
  readonly size: ChartSize | null
  readonly metrics: ChartMetrics
  readonly measurer: TextMeasurer
  readonly measurerVersion: number
  readonly locale: string
  readonly translations: CartesianChartTranslations
  readonly totals: boolean | undefined
  readonly annotations: readonly CartesianAnnotation[] | undefined
  readonly zoom: CartesianZoom
  readonly window: CartesianWindow
}

export interface CartesianModel {
  readonly spec: CartesianSpec
  readonly derived: CartesianDerived
  readonly domains: CartesianDomains
  readonly formats: CartesianFormats
  /** 规格不合法的原因；非空时不画标记。 */
  readonly issues: readonly ChartSpecIssue[]
  /** 画得出来但有一部分没画的原因（注释指错了目标）：开发期提醒，不挡住整张图。 */
  readonly warnings: readonly ChartSpecIssue[]
  /** 尚未测量时为 null。 */
  readonly scene: CartesianScene | null
  readonly summary: string
  readonly table: TableModel
  /** 合并后的文案：详情里 K 线的四个价按它写成文字。 */
  readonly translations: CartesianChartTranslations
}

export type CartesianPipeline = (input: CartesianPipelineInput) => CartesianModel

/** 没有注释：同一个空数组，管线各段的记忆不因作者没写而失效。 */
const NO_ANNOTATIONS: readonly CartesianAnnotation[] = Object.freeze([])

/** 建一条管线：每个图表实例一条，放在机器的 refs 里。 */
export function createCartesianPipeline(): CartesianPipeline {
  const normalize = memoizeLast(normalizeCartesianSpec)
  const derive = memoizeLast(deriveCartesian)
  const domainsOf = memoizeLast(cartesianDomains)
  const layoutOf = memoizeLast(layoutCartesian)
  let version = 0
  const sceneOf = memoizeLast((layout: CartesianLayout) => cartesianScene(layout, ++version))
  const a11yOf = memoizeLast(cartesianA11y)
  const warningsOf = memoizeLast(cartesianAnnotationIssues)
  // 隐藏系列按内容记忆：受控时作者可能每次给一个新数组，内容没变不该重算
  const hiddenOf = memoizeLast((key: string): readonly string[] => JSON.parse(key) as string[])
  return (input) => {
    const spec = normalize(input.data, input.series, input.xAxis, input.yAxis, input.orientation)
    const derived = derive(spec, hiddenOf(JSON.stringify([...input.hiddenSeries].sort())))
    const annotations = input.annotations ?? NO_ANNOTATIONS
    const domains = domainsOf(derived, annotations)
    const a11y = a11yOf(derived, input.locale, input.translations, annotations)
    const issues = [...spec.issues, ...derived.issues, ...domains.issues]
    const scene = input.size == null || issues.length > 0
      ? null
      : sceneOf(layoutOf(domains, input.size, input.metrics, input.measurer, input.measurerVersion, input.locale, input.totals === true, annotations, input.translations.averageLabel, input.zoom, input.window))
    return { spec, derived, domains, formats: a11y.formats, issues, warnings: warningsOf(spec, annotations), scene, summary: a11y.summary, table: a11y.table, translations: input.translations }
  }
}
