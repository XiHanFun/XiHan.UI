/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 列式数据的大数据管线：规格校验 → 列视图与极值索引 → 定义域 → 布局 → SVG 两层（坐标轴、注释、系列分组与样式探针）
// → 画布图层（降采样后的像素坐标）→ 摘要与数据表。全程在类型化数组上做，不为每个点建对象、不拼身份串；
// 拾取、导航、详情与提示框在原始列上按需算，悬停与聚焦不让任何一段重算。

import type { AxisLayout, AxisScale, ContinuousScale, FontSpec, Mark, MarkPaint, Rect, Scene, TableModel, TextMeasurer, TimeIntervalSet, TimeScale } from '@xihan-ui/viz'
import type { StepMode } from '@xihan-ui/viz/canvas'
import type { ColumnSource, ExtentIndex } from '@xihan-ui/viz/columns'
import type { ChartDatumDetails, ChartDatumRef, ChartKey, ChartMetrics, ChartSize, ChartSpecIssue, ChartSummary, ChartSummaryPoint } from '../shared/chart'
import type { CartesianAnnotationInfo, CartesianFormats, CartesianSeriesSpec, CartesianSpec } from './cartesian-chart.model'
import type {
  CartesianAnnotation,
  CartesianAxis,
  CartesianChartTranslations,
  CartesianOrientation,
  CartesianSeries,
  CartesianWindow,
  CartesianWindowRatio,
  CartesianZoom,
} from './cartesian-chart.types'
import { DIAGNOSTIC_CODES } from '@xihan-ui/core'
import {
  createScene,
  createTimeFormat,
  FULL_WINDOW,
  indexRangeToWindow,
  inferDomain,
  isFullWindow,
  isVizError,
  localIntervals,
  scaleLinear,
  scaleTime,
  scaleUtc,
  solvePlotRect,
  timeTickInterval,
  utcIntervals,
  windowToDomain,
} from '@xihan-ui/viz'
import {
  bisectLeft,
  bisectRight,
  bucketOhlc,
  bucketPeak,
  bucketSize,
  createExtentIndex,
  createPointIndex,
  decimateLine,
  isAscending,
  nearestIndex,
  ordinalTimeTicks,
  thinPoints,
} from '@xihan-ui/viz/columns'
import { chartPageSize } from '../shared/chart'
import { zonedTimeIntervals } from '../shared/chart/time-zone'
import { axisMarks, axisTimeZone, cartesianKeyId, colorPosition, continuousScaleOf, crisp, gridLine, isDateFormat, normalizeCartesianSpec, perScale, ratioOf } from './cartesian-chart.model'
import { cartesianProbesOf } from './cartesian-chart.probe'

/* ---------- 规格 ---------- */

/** 列式数据的规格：系列的身份、色槽与画法沿用对象数组那一套，另外记下自变量怎么排。 */
export interface CartesianColumnsSpec {
  /** 与对象数组同形的规格：系列、坐标轴配置与比例尺种类；没有行，也没有类目键。 */
  readonly base: CartesianSpec
  readonly source: ColumnSource
  /** 规格不合法的原因：写法不支持、字段不存在、共用的自变量不一致。 */
  readonly issues: readonly ChartSpecIssue[]
  /** 折线、K 线与柱共用的自变量字段；只有散点时为 null。 */
  readonly keyField: string | null
  /** 自变量是时间（time / utc）：键写成 Date。 */
  readonly time: boolean
  /** 按数据点等距排列（交易时段）。 */
  readonly ordinal: boolean
}

/** 列式数据下自变量轴的比例尺：连续的时间或数值。 */
const KEY_SCALES = new Set(['time', 'utc', 'linear'])

/** 列式数据下注释支持的种类：参考线、参考带与标出的点。 */
const ANNOTATION_KINDS = new Set(['line', 'band', 'point'])

export interface CartesianColumnsOptions {
  readonly renderer: string | undefined
  readonly brush: string | undefined
  readonly totals: boolean | undefined
  readonly annotations: readonly CartesianAnnotation[]
}

/** 系列在列式数据里要读的字段。 */
function fieldsOf(s: CartesianSeries): (string | undefined)[] {
  switch (s.mark) {
    case 'scatter':
      return [s.x, s.y, s.size, s.color]
    case 'candlestick':
      return [s.x, s.open, s.high, s.low, s.close]
    case 'bar':
      return [...(typeof s.x === 'string' ? [s.x] : s.x), ...(typeof s.y === 'string' ? [s.y] : s.y), ...(s.trend ?? [])]
    case 'line':
      return [s.x, ...(typeof s.y === 'string' ? [s.y] : s.y)]
    default:
      return typeof s.y === 'string' ? [s.x, s.y] : [s.x, ...Object.values(s.y)]
  }
}

/** 这个系列用了列式数据不支持的写法：返回说明，支持时为 null。 */
function unsupported(s: CartesianSeries): string | null {
  if (s.mark === 'boxplot')
    return '箱线要按组求统计量，列式数据不支持；先聚合成对象数组再画'
  if (s.mark === 'bar') {
    if (s.stack != null)
      return '列式数据的柱不堆叠'
    if (s.waterfall)
      return '列式数据不画瀑布'
    if (typeof s.x !== 'string')
      return '列式数据不画分箱的柱（直方图）：先用 bin() 聚合'
    if (typeof s.y !== 'string')
      return '列式数据不画区间柱'
    if (s.shape === 'lollipop')
      return '列式数据不画棒棒糖'
    if (s.labels != null && s.labels !== 'none')
      return '列式数据不写逐点的数据标签'
  }
  if (s.mark === 'line') {
    if (s.stack != null)
      return '列式数据的折线不堆叠'
    if (s.labels != null && s.labels !== 'none')
      return '列式数据不写逐点的数据标签'
    if (s.curve === 'monotone')
      return '列式数据不做单调平滑：降采样后的点再平滑会画出数据里没有的起伏'
    if (s.symbols === 'always')
      return '列式数据不逐点画点：要看每个点用散点系列'
    if (s.endLabel)
      return '列式数据不写线尾标签：要标出最新值，用 at 为 last 的 point 注释'
  }
  if (s.mark === 'scatter' && (s.jitter ?? 0) > 0)
    return '列式数据的自变量是连续轴，没有类目可抖动'
  return null
}

/** 校验列式数据的规格：写法、字段、共用的自变量与坐标轴。 */
export function normalizeColumnsSpec(
  source: ColumnSource,
  input: readonly CartesianSeries[] | undefined,
  xAxis: CartesianAxis | undefined,
  yAxis: CartesianAxis | undefined,
  orientation: CartesianOrientation | undefined,
  options: CartesianColumnsOptions,
): CartesianColumnsSpec {
  const seriesInput = input ?? []
  const shaped = normalizeCartesianSpec([], seriesInput, xAxis, yAxis, orientation)
  const keyScale = xAxis?.scale ?? 'linear'
  const base: CartesianSpec = { ...shaped, keyScale }
  const issues: ChartSpecIssue[] = [...shaped.issues]
  const bad = (message: string, detail: Record<string, unknown> = {}): void => {
    issues.push({ code: DIAGNOSTIC_CODES.chartColumnsOption, message, detail })
  }
  if (options.renderer === 'svg')
    bad('列式数据总是画在画布上：renderer 不能写 svg', { renderer: options.renderer })
  if (orientation === 'horizontal')
    bad('列式数据只画竖向的图', { orientation })
  if (!KEY_SCALES.has(keyScale))
    bad('列式数据的自变量轴只能是 time、utc 或 linear', { scale: keyScale })
  if (options.brush != null && options.brush !== 'none')
    bad('列式数据不支持刷选：刷选要回报框里的每一个数据', { brush: options.brush })
  if (options.totals)
    bad('列式数据的柱不堆叠，没有合计可写', { totals: true })
  for (const a of options.annotations) {
    if (!ANNOTATION_KINDS.has(a.kind))
      bad('列式数据的注释只支持参考线、参考带与标出的点', { kind: a.kind })
    if (a.kind === 'point' && a.at !== 'max' && a.at !== 'min' && a.at !== 'last' && typeof a.at !== 'object')
      bad('标出的点写 max、min、last 或 { x }', { at: a.at })
  }
  const known = new Set(source.fields)
  const keys = new Set<string>()
  for (const s of seriesInput) {
    const reason = unsupported(s)
    if (reason)
      bad(reason, { series: s.id ?? null, mark: s.mark })
    for (const field of fieldsOf(s)) {
      if (field != null && !known.has(field))
        issues.push({ code: DIAGNOSTIC_CODES.chartUnknownField, message: `系列引用的字段「${field}」在列式数据里不存在`, detail: { field } })
    }
    if (s.mark !== 'scatter')
      keys.add(typeof s.x === 'string' ? s.x : s.x[0])
  }
  if (keys.size > 1)
    bad('折线、K 线与柱要共用同一个自变量字段', { fields: [...keys] })
  const keyField = keys.size > 0 ? [...keys][0] as string : null
  if (keyField && seriesInput.some(s => s.mark === 'scatter' && s.x !== keyField))
    bad('与折线、K 线或柱同图的散点要用同一个自变量字段', { field: keyField })
  const ordinal = xAxis?.ordinal === true
  if (ordinal && !keyField)
    bad('等距排列要有折线、K 线或柱共用的有序自变量', {})
  return { base, source, issues, keyField, time: keyScale === 'time' || keyScale === 'utc', ordinal }
}

/* ---------- 列视图 ---------- */

/** 一个可见系列在列式数据里的列：零拷贝的视图，下一次数据变化后重取。 */
export interface CartesianColumnSeries {
  readonly spec: CartesianSeriesSpec
  /** 自变量：共用的有序列，或散点自己的 x。 */
  readonly x: Float64Array
  /** 数值：K 线是收盘，区间带是上沿。 */
  readonly y: Float64Array
  /** 区间带的下沿；不是区间为 null。 */
  readonly low: Float64Array | null
  readonly ohlc: { readonly open: Float64Array, readonly high: Float64Array, readonly low: Float64Array, readonly close: Float64Array } | null
  readonly size: Float64Array | null
  readonly color: Float64Array | null
  /** 柱按两个字段的涨跌取色：[from, to]。 */
  readonly trend: readonly [Float64Array, Float64Array] | null
  /** 数值轴要盖住的两端：K 线取最低与最高，区间带取下沿与上沿，其余取数值。 */
  readonly extent: ExtentIndex
  /** 散点自己的 x 的两端；共用有序自变量的系列为 null。 */
  readonly xExtent: ExtentIndex | null
  /** 按值着色与气泡大小的值域；没有为 null。 */
  readonly colorExtent: ExtentIndex | null
  readonly sizeExtent: ExtentIndex | null
}

export interface CartesianColumns {
  readonly spec: CartesianColumnsSpec
  readonly version: number
  /** 首行的序号：数据引用的 index 就是序号，数据滑动时同一行的引用不变。 */
  readonly start: number
  readonly length: number
  /** 共用的有序自变量列；只有散点时为 null。 */
  readonly key: Float64Array | null
  readonly visible: readonly CartesianColumnSeries[]
  /** 规格之外的问题：共用的自变量不是升序。 */
  readonly issues: readonly ChartSpecIssue[]
}

/** 跨数据版本的状态：极值索引按字段缓存，升序只核新写入的那一段。 */
interface ColumnsMemory {
  source: ColumnSource | null
  epoch: number
  extents: Map<string, ExtentIndex>
  /** 核过的升序截到哪个序号（不含）。 */
  checkedEnd: number
  /** 最早一处乱序的序号；没有为 null。 */
  unsortedAt: number | null
}

function column(source: ColumnSource, field: string | undefined): Float64Array | null {
  return field == null ? null : source.column(field) ?? null
}

/** 建列视图：每个图表实例一个，放在管线里。 */
export function createColumnsDeriver(): (spec: CartesianColumnsSpec, version: number, hidden: readonly string[]) => CartesianColumns {
  const memory: ColumnsMemory = { source: null, epoch: -1, extents: new Map(), checkedEnd: 0, unsortedAt: null }
  const extentOf = (source: ColumnSource, low: string, high: string): ExtentIndex => {
    const key = `${low}|${high}`
    let index = memory.extents.get(key)
    if (!index) {
      index = createExtentIndex(source, low, high)
      memory.extents.set(key, index)
    }
    return index
  }
  return (spec, version, hidden) => {
    void version
    const { source } = spec
    if (memory.source !== source) {
      memory.source = source
      memory.extents.clear()
      memory.epoch = -1
    }
    const start = source.start
    const length = source.length
    const end = start + length
    const key = column(source, spec.keyField ?? undefined)
    // 升序：清空或换了数据仓就整列核一遍；平时只核新写入的一段（带上一行，末行可能被改写过）
    if (key) {
      if (memory.epoch !== source.epoch || memory.checkedEnd < start || (memory.unsortedAt != null && memory.unsortedAt < start)) {
        memory.epoch = source.epoch
        memory.unsortedAt = null
        memory.checkedEnd = start
      }
      const from = Math.max(0, memory.checkedEnd - start - 2)
      if (!isAscending(key, from, length)) {
        for (let i = Math.max(1, from); i < length; i++) {
          if (!((key[i] as number) >= (key[i - 1] as number))) {
            memory.unsortedAt ??= start + i
            break
          }
        }
      }
      memory.checkedEnd = end
    }
    const issues: ChartSpecIssue[] = memory.unsortedAt == null
      ? []
      : [{ code: DIAGNOSTIC_CODES.chartColumnsUnsorted, message: '列式数据的自变量列必须升序：折线、K 线与柱按它二分取可见的一段', detail: { field: spec.keyField, row: memory.unsortedAt } }]
    const hide = new Set(hidden)
    const visible: CartesianColumnSeries[] = []
    for (const s of spec.base.series) {
      if (hide.has(s.id))
        continue
      const x = column(source, s.x)
      const y = column(source, s.y)
      if (!x || !y)
        continue
      const ohlc = s.ohlc
        ? { open: column(source, s.ohlc.open)!, high: column(source, s.ohlc.high)!, low: column(source, s.ohlc.low)!, close: column(source, s.ohlc.close)! }
        : null
      const low = column(source, s.yLow ?? undefined)
      const trend = s.trend ? [column(source, s.trend[0]), column(source, s.trend[1])] as const : null
      visible.push({
        spec: s,
        x,
        y,
        low,
        ohlc: ohlc && Object.values(ohlc).every(Boolean) ? ohlc : null,
        size: column(source, s.size ?? undefined),
        color: column(source, s.color ?? undefined),
        trend: trend && trend[0] && trend[1] ? [trend[0], trend[1]] : null,
        extent: s.ohlc ? extentOf(source, s.ohlc.low, s.ohlc.high) : s.yLow ? extentOf(source, s.yLow, s.y) : extentOf(source, s.y, s.y),
        xExtent: s.x === spec.keyField ? null : extentOf(source, s.x, s.x),
        colorExtent: s.color ? extentOf(source, s.color, s.color) : null,
        sizeExtent: s.size ? extentOf(source, s.size, s.size) : null,
      })
    }
    return { spec, version: source.version, start, length, key, visible, issues }
  }
}

/* ---------- 布局 ---------- */

export interface CartesianColumnsLayout {
  readonly size: ChartSize
  readonly plot: Rect
  readonly metrics: ChartMetrics
  readonly font: FontSpec
  readonly measurer: TextMeasurer
  readonly formats: CartesianFormats
  /** 自变量轴的比例尺：等距轴是下标的线性比例尺。 */
  readonly keyScale: AxisScale
  readonly valueScale: ContinuousScale
  readonly keyAxis: AxisLayout
  readonly valueAxis: AxisLayout
  /** 自变量换成像素：连续轴取自变量的值，等距轴取下标。 */
  readonly keyToPixel: (value: number) => number
  /** 像素换回自变量：连续轴是值，等距轴是带小数的下标。 */
  readonly pixelToKey: (pixel: number) => number
  /** 露出的下标区间 [from, to)，两头各多带一个点：折线从边上连进来。 */
  readonly from: number
  readonly to: number
  /** 相邻两个键的像素间距：等距轴是一格，连续轴取露出的一段里最近的两个键。 */
  readonly step: number
  readonly window: CartesianWindowRatio
  /** 连续自变量轴的整条定义域；等距轴为 null。 */
  readonly keyExtent: readonly [number, number] | null
  /** 等距轴露出的下标范围（含两端）；连续轴是整条。 */
  readonly keyRange: readonly [number, number]
  readonly valueExtent: readonly [number, number]
  /** 窗口没铺满整条轴：注释按绘图区裁剪。 */
  readonly clipped: boolean
  /** 按值着色的值域；没有按值着色为 null。 */
  readonly color: readonly [number, number] | null
  /** 气泡大小的上界；没有气泡为 null。 */
  readonly sizeMax: number | null
}

export interface CartesianColumnsLayoutInput {
  readonly size: ChartSize
  readonly metrics: ChartMetrics
  readonly measurer: TextMeasurer
  readonly measurerVersion: number
  readonly locale: string
  /** 管线按规格与语言记住的那份格式：布局每次都现建会多构造几个 Intl 实例。 */
  readonly formats: CartesianFormats
  readonly zoom: CartesianZoom
  readonly window: CartesianWindow
  readonly annotations: readonly CartesianAnnotation[]
}

/** 自变量写成数：日期取时间值。 */
export function columnsKeyNumber(key: ChartKey): number {
  return key instanceof Date ? key.valueOf() : Number(key)
}

/** 注释落在某根轴上的值（数与日期）。 */
function annotationValues(annotations: readonly CartesianAnnotation[], axis: 'x' | 'y'): number[] {
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

/** 时间轴的间隔与时区：给了时区用那个时区的墙上时间，否则 time 按本地、utc 按 UTC。 */
function intervalsOf(spec: CartesianColumnsSpec): { intervals: TimeIntervalSet, timeZone: string | undefined } {
  const zone = axisTimeZone(spec.base.xAxis)
  if (zone)
    return { intervals: zonedTimeIntervals(zone)!, timeZone: zone }
  return spec.base.keyScale === 'utc' ? { intervals: utcIntervals, timeZone: 'UTC' } : { intervals: localIntervals, timeZone: undefined }
}

/** 线性映射与它的反算：时间与数值的连续轴、等距轴的下标都是线性的，逐点换算不建 Date。 */
function affine(d0: number, d1: number, r0: number, r1: number): { to: (v: number) => number, from: (px: number) => number } {
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0)
  return {
    to: v => r0 + (v - d0) * k,
    from: px => (k === 0 ? d0 : d0 + (px - r0) / k),
  }
}

export function layoutColumns(columns: CartesianColumns, input: CartesianColumnsLayoutInput): CartesianColumnsLayout {
  const { spec, key, visible } = columns
  const { base } = spec
  const { size, metrics, measurer, locale, formats, zoom, window: zoomWindow, annotations } = input
  void input.measurerVersion
  const n = columns.length
  const font = metrics.font
  const zoomX = zoom === 'x' || zoom === 'xy'
  const zoomY = zoom === 'y' || zoom === 'xy'
  const scatterOnly = visible.length > 0 && visible.every(s => s.spec.mark === 'scatter')
  const bandMarks = visible.some(s => s.spec.mark === 'bar' || s.spec.mark === 'candlestick')

  // —— 自变量：整条轴、窗口、露出的下标区间 ——
  let keyExtent: [number, number] | null = null
  let windowX = FULL_WINDOW
  let keyRange: [number, number] = [0, Math.max(0, n - 1)]
  let domain: [number, number] = [0, 1]
  if (spec.ordinal) {
    if (zoomX && zoomWindow.x && key && n > 0) {
      const a = columnsKeyNumber(zoomWindow.x[0])
      const b = columnsKeyNumber(zoomWindow.x[1])
      const first = Math.min(n - 1, bisectLeft(key, Math.min(a, b)))
      const last = Math.max(first, Math.min(n - 1, bisectRight(key, Math.max(a, b)) - 1))
      keyRange = [first, last]
      windowX = indexRangeToWindow(first, last, n)
    }
    domain = [keyRange[0] - 0.5, keyRange[1] + 0.5]
  }
  else {
    let lo = Number.POSITIVE_INFINITY
    let hi = Number.NEGATIVE_INFINITY
    if (key && n > 0) {
      lo = key[0] as number
      hi = key[n - 1] as number
    }
    for (const s of visible) {
      const e = s.xExtent?.extent(0, n)
      if (e) {
        lo = Math.min(lo, e.min)
        hi = Math.max(hi, e.max)
      }
    }
    for (const v of annotationValues(annotations, 'x')) {
      lo = Math.min(lo, v)
      hi = Math.max(hi, v)
    }
    const xa = base.xAxis
    if (xa.min != null)
      lo = columnsKeyNumber(xa.min)
    if (xa.max != null)
      hi = columnsKeyNumber(xa.max)
    keyExtent = !Number.isFinite(lo) || !Number.isFinite(hi) ? [0, 1] : lo === hi ? [lo - 1, hi + 1] : [lo, hi]
    if (zoomX && zoomWindow.x)
      windowX = ratioOf([columnsKeyNumber(zoomWindow.x[0]), columnsKeyNumber(zoomWindow.x[1])], keyExtent, 'linear')
    domain = isFullWindow(windowX) ? keyExtent : windowToDomain(windowX, keyExtent, 'linear') as [number, number]
  }
  let from = 0
  let to = n
  if (key && n > 0) {
    if (spec.ordinal) {
      from = Math.max(0, keyRange[0] - 1)
      to = Math.min(n, keyRange[1] + 2)
    }
    else {
      from = Math.max(0, bisectLeft(key, domain[0]) - 1)
      to = Math.min(n, bisectRight(key, domain[1]) + 1)
    }
  }

  // —— 数值：全部数据，或只按窗口里露出的一段；不合法的定义域由管线按全部数据报出，这里只取退回的值 ——
  const fitWindow = base.yAxis.fit === 'window' && !scatterOnly
  const log = base.valueScale === 'log'
  const { value } = columnsValueDomain(columns, annotations, fitWindow ? from : 0, fitWindow ? to : n)

  // —— 按值着色与气泡：全部数据共用一把尺 ——
  const color = columnsColorDomain(columns)
  let sizeMax: number | null = null
  for (const s of visible) {
    const z = s.sizeExtent?.extent(0, n)
    if (z)
      sizeMax = Math.max(sizeMax ?? 0, z.max)
  }

  // —— 坐标轴与绘图区 ——
  const valueSpec = typeof base.yAxis.format === 'object' && !isDateFormat(base.yAxis.format) ? base.yAxis.format : {}
  const valueTickCount = (range: readonly number[]): number => typeof base.yAxis.ticks === 'number'
    ? base.yAxis.ticks
    : Math.max(2, Math.floor(Math.abs(range[1]! - range[0]!) / (font.lineHeight * 2.5)))
  const valueKind = log ? 'log' : 'linear'
  let windowY = FULL_WINDOW
  let valueExtent: [number, number] = value
  const valueScaleOf = (plot: Rect): ContinuousScale => {
    const range: [number, number] = [plot.y + plot.height, plot.y]
    const make = (d: readonly [number, number]): ContinuousScale => continuousScaleOf(base.valueScale, d, range, base.yAxis)
    const whole = make(value)
    const full = base.yAxis.nice === false ? whole : whole.nice(valueTickCount(range))
    valueExtent = full.domain as [number, number]
    windowY = zoomY && zoomWindow.y
      ? ratioOf(zoomWindow.y, valueExtent, valueKind)
      : FULL_WINDOW
    return isFullWindow(windowY) ? full : make(windowToDomain(windowY, valueExtent, valueKind) as [number, number])
  }
  const { intervals, timeZone } = intervalsOf(spec)
  const visibleCount = Math.max(1, to - from)
  const keyScaleOf = (plot: Rect): AxisScale => {
    const r0 = plot.x
    const r1 = plot.x + plot.width
    if (spec.ordinal)
      return scaleLinear({ domain, range: [r0, r1] })
    // K 线与柱两端让出半根，首尾那根整个落在绘图区里；只有散点时两端各收进一个点径
    const inset = bandMarks ? Math.min(metrics.barMax, ((r1 - r0) / visibleCount) * 0.7) / 2 + 1 : scatterOnly ? metrics.pointSize : 0
    const range = r1 - r0 > inset * 4 ? [r0 + inset, r1 - inset] : [r0, r1]
    if (spec.time) {
      const options = { domain: [new Date(domain[0]), new Date(domain[1])], range, intervals, ...(timeZone ? { timeZone } : {}) }
      return base.keyScale === 'utc' ? scaleUtc(options) : scaleTime(options)
    }
    const scale = scaleLinear({ domain, range })
    return (base.xAxis.nice ?? scatterOnly) ? scale.nice() : scale
  }

  // 等距轴的刻度：时间轴取跨过时间边界之后的第一根；数值的等距轴取整数下标
  const labelAt = (i: number): string => {
    const v = key?.[Math.round(i)]
    if (v == null || !Number.isFinite(v))
      return ''
    return spec.time ? formats.key(new Date(v)) : formats.key(v)
  }
  let ordinalTicks: number[] | undefined
  let ordinalLabel: ((i: number) => string) | undefined
  if (spec.ordinal && key && n > 0) {
    const sample = measurer.measure(labelAt(keyRange[0]), font).width
    const count = Math.max(2, Math.floor(size.width / (sample + metrics.labelGap * 4)))
    if (spec.time) {
      const ticks = ordinalTimeTicks(key, keyRange[0], keyRange[1] + 1, count, intervals)
      const format = createTimeFormat(locale, timeZone)
      ordinalTicks = [...ticks.positions]
      ordinalLabel = i => format.tick(new Date(key[Math.round(i)] as number), ticks.name)
    }
    else {
      ordinalTicks = scaleLinear({ domain: [keyRange[0], keyRange[1]], range: [0, 1] })
        .ticks(count)
        .map(Math.round)
        .filter((v, i, all) => i === 0 || v !== all[i - 1])
      ordinalLabel = labelAt
    }
  }
  const keyTickFormat = perScale((scale) => {
    const label = ordinalLabel
    if (label)
      return v => label(v as number)
    const own = base.xAxis.format
    if (typeof own === 'function')
      return v => own(v)
    if (scale.kind === 'time' || scale.kind === 'utc') {
      if (isDateFormat(own)) {
        const dates = new Intl.DateTimeFormat(locale, { ...own, timeZone: timeZone ?? own.timeZone })
        return v => dates.format(v as Date)
      }
      const format = (scale as TimeScale).tickFormat(locale)
      return v => format(v as Date)
    }
    const format = (scale as ContinuousScale).tickFormat(locale)
    return v => format(v as number)
  })
  const valueTickFormat = perScale((scale) => {
    const own = base.yAxis.format
    if (typeof own === 'function')
      return v => own(v)
    const continuous = scale as ContinuousScale
    const format = continuous.tickFormat(locale, valueTickCount(continuous.range), valueSpec)
    return v => format(v as number)
  })
  const common = { measure: measurer, font, minLabelGap: metrics.labelGap * 2, labelGap: metrics.labelGap }
  const maxLabel = Math.max(48, size.width * 0.3)
  const lastLabel = spec.ordinal ? labelAt(keyRange[1]) : spec.time ? formats.key(new Date(domain[1])) : formats.key(domain[1])
  const rightInset = Math.ceil(measurer.measure(lastLabel, font).width / 2)
  const outer: Rect = {
    x: 0,
    y: Math.ceil(font.lineHeight / 2),
    width: Math.max(0, size.width - rightInset),
    height: Math.max(0, size.height - Math.ceil(font.lineHeight / 2)),
  }
  let keyFormatScale: AxisScale | null = null
  let valueFormatScale: AxisScale | null = null
  const solved = solvePlotRect({
    outer,
    axes: {
      bottom: {
        ...common,
        format: (v: unknown) => keyTickFormat(keyFormatScale as AxisScale)(v),
        ticks: ordinalTicks ?? base.xAxis.ticks,
        labelOverflow: base.xAxis.labelOverflow ?? 'auto',
        maxLabelSize: maxLabel,
        tickLength: metrics.tickLength,
        title: base.xAxis.title,
        minThickness: base.xAxis.minSize,
      },
      left: {
        ...common,
        format: (v: unknown) => valueTickFormat(valueFormatScale as AxisScale)(v),
        ticks: base.yAxis.ticks,
        labelOverflow: base.yAxis.labelOverflow ?? 'auto',
        maxLabelSize: maxLabel,
        tickLength: 0,
        title: base.yAxis.title,
        minThickness: base.yAxis.minSize,
      },
    },
    scales: {
      bottom: (plot: Rect) => (keyFormatScale = keyScaleOf(plot)),
      left: (plot: Rect) => (valueFormatScale = valueScaleOf(plot)),
    },
  })
  const keyScale = solved.scales.bottom as AxisScale
  const valueScale = solved.scales.left as ContinuousScale
  const plot = solved.plot
  const d = keyScale.domain as readonly (number | Date)[]
  const r = keyScale.range as readonly number[]
  const mapping = affine(Number(d[0]!.valueOf()), Number(d[1]!.valueOf()), r[0]!, r[1]!)
  // 相邻两个键的间距：等距轴一格；连续轴取露出的一段里最近的两个键，K 线与柱按它定宽，不会叠在一起
  let step = spec.ordinal ? Math.abs(mapping.to(1) - mapping.to(0)) : Number.POSITIVE_INFINITY
  if (!spec.ordinal && key) {
    for (let i = Math.max(from, 1); i < to; i++) {
      const gap = (key[i] as number) - (key[i - 1] as number)
      if (gap > 0)
        step = Math.min(step, Math.abs(mapping.to(key[i] as number) - mapping.to(key[i - 1] as number)))
    }
  }
  if (!Number.isFinite(step))
    step = metrics.barMax
  return {
    size,
    plot,
    metrics,
    font,
    measurer,
    formats,
    keyScale,
    valueScale,
    keyAxis: solved.axes.bottom as AxisLayout,
    valueAxis: solved.axes.left as AxisLayout,
    keyToPixel: mapping.to,
    pixelToKey: mapping.from,
    from,
    to,
    step,
    window: { x: windowX, y: windowY },
    keyExtent,
    keyRange,
    valueExtent,
    clipped: !isFullWindow(windowX) || !isFullWindow(windowY),
    color,
    sizeMax,
  }
}

/** 数值轴的定义域：[a, b) 里各可见系列的两端并上注释的值，按轴的配置取零、夹到最小最大；不合法时退回缺省并报原因。 */
export function columnsValueDomain(columns: CartesianColumns, annotations: readonly CartesianAnnotation[], a: number, b: number): { value: [number, number], issues: ChartSpecIssue[] } {
  const { base } = columns.spec
  const values: number[] = []
  for (const s of columns.visible) {
    const e = s.extent.extent(a, b)
    if (e)
      values.push(e.min, e.max)
  }
  values.push(...annotationValues(annotations, 'y'))
  const log = base.valueScale === 'log'
  const bars = columns.visible.some(s => s.spec.mark === 'bar')
  const issues: ChartSpecIssue[] = []
  let value: [number, number]
  try {
    value = inferDomain(values, {
      min: typeof base.yAxis.min === 'number' ? base.yAxis.min : undefined,
      max: typeof base.yAxis.max === 'number' ? base.yAxis.max : undefined,
      zero: !log && (base.yAxis.zero ?? false),
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
  return { value, issues }
}

/** 按值着色的值域：全部可见的按值着色系列共用一把尺；没有为 null。 */
export function columnsColorDomain(columns: CartesianColumns): [number, number] | null {
  let color: [number, number] | null = null
  for (const s of columns.visible) {
    const c = s.colorExtent?.extent(0, columns.length)
    if (c)
      color = color ? [Math.min(color[0], c.min), Math.max(color[1], c.max)] : [c.min, c.max]
  }
  return color
}

/* ---------- 场景：SVG 的两层 ---------- */

export interface CartesianColumnsScene {
  readonly layout: CartesianColumnsLayout
  /** back：网格、坐标轴、参考带；data：系列分组与样式探针；front：参考线、标出的点与注释的标签。 */
  readonly scene: Scene
  /** 注释的标记与标签键 → 它是哪种注释、跟着哪个系列。 */
  readonly annotations: ReadonlyMap<string, CartesianAnnotationInfo>
  /** 缩放后画布与注释裁到的矩形（绘图区）：折线两头多带的点、窗外的注释不露出来；没缩放时为 null。 */
  readonly clip: Rect | null
}

/** 系列的着色引用：色槽、语气与纹理序号。 */
function paintOf(s: CartesianSeriesSpec): MarkPaint {
  return {
    ...(s.slot != null ? { slot: s.slot } : {}),
    ...(s.tone != null ? { tone: s.tone } : {}),
    ...(s.pattern != null ? { pattern: s.pattern } : {}),
  }
}

/** 一个系列在画布上会画的标记种类：探针按它们生成。 */
function templatesOf(s: CartesianSeriesSpec): Mark[] {
  const paint = paintOf(s)
  const rect = (part: string, trend?: 'rise' | 'fall'): Mark => ({ kind: 'rect', key: part, part, x: 0, y: 0, width: 0, height: 0, paint: trend ? { ...paint, trend } : paint })
  const path = (part: string, trend?: 'rise' | 'fall'): Mark => ({ kind: 'path', key: part, part, d: '', paint: trend ? { ...paint, trend } : paint })
  switch (s.mark) {
    case 'line': {
      if (s.yLow)
        return [{ kind: 'area', key: 'area', part: 'area-fill', points: [], curve: 'linear', paint }]
      const out: Mark[] = [{ kind: 'line', key: 'line', part: 'line', points: [], curve: 'linear', paint }]
      if (s.area)
        out.push({ kind: 'area', key: 'area', part: 'area-fill', points: [], curve: 'linear', paint })
      if (s.symbols === 'auto')
        out.push({ kind: 'symbol', key: 'dot', part: 'dot', x: 0, y: 0, size: 0, symbol: 'circle', paint })
      return out
    }
    case 'scatter': {
      const point: Mark = { kind: 'symbol', key: 'point', part: 'point', x: 0, y: 0, size: 0, symbol: s.symbol ?? 'circle', paint }
      return s.color ? [point, { ...point, paint: { ...paint, t: 0.5 } }] : [point]
    }
    case 'candlestick':
      return s.ohlc?.style === 'ohlc'
        ? [path('candle', 'rise'), path('candle', 'fall')]
        : [rect('candle', 'rise'), rect('candle', 'fall'), path('wick', 'rise'), path('wick', 'fall')]
    default:
      return s.trend ? [rect('bar'), rect('bar', 'rise'), rect('bar', 'fall')] : [rect('bar')]
  }
}

/** 数据引用对应的位置：引用的 index 是行的序号。滑出窗口、这一行没有值时为 −1。 */
export function columnsPositionOf(columns: CartesianColumns, s: CartesianColumnSeries | undefined, ref: ChartDatumRef | null): number {
  if (!ref || !s)
    return -1
  const p = ref.index - columns.start
  return p >= 0 && p < columns.length && Number.isFinite(s.y[p] as number) ? p : -1
}

/** 某个位置在绘图区里的锚点：柱顶、点、线上的点、K 线的收盘、区间带的正中；没有值为 null。 */
export function columnsAnchorAt(columns: CartesianColumns, layout: CartesianColumnsLayout, s: CartesianColumnSeries, p: number): { x: number, y: number } | null {
  const v = s.y[p] as number
  if (!Number.isFinite(v))
    return null
  const along = columns.spec.ordinal && s.x === columns.key ? p : s.x[p] as number
  const x = layout.keyToPixel(along)
  const map = (value: number): number => layout.valueScale.map(value) ?? Number.NaN
  const lo = s.low ? s.low[p] as number : Number.NaN
  const y = Number.isFinite(lo) ? (map(v) + map(lo)) / 2 : map(v)
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null
}

/** 自变量在某个位置上的键：时间轴写 Date。 */
export function columnsKeyAt(columns: CartesianColumns, s: CartesianColumnSeries | null, p: number): ChartKey {
  const v = (s ? s.x : columns.key ?? new Float64Array(0))[p] as number
  return columns.spec.time ? new Date(v) : v
}

export function columnsScene(columns: CartesianColumns, layout: CartesianColumnsLayout, annotations: readonly CartesianAnnotation[], version: number): CartesianColumnsScene {
  const { plot, metrics, formats, font, measurer } = layout
  const { base } = columns.spec
  const info = new Map<string, CartesianAnnotationInfo>()
  const back: Mark[] = []
  const front: Mark[] = []

  // —— 网格与坐标轴 ——
  const gridLines: Mark[] = []
  if (base.yAxis.grid !== false) {
    for (const tick of layout.valueAxis.ticks) {
      if (Number.isFinite(tick.offset))
        gridLines.push(gridLine(`grid:v:${String(tick.value)}`, plot.x, crisp(tick.offset), plot.x + plot.width, crisp(tick.offset)))
    }
  }
  if (base.xAxis.grid) {
    for (const tick of layout.keyAxis.ticks) {
      if (Number.isFinite(tick.offset))
        gridLines.push(gridLine(`grid:k:${String(tick.value instanceof Date ? tick.value.valueOf() : tick.value)}`, crisp(tick.offset), plot.y, crisp(tick.offset), plot.y + plot.height))
    }
  }
  back.push({ kind: 'group', key: 'grid', part: 'grid', children: gridLines })
  back.push({ kind: 'group', key: 'axis:x', part: 'axis', children: axisMarks('axis:x', layout.keyAxis, 'bottom', plot, metrics, { line: true, ticks: true, title: base.xAxis.title }) })
  back.push({ kind: 'group', key: 'axis:y', part: 'axis', children: axisMarks('axis:y', layout.valueAxis, 'left', plot, metrics, { line: false, ticks: false, title: base.yAxis.title }) })

  // —— 注释：参考线、参考带与标出的点 ——
  const gap = metrics.labelGap
  const valueAt = (v: unknown): number => {
    const n = v instanceof Date ? v.valueOf() : v
    return typeof n === 'number' && Number.isFinite(n) ? layout.valueScale.map(n) ?? Number.NaN : Number.NaN
  }
  const keyAt = (k: unknown): number => {
    const n = k instanceof Date ? k.valueOf() : k
    if (typeof n !== 'number' || !Number.isFinite(n))
      return Number.NaN
    if (columns.spec.ordinal) {
      const key = columns.key
      return key && columns.length > 0 ? layout.keyToPixel(nearestIndex(key, n)) : Number.NaN
    }
    return layout.keyToPixel(n)
  }
  const text = (key: string, x: number, y: number, value: string, anchor: 'start' | 'middle' | 'end', baseline: 'top' | 'middle' | 'bottom'): Mark =>
    ({ kind: 'text', key, part: 'annotation-label', x, y, text: value, anchor, baseline })
  annotations.forEach((a, index) => {
    const key = `annotation:${index}`
    const labelKey = `annotation-label:${index}`
    if (a.kind === 'line') {
      const onValueAxis = a.axis === 'y'
      const at = onValueAxis ? valueAt(a.value) : keyAt(a.value)
      if (!Number.isFinite(at))
        return
      const c = crisp(at)
      const points = onValueAxis ? [{ x: plot.x, y: c }, { x: plot.x + plot.width, y: c }] : [{ x: c, y: plot.y }, { x: c, y: plot.y + plot.height }]
      front.push({ kind: 'path', key, part: 'annotation', d: `M${points[0]!.x},${points[0]!.y}L${points[1]!.x},${points[1]!.y}`, segments: [{ points }] })
      info.set(key, { kind: 'line', seriesId: null })
      const n = a.value instanceof Date ? a.value.valueOf() : a.value
      const label = a.label ?? (onValueAxis && typeof n === 'number' ? formats.value(n) : formats.key(a.value instanceof Date || typeof a.value !== 'number' ? a.value : columns.spec.time ? new Date(a.value) : a.value))
      front.push(onValueAxis ? text(labelKey, plot.x + plot.width - gap, at - gap, label, 'end', 'bottom') : text(labelKey, at + gap, plot.y + gap, label, 'start', 'top'))
      info.set(labelKey, { kind: 'line', seriesId: null })
      return
    }
    if (a.kind === 'band') {
      const onValueAxis = a.axis === 'y'
      const ends = onValueAxis ? [valueAt(a.from), valueAt(a.to)] : [keyAt(a.from), keyAt(a.to)]
      if (!ends.every(Number.isFinite))
        return
      const lo = Math.min(...ends)
      const hi = Math.max(...ends)
      const rect = onValueAxis
        ? { x: plot.x, y: Math.max(plot.y, lo), width: plot.width, height: Math.max(0, Math.min(plot.y + plot.height, hi) - Math.max(plot.y, lo)) }
        : { x: Math.max(plot.x, lo), y: plot.y, width: Math.max(0, Math.min(plot.x + plot.width, hi) - Math.max(plot.x, lo)), height: plot.height }
      back.push({ kind: 'rect', key, part: 'annotation', ...rect })
      info.set(key, { kind: 'band', seriesId: null })
      if (a.label != null) {
        front.push(text(labelKey, rect.x + gap, rect.y + gap, a.label, 'start', 'top'))
        info.set(labelKey, { kind: 'band', seriesId: null })
      }
      return
    }
    if (a.kind !== 'point')
      return
    const s = columns.visible.find(v => v.spec.id === a.series)
    if (!s || columns.length === 0)
      return
    let p = -1
    if (a.at === 'last') {
      for (let i = columns.length - 1; i >= 0 && p < 0; i--) {
        if (Number.isFinite(s.y[i] as number))
          p = i
      }
    }
    else if (a.at === 'max' || a.at === 'min') {
      const e = s.extent.extent(0, columns.length)
      p = e ? (a.at === 'max' ? e.maxAt : e.minAt) : -1
    }
    else if (typeof a.at === 'object' && columns.key) {
      p = nearestIndex(columns.key, columnsKeyNumber(a.at.x))
    }
    const anchor = p < 0 ? null : columnsAnchorAt(columns, layout, s, p)
    if (!anchor)
      return
    const r = metrics.pointSize / 2 + metrics.gap * 2
    front.push({ kind: 'symbol', key, part: 'annotation', x: anchor.x, y: anchor.y, size: Math.PI * r * r, symbol: 'circle' })
    info.set(key, { kind: 'point', seriesId: s.spec.id })
    const value = a.at === 'max' && s.ohlc ? s.ohlc.high[p] as number : a.at === 'min' && s.ohlc ? s.ohlc.low[p] as number : s.y[p] as number
    const label = a.label ?? formats.value(value)
    const width = measurer.measure(label, font).width
    // 贴着上沿写不下时翻到点的下方
    const above = anchor.y - r - gap - font.lineHeight >= 0
    front.push(text(labelKey, Math.min(layout.size.width - width / 2, Math.max(width / 2, anchor.x)), above ? anchor.y - r - gap : anchor.y + r + gap, label, 'middle', above ? 'bottom' : 'top'))
    info.set(labelKey, { kind: 'point', seriesId: s.spec.id })
  })

  // —— 系列分组：可及名、色槽与淡出都在它上面；子标记只有样式探针 ——
  const data: Mark[] = columns.spec.base.series
    .filter(s => columns.visible.some(v => v.spec.id === s.id))
    .map(s => ({ kind: 'group', key: `series:${s.id}`, part: 'series', children: cartesianProbesOf(templatesOf(s), `series:${s.id}`) }))
  const scene = createScene({ version, layers: { back, data, front }, bounds: { x: 0, y: 0, width: layout.size.width, height: layout.size.height } })
  return { layout, scene, annotations: info, clip: layout.clipped ? plot : null }
}

/* ---------- 画布图层 ---------- */

/** 画布上一个系列的几何：像素坐标都在类型化数组里，按下标取。 */
export type CartesianRasterSeries
  = | {
    readonly kind: 'line'
    readonly id: string
    readonly xs: Float32Array
    readonly ys: Float32Array
    /** 面积的基线（数）、区间带的下沿（逐点）；只画线时为 null。 */
    readonly base: number | Float32Array | null
    readonly count: number
    readonly step: StepMode | null
    /** 画线（区间带只铺带、不画线）。 */
    readonly stroke: boolean
    /** 点稀时逐点画的点；点密时为 null。 */
    readonly dots: { readonly xs: Float32Array, readonly ys: Float32Array, readonly count: number } | null
  }
  | {
    readonly kind: 'scatter'
    readonly id: string
    readonly xs: Float32Array
    readonly ys: Float32Array
    readonly count: number
    /** 稀疏后留下的点在列里的下标：拾取、按值着色与气泡大小按它取。 */
    readonly indices: Int32Array
    /** 气泡的半径（px）；不是气泡为 null。 */
    readonly radius: Float32Array | null
    /** 按值着色的色阶位置；缺失为 NaN；不按值着色为 null。 */
    readonly t: Float32Array | null
  }
  | {
    readonly kind: 'candles'
    readonly id: string
    readonly style: 'candle' | 'ohlc'
    readonly count: number
    readonly x: Float32Array
    readonly open: Float32Array
    readonly high: Float32Array
    readonly low: Float32Array
    readonly close: Float32Array
    readonly rise: Uint8Array
    readonly width: number
  }
  | {
    readonly kind: 'bars'
    readonly id: string
    readonly count: number
    /** 柱的中心。 */
    readonly x: Float32Array
    readonly width: number
    /** 基线的像素（0 或对数轴的下界）。 */
    readonly base: number
    readonly top: Float32Array
    /** 1 涨、−1 跌、0 不按涨跌取色。 */
    readonly trend: Int8Array
  }

export interface CartesianRaster {
  readonly series: readonly CartesianRasterSeries[]
}

/** 单根 K 线与柱画出实体至少要这么宽（CSS px）：窄于它就按 2 的幂根一组合并。 */
const MIN_BAND_STEP = 3
/** 折线上逐点画点的最小点间距（px）：更密时连成一片，不画。 */
const DOT_SPACING = 16

const STEPS: Readonly<Record<string, StepMode>> = { step: 'step', stepBefore: 'step-before', stepAfter: 'step-after' }

export function columnsRaster(columns: CartesianColumns, layout: CartesianColumnsLayout): CartesianRaster {
  const { from, to, keyToPixel, valueScale, metrics, plot } = layout
  const ordinal = columns.spec.ordinal
  const vmap = (v: number): number => valueScale.map(v) ?? Number.NaN
  const baseline = vmap(columns.spec.base.valueScale === 'log' ? valueScale.domain[0]! : 0)
  const key = columns.key
  const along = (i: number): number => keyToPixel(ordinal ? i : key ? key[i] as number : i)
  const out: CartesianRasterSeries[] = []
  for (const s of columns.visible) {
    const id = s.spec.id
    if (s.spec.mark === 'line') {
      const decimated = decimateLine(ordinal ? null : s.x, s.y, from, to, keyToPixel, { y2: s.low ?? undefined, gaps: s.spec.connectNulls ? 'skip' : 'break' })
      const { indices, count } = decimated
      const xs = new Float32Array(count)
      const ys = new Float32Array(count)
      const lows = s.low ? new Float32Array(count) : null
      for (let k = 0; k < count; k++) {
        const i = indices[k] as number
        if (i < 0) {
          xs[k] = Number.NaN
          ys[k] = Number.NaN
          if (lows)
            lows[k] = Number.NaN
          continue
        }
        xs[k] = along(i)
        ys[k] = vmap(s.y[i] as number)
        if (lows)
          lows[k] = vmap(s.low![i] as number)
      }
      let dots: { xs: Float32Array, ys: Float32Array, count: number } | null = null
      if (s.spec.symbols === 'auto' && !s.low && layout.step >= DOT_SPACING) {
        const dx = new Float32Array(to - from)
        const dy = new Float32Array(to - from)
        let n = 0
        for (let i = from; i < to; i++) {
          const v = s.y[i] as number
          if (!Number.isFinite(v))
            continue
          dx[n] = along(i)
          dy[n] = vmap(v)
          n++
        }
        dots = { xs: dx, ys: dy, count: n }
      }
      out.push({ kind: 'line', id, xs, ys, base: lows ?? (s.spec.area ? baseline : null), count, step: STEPS[s.spec.curve] ?? null, stroke: !s.low, dots })
      continue
    }
    if (s.spec.mark === 'scatter') {
      const mapX = ordinal && key ? (v: number): number => keyToPixel(nearestIndex(key, v)) : keyToPixel
      const thinned = thinPoints(s.x, s.y, 0, columns.length, mapX, vmap, plot, { cell: 2, margin: metrics.pointSize })
      let radius: Float32Array | null = null
      if (s.size && layout.sizeMax) {
        radius = new Float32Array(thinned.count)
        for (let k = 0; k < thinned.count; k++) {
          const z = s.size[thinned.indices[k] as number] as number
          radius[k] = Number.isFinite(z) && z > 0 ? Math.max(metrics.lineWidth, metrics.barMax * Math.sqrt(z / layout.sizeMax)) : 0
        }
      }
      let t: Float32Array | null = null
      if (s.color && layout.color) {
        t = new Float32Array(thinned.count)
        for (let k = 0; k < thinned.count; k++)
          t[k] = colorPosition(layout.color, s.color[thinned.indices[k] as number] as number) ?? Number.NaN
      }
      out.push({ kind: 'scatter', id, xs: thinned.xs, ys: thinned.ys, count: thinned.count, indices: thinned.indices, radius, t })
      continue
    }
    // K 线与柱：窄到画不出实体时按 2 的幂根一组合并，组边界按序号对齐
    const size = layout.step >= MIN_BAND_STEP ? 1 : bucketSize(to - from, plot.width, MIN_BAND_STEP)
    const width = Math.max(1, Math.min(metrics.barMax, layout.step * size * 0.7))
    if (s.spec.mark === 'candlestick' && s.ohlc) {
      const b = bucketOhlc(s.ohlc.open, s.ohlc.high, s.ohlc.low, s.ohlc.close, from, to, size, columns.start)
      const x = new Float32Array(b.count)
      const open = new Float32Array(b.count)
      const high = new Float32Array(b.count)
      const low = new Float32Array(b.count)
      const close = new Float32Array(b.count)
      const rise = new Uint8Array(b.count)
      for (let k = 0; k < b.count; k++) {
        x[k] = (along(b.first[k] as number) + along(b.last[k] as number)) / 2
        open[k] = vmap(b.open[k] as number)
        high[k] = vmap(b.high[k] as number)
        low[k] = vmap(b.low[k] as number)
        close[k] = vmap(b.close[k] as number)
        rise[k] = (b.close[k] as number) >= (b.open[k] as number) ? 1 : 0
      }
      out.push({ kind: 'candles', id, style: s.spec.ohlc?.style ?? 'candle', count: b.count, x, open, high, low, close, rise, width })
      continue
    }
    const b = bucketPeak(s.y, from, to, size, columns.start)
    const x = new Float32Array(b.count)
    const top = new Float32Array(b.count)
    const trend = new Int8Array(b.count)
    for (let k = 0; k < b.count; k++) {
      x[k] = (along(b.first[k] as number) + along(b.last[k] as number)) / 2
      top[k] = vmap(b.value[k] as number)
      if (s.trend) {
        const p = b.peak[k] as number
        const a0 = s.trend[0][p] as number
        const a1 = s.trend[1][p] as number
        trend[k] = Number.isFinite(a0) && Number.isFinite(a1) ? (a1 >= a0 ? 1 : -1) : 0
      }
    }
    out.push({ kind: 'bars', id, count: b.count, x, width, base: baseline, top, trend })
  }
  return { series: out }
}

/* ---------- 摘要与数据表 ---------- */

/** 行数不超过它时数据表逐行写出；超过时按自变量区间聚合。 */
export const COLUMNS_TABLE_ROWS = 500
/** 聚合后的区间数上限。 */
export const COLUMNS_TABLE_RANGES = 100

/** 一个系列的首个与最后一个有值的位置。 */
function endsOf(y: Float64Array, n: number): [number, number] {
  let first = -1
  let last = -1
  for (let i = 0; i < n && first < 0; i++) {
    if (Number.isFinite(y[i] as number))
      first = i
  }
  for (let i = n - 1; i >= 0 && last < 0; i--) {
    if (Number.isFinite(y[i] as number))
      last = i
  }
  return [first, last]
}

export interface CartesianColumnsA11y {
  readonly summary: string
  readonly table: TableModel
  /** 数据表聚合过：总行数与区间数；逐行写出时为 null。 */
  readonly aggregated: { readonly rows: number, readonly ranges: number } | null
}

export function columnsA11y(columns: CartesianColumns, formats: CartesianFormats, translations: CartesianChartTranslations): CartesianColumnsA11y {
  const n = columns.length
  const keyText = (s: CartesianColumnSeries | null, p: number): string => formats.key(columnsKeyAt(columns, s, p))
  const point = (s: CartesianColumnSeries, p: number, value: number): ChartSummaryPoint => ({ key: keyText(s, p), value: formats.value(value) })
  const series = columns.visible.map((s) => {
    let count = 0
    for (let i = 0; i < n; i++) {
      if (Number.isFinite(s.y[i] as number))
        count++
    }
    const [first, last] = endsOf(s.y, n)
    const e = s.ohlc ? createYExtent(s, n) : s.extent.extent(0, n)
    const firstValue = first < 0 ? null : s.y[first] as number
    const lastValue = last < 0 ? null : s.y[last] as number
    return {
      id: s.spec.id,
      name: s.spec.name,
      count,
      min: e ? point(s, e.minAt, e.min) : null,
      max: e ? point(s, e.maxAt, e.max) : null,
      first: firstValue == null ? null : point(s, first, firstValue),
      last: lastValue == null ? null : point(s, last, lastValue),
      change: firstValue != null && lastValue != null && count > 1 && firstValue !== 0 ? lastValue / firstValue - 1 : null,
    }
  })
  const primary = columns.visible[0] ?? null
  const summary: ChartSummary = {
    seriesCount: columns.visible.length,
    range: n > 0 && primary ? { first: keyText(primary, 0), last: keyText(primary, n - 1), count: n } : null,
    series,
  }
  const text = translations.summary(summary)

  // —— 数据表 ——
  const ohlcFields = ['open', 'high', 'low', 'close'] as const
  const columnsOf: TableModel['columns'][number][] = [{ id: 'key', label: translations.keyLabel }]
  const many = columns.visible.length > 1
  for (const s of columns.visible) {
    if (s.ohlc) {
      for (const f of ohlcFields)
        columnsOf.push({ id: `${s.spec.id}:${f}`, label: many ? `${s.spec.name} ${translations.ohlcColumns[f]}` : translations.ohlcColumns[f] })
    }
    else {
      columnsOf.push({ id: s.spec.id, label: s.spec.name })
    }
  }
  const missing = { value: null, text: translations.missingValue }
  const cell = (v: number): TableModel['rows'][number]['cells'][number] => (Number.isFinite(v) ? { value: v, text: formats.value(v) } : missing)
  if (n <= COLUMNS_TABLE_ROWS || !primary) {
    const rows = Array.from({ length: n }, (_, p) => ({
      key: columnsKeyAt(columns, primary, p),
      cells: [
        { value: columnsKeyAt(columns, primary, p), text: keyText(primary, p) },
        ...columns.visible.flatMap(s => (s.ohlc ? ohlcFields.map(f => cell(s.ohlc![f][p] as number)) : [cell(s.y[p] as number)])),
      ],
    }))
    return { summary: text, table: { columns: columnsOf, rows }, aggregated: null }
  }
  // 按自变量区间聚合：区间取整到时间或数值的整刻度，追加数据时只有最后一行在变
  const edges = rangeEdges(columns, primary)
  const rows: TableModel['rows'][number][] = []
  const x = primary.x
  const sorted = columns.key === primary.x
  for (let r = 0; r + 1 < edges.length; r++) {
    const lo = edges[r] as number
    const hi = edges[r + 1] as number
    const a = sorted ? bisectLeft(x, lo) : 0
    const b = sorted ? bisectLeft(x, hi) : n
    if (sorted && a >= b)
      continue
    const range = (s: CartesianColumnSeries): TableModel['rows'][number]['cells'][number] => {
      let min = Number.POSITIVE_INFINITY
      let max = Number.NEGATIVE_INFINITY
      if (sorted) {
        const e = createYRange(s, a, b)
        if (e) {
          min = e[0]
          max = e[1]
        }
      }
      else {
        for (let i = 0; i < n; i++) {
          const xi = s.x[i] as number
          const v = s.y[i] as number
          if (xi >= lo && xi < hi && Number.isFinite(v)) {
            min = Math.min(min, v)
            max = Math.max(max, v)
          }
        }
      }
      return Number.isFinite(min) ? { value: [min, max], text: min === max ? formats.value(min) : `${formats.value(min)} – ${formats.value(max)}` } : missing
    }
    const cells = columns.visible.flatMap((s) => {
      if (!s.ohlc || !sorted)
        return [range(s)]
      const merged = bucketOhlc(s.ohlc.open, s.ohlc.high, s.ohlc.low, s.ohlc.close, a, b, b - a)
      return merged.count === 0
        ? ohlcFields.map(() => missing)
        : [cell(merged.open[0] as number), cell(merged.high[0] as number), cell(merged.low[0] as number), cell(merged.close[0] as number)]
    })
    const from = columns.spec.time ? new Date(lo) : lo
    const to = columns.spec.time ? new Date(hi) : hi
    rows.push({ key: from, cells: [{ value: [from, to], text: `${formats.key(from)} – ${formats.key(to)}` }, ...cells] })
  }
  return { summary: text, table: { columns: columnsOf, rows }, aggregated: { rows: n, ranges: rows.length } }
}

/** K 线的摘要按收盘算最值：分块极值是按最低与最高建的，这里另扫一遍收盘。 */
function createYExtent(s: CartesianColumnSeries, n: number): { min: number, max: number, minAt: number, maxAt: number } | null {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  let minAt = -1
  let maxAt = -1
  for (let i = 0; i < n; i++) {
    const v = s.y[i] as number
    if (v < min) {
      min = v
      minAt = i
    }
    if (v > max) {
      max = v
      maxAt = i
    }
  }
  return minAt < 0 ? null : { min, max, minAt, maxAt }
}

/** [a, b) 里数值的最小与最大：区间带的极值索引按下沿与上沿建，K 线按最低与最高建。 */
function createYRange(s: CartesianColumnSeries, a: number, b: number): [number, number] | null {
  const e = s.extent.extent(a, b)
  return e ? [e.min, e.max] : null
}

/** 聚合数据表的区间边界：按自变量的整刻度切成不超过 COLUMNS_TABLE_RANGES 段，首末两个边界盖住全部数据。 */
function rangeEdges(columns: CartesianColumns, primary: CartesianColumnSeries): number[] {
  const n = columns.length
  const x = primary.x
  let lo = Number.POSITIVE_INFINITY
  let hi = Number.NEGATIVE_INFINITY
  if (columns.key === x) {
    lo = x[0] as number
    hi = x[n - 1] as number
  }
  else {
    const e = primary.xExtent?.extent(0, n)
    if (e) {
      lo = e.min
      hi = e.max
    }
  }
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo === hi)
    return [lo, lo + 1]
  let edges: number[]
  if (columns.spec.time) {
    const { intervals } = intervalsOf(columns.spec)
    const chosen = timeTickInterval(new Date(lo), new Date(hi), COLUMNS_TABLE_RANGES, intervals)
    edges = chosen ? chosen.interval.range(chosen.interval.floor(new Date(lo)), new Date(hi + 1)).map(d => d.valueOf()) : [lo]
    const tail = chosen?.interval.offset(new Date(edges.at(-1) ?? lo), 1).valueOf() ?? hi + 1
    edges.push(tail > hi ? tail : hi + 1)
  }
  else {
    const scale = scaleLinear({ domain: [lo, hi], range: [0, 1] }).nice(COLUMNS_TABLE_RANGES)
    edges = scale.ticks(COLUMNS_TABLE_RANGES)
    const step = edges.length > 1 ? (edges[1] as number) - (edges[0] as number) : 1
    if ((edges.at(-1) as number) <= hi)
      edges.push((edges.at(-1) as number) + step)
  }
  return edges.length > COLUMNS_TABLE_RANGES + 1 ? edges.filter((_, i) => i % Math.ceil(edges.length / COLUMNS_TABLE_RANGES) === 0 || i === edges.length - 1) : edges
}

/* ---------- 交互：拾取、导航、详情、前景与缩略线 ---------- */

/** 散点的像素网格：跟着画布图层的那一份几何建，几何换了自然作废。 */
const pointIndexes = new WeakMap<object, ReturnType<typeof createPointIndex>>()

/** 拾取：指针在绘图区里的坐标换成数据引用。axis 模式取最近的键再取最近的系列；item 模式散点取像素网格里最近的点。 */
export function columnsHitTest(
  columns: CartesianColumns,
  layout: CartesianColumnsLayout,
  raster: CartesianRaster,
  x: number,
  y: number,
  trigger: 'axis' | 'item',
  pointerType: string,
): { ref: ChartDatumRef, key: ChartKey } | null {
  const { plot, metrics } = layout
  if (x < plot.x || x > plot.x + plot.width || y < plot.y || y > plot.y + plot.height || columns.length === 0)
    return null
  const coarse = pointerType === 'touch' || pointerType === 'pen'
  const radius = coarse ? Math.max(metrics.hitMin, 44) / 2 : metrics.hitMin / 2
  // 散点：像素网格里最近的点（画面上最上面的那个）
  if (trigger === 'item') {
    let best: { ref: ChartDatumRef, key: ChartKey, d: number } | null = null
    for (const r of raster.series) {
      if (r.kind !== 'scatter' || r.count === 0)
        continue
      let index = pointIndexes.get(r)
      if (!index) {
        index = createPointIndex(r.xs, r.ys, r.count, radius)
        pointIndexes.set(r, index)
      }
      const k = index.nearest(x, y, radius)
      if (k < 0)
        continue
      const d = Math.hypot((r.xs[k] as number) - x, (r.ys[k] as number) - y)
      const s = columns.visible.find(v => v.spec.id === r.id)!
      const p = r.indices[k] as number
      if (!best || d <= best.d)
        best = { ref: { seriesId: r.id, index: columns.start + p }, key: columnsKeyAt(columns, s, p), d }
    }
    if (best)
      return { ref: best.ref, key: best.key }
    if (!columns.key)
      return null
  }
  const key = columns.key
  if (!key)
    return null
  // 最近的键：等距轴直接取整，连续轴二分；这个键上一个有值的系列都没有时往两边找最近的有值的键
  const v = layout.pixelToKey(x)
  let p = columns.spec.ordinal ? Math.min(columns.length - 1, Math.max(0, Math.round(v))) : nearestIndex(key, v)
  const series = columns.visible.filter(s => s.spec.mark !== 'scatter')
  const has = (i: number): boolean => series.some(s => Number.isFinite(s.y[i] as number))
  if (!has(p)) {
    let found = -1
    for (let d = 1; d < columns.length && found < 0; d++) {
      if (p - d >= 0 && has(p - d))
        found = p - d
      else if (p + d < columns.length && has(p + d))
        found = p + d
    }
    if (found < 0)
      return null
    p = found
  }
  let ref: ChartDatumRef | null = null
  let nearest = Number.POSITIVE_INFINITY
  for (const s of series) {
    const anchor = columnsAnchorAt(columns, layout, s, p)
    if (!anchor)
      continue
    const d = Math.abs(anchor.y - y)
    if (d < nearest) {
      nearest = d
      ref = { seriesId: s.spec.id, index: columns.start + p }
    }
  }
  return ref ? { ref, key: columnsKeyAt(columns, null, p) } : null
}

/** 缩略线最多取几个点：轨道只有几百像素宽。 */
const PREVIEW_COLUMNS = 240

/**
 * 缩放条的缩略线：第一个按键排的系列在整条轴上的走势，写在 0–1 的单位框里。按列取最低与最高两点、按先后连起来，
 * 峰谷都在；逐点只做比较，流式每帧重算也只是一遍扫描。
 */
export function columnsZoomPreview(columns: CartesianColumns): string | null {
  const s = columns.visible.find(v => v.spec.mark !== 'scatter')
  const key = columns.key
  const n = columns.length
  if (!s || !key || n < 2)
    return null
  const e = s.ohlc ? createYExtent(s, n) : s.extent.extent(0, n)
  if (!e)
    return null
  const y = s.y
  const span = e.max - e.min
  const ordinal = columns.spec.ordinal
  const k0 = key[0] as number
  const k1 = key[n - 1] as number
  const at = (i: number): number => (ordinal ? (i + 0.5) / n : k1 === k0 ? 0.5 : ((key[i] as number) - k0) / (k1 - k0))
  let d = ''
  const point = (i: number): void => {
    const v = 0.9 - (span > 0 ? ((y[i] as number) - e.min) / span : 0.5) * 0.8
    d += `${d ? 'L' : 'M'}${at(i).toFixed(4)},${v.toFixed(4)}`
  }
  let i = 0
  for (let c = 1; c <= PREVIEW_COLUMNS && i < n; c++) {
    const edge = c === PREVIEW_COLUMNS ? n : ordinal ? Math.ceil((c / PREVIEW_COLUMNS) * n) : bisectRight(key, k0 + (c / PREVIEW_COLUMNS) * (k1 - k0))
    let lo = -1
    let hi = -1
    for (; i < edge; i++) {
      const v = y[i] as number
      if (!Number.isFinite(v))
        continue
      if (lo < 0 || v < (y[lo] as number))
        lo = i
      if (hi < 0 || v > (y[hi] as number))
        hi = i
    }
    if (lo < 0)
      continue
    point(Math.min(lo, hi))
    if (lo !== hi)
      point(Math.max(lo, hi))
  }
  return d || null
}

/** 可见系列按 id 取。 */
export function columnsSeriesOf(columns: CartesianColumns, id: string): CartesianColumnSeries | undefined {
  return columns.visible.find(s => s.spec.id === id)
}

/** 标记的身份：折线、K 线与柱是「系列:键」，散点是「系列:#序号」（同一个 x 上可以有多个点）。 */
export function columnsMarkKey(columns: CartesianColumns, s: CartesianColumnSeries, p: number): string {
  return s.spec.mark === 'scatter' && s.x !== columns.key ? `${s.spec.id}:#${columns.start + p}` : `${s.spec.id}:${cartesianKeyId(columnsKeyAt(columns, s, p))}`
}

/** 一行的原始数据：按数据仓的字段逐个取出（数值原样）。 */
function rowAt(columns: CartesianColumns, p: number): Record<string, number> {
  const row: Record<string, number> = {}
  for (const field of columns.spec.source.fields)
    row[field] = columns.spec.source.column(field)![p] as number
  return row
}

function finite(v: number | undefined): number | null {
  return v != null && Number.isFinite(v) ? v : null
}

/** 一个位置上的详情：键、数值与写成文字的值，K 线带开高低收、区间带写「下 – 上」、散点带大小与按值着色的值。 */
function detailsAt(columns: CartesianColumns, layout: CartesianColumnsLayout | null, translations: CartesianChartTranslations, formats: CartesianFormats, s: CartesianColumnSeries, p: number): ChartDatumDetails {
  const key = columnsKeyAt(columns, s, p)
  const value = finite(s.y[p])
  const formatted: Record<string, string> = { key: formats.key(key), value: value == null ? '' : formats.value(value) }
  const values: Record<string, unknown> = { key, value }
  const low = s.low ? finite(s.low[p]) : null
  if (low != null && value != null) {
    values.low = low
    formatted.value = `${formats.value(low)} – ${formats.value(value)}`
  }
  if (s.ohlc) {
    const [open, high, lo, close] = [s.ohlc.open[p], s.ohlc.high[p], s.ohlc.low[p], s.ohlc.close[p]].map(finite)
    if (open != null && high != null && lo != null && close != null) {
      Object.assign(values, { open, high, low: lo, close })
      formatted.value = translations.ohlcLabel({ open: formats.value(open), high: formats.value(high), low: formats.value(lo), close: formats.value(close) })
    }
  }
  const size = s.size ? finite(s.size[p]) : null
  if (size != null) {
    values.size = size
    formatted.size = formats.measure(size)
  }
  const color = s.color ? finite(s.color[p]) : null
  if (color != null) {
    values.color = color
    formatted.color = formats.measure(color)
  }
  return {
    seriesId: s.spec.id,
    seriesName: s.spec.name,
    slot: s.spec.slot,
    tone: s.spec.tone,
    index: columns.start + p,
    key,
    values,
    formatted,
    datum: rowAt(columns, p),
    point: (layout ? columnsAnchorAt(columns, layout, s, p) : null) ?? { x: 0, y: 0 },
  }
}

/** 详情载荷。axis 模式带上同一个位置上的全部可见系列（缺失值的系列也列出、数值为空）；item 模式只报这一个。 */
export function columnsDetails(
  columns: CartesianColumns,
  layout: CartesianColumnsLayout | null,
  formats: CartesianFormats,
  translations: CartesianChartTranslations,
  ref: ChartDatumRef,
  trigger: 'axis' | 'item',
): ChartDatumDetails | null {
  const s = columnsSeriesOf(columns, ref.seriesId)
  const p = columnsPositionOf(columns, s, ref)
  if (!s || p < 0)
    return null
  const own = detailsAt(columns, layout, translations, formats, s, p)
  if (trigger === 'item' || s.x !== columns.key)
    return own
  const items = columns.visible
    .filter(v => v.x === columns.key)
    .map(v => (v === s ? own : detailsAt(columns, layout, translations, formats, v, p)))
  return { ...own, items }
}

/** 第一个可见系列的第一个有值的数据：键盘首次进入时的落点。 */
export function columnsFirstRef(columns: CartesianColumns): ChartDatumRef | null {
  for (const s of columns.visible) {
    for (let i = 0; i < columns.length; i++) {
      if (Number.isFinite(s.y[i] as number))
        return { seriesId: s.spec.id, index: columns.start + i }
    }
  }
  return null
}

/** 联动过来的键落在哪个数据上：共用的有序自变量上恰好等于它的那一行，第一个有值的可见系列。 */
export function columnsRefAtKey(columns: CartesianColumns, key: ChartKey): ChartDatumRef | null {
  const k = columns.key
  if (!k || columns.length === 0)
    return null
  const v = columnsKeyNumber(key)
  const p = bisectLeft(k, v)
  if (p >= columns.length || k[p] !== v)
    return null
  const s = columns.visible.find(c => c.x === k && Number.isFinite(c.y[p] as number))
  return s ? { seriesId: s.spec.id, index: columns.start + p } : null
}

/** 键盘导航：沿自变量逐点走（跳过缺失值）、翻页、到头；在同一个位置上换系列。到头原地不动（返回 null）。 */
export function columnsNavTarget(columns: CartesianColumns, from: ChartDatumRef, intent: string): ChartDatumRef | null {
  const at = columns.visible.findIndex(s => s.spec.id === from.seriesId)
  const s = columns.visible[at]
  const j = columnsPositionOf(columns, s, from)
  if (!s || j < 0)
    return null
  const n = columns.length
  const has = (i: number): boolean => Number.isFinite(s.y[i] as number)
  const seek = (start: number, dir: 1 | -1): number => {
    for (let i = start; i >= 0 && i < n; i += dir) {
      if (has(i))
        return i
    }
    return -1
  }
  const ref = (p: number): ChartDatumRef | null => (p < 0 || p === j ? null : { seriesId: s.spec.id, index: columns.start + p })
  switch (intent) {
    case 'next':
      return ref(seek(j + 1, 1))
    case 'prev':
      return ref(seek(j - 1, -1))
    case 'first':
      return ref(seek(0, 1))
    case 'last':
      return ref(seek(n - 1, -1))
    case 'page-next': {
      const target = Math.min(n - 1, j + chartPageSize(n))
      const p = seek(target, 1)
      return ref(p >= 0 ? p : seek(target, -1))
    }
    case 'page-prev': {
      const target = Math.max(0, j - chartPageSize(n))
      const p = seek(target, -1)
      return ref(p >= 0 ? p : seek(target, 1))
    }
    case 'series-next':
    case 'series-prev': {
      const dir = intent === 'series-next' ? 1 : -1
      for (let k = at + dir; k >= 0 && k < columns.visible.length; k += dir) {
        const other = columns.visible[k]!
        const p = other.x === s.x ? j : nearestIndex(other.x, s.x[j] as number)
        if (p >= 0 && Number.isFinite(other.y[p] as number))
          return { seriesId: other.spec.id, index: columns.start + p }
      }
      return null
    }
    default:
      return null
  }
}

/**
 * 某个数据在画布模式下的 SVG 版本：柱是矩形、K 线是实体、散点是点，叠在画布上同一处、同部件同画法，
 * 当焦点代理；折线与区间带没有逐点的标记，为 null（代理是前景里激活的点）。
 */
export function columnsProxyMark(columns: CartesianColumns, layout: CartesianColumnsLayout, ref: ChartDatumRef): { mark: Mark, group: string } | null {
  const s = columnsSeriesOf(columns, ref.seriesId)
  const p = columnsPositionOf(columns, s, ref)
  if (!s || p < 0 || s.spec.mark === 'line')
    return null
  const anchor = columnsAnchorAt(columns, layout, s, p)
  if (!anchor)
    return null
  const { metrics } = layout
  const paint = paintOf(s.spec)
  const key = columnsMarkKey(columns, s, p)
  const datum = { seriesId: s.spec.id, index: columns.start + p }
  const a11y = { label: '', focusable: true }
  const group = `series:${s.spec.id}`
  const vmap = (v: number): number => layout.valueScale.map(v) ?? Number.NaN
  const width = Math.max(1, Math.min(metrics.barMax, layout.step * 0.7))
  if (s.spec.mark === 'scatter') {
    const r = s.size && layout.sizeMax && Number.isFinite(s.size[p] as number)
      ? Math.max(metrics.lineWidth, metrics.barMax * Math.sqrt((s.size[p] as number) / layout.sizeMax))
      : metrics.pointSize / 2
    const t = s.color && layout.color ? colorPosition(layout.color, s.color[p] as number) : null
    return { group, mark: { kind: 'symbol', key, part: 'point', x: anchor.x, y: anchor.y, size: Math.PI * r * r, symbol: s.spec.symbol ?? 'circle', datum, paint: t == null ? paint : { ...paint, t }, a11y } }
  }
  if (s.spec.mark === 'candlestick' && s.ohlc) {
    const open = vmap(s.ohlc.open[p] as number)
    const close = vmap(s.ohlc.close[p] as number)
    const trend: 'rise' | 'fall' = (s.ohlc.close[p] as number) >= (s.ohlc.open[p] as number) ? 'rise' : 'fall'
    if (s.spec.ohlc?.style === 'ohlc') {
      const c = crisp(anchor.x)
      const segments = [
        { points: [{ x: c, y: vmap(s.ohlc.high[p] as number) }, { x: c, y: vmap(s.ohlc.low[p] as number) }] },
        { points: [{ x: c - width / 2, y: open }, { x: c, y: open }] },
        { points: [{ x: c, y: close }, { x: c + width / 2, y: close }] },
      ]
      const d = segments.map(g => `M${g.points[0]!.x},${g.points[0]!.y}L${g.points[1]!.x},${g.points[1]!.y}`).join('')
      return { group, mark: { kind: 'path', key, part: 'candle', d, segments, datum, paint: { ...paint, trend }, a11y } }
    }
    const top = Math.min(open, close)
    return { group, mark: { kind: 'rect', key, part: 'candle', x: crisp(anchor.x) - width / 2, y: top, width, height: Math.max(1, Math.abs(close - open)), orientation: 'vertical', datum, paint: { ...paint, trend }, a11y } }
  }
  const base = vmap(columns.spec.base.valueScale === 'log' ? layout.valueScale.domain[0]! : 0)
  const top = vmap(s.y[p] as number)
  let trend: 'rise' | 'fall' | undefined
  if (s.trend) {
    const a0 = s.trend[0][p] as number
    const a1 = s.trend[1][p] as number
    if (Number.isFinite(a0) && Number.isFinite(a1))
      trend = a1 >= a0 ? 'rise' : 'fall'
  }
  const positive = top <= base
  return {
    group,
    mark: {
      kind: 'rect',
      key,
      part: 'bar',
      x: anchor.x - width / 2,
      y: Math.min(top, base),
      width,
      height: Math.abs(base - top),
      cornerRadius: Math.min(metrics.radius, width / 2),
      orientation: 'vertical',
      baseline: positive ? 'end' : 'start',
      datum,
      paint: trend ? { ...paint, trend } : paint,
      a11y,
    },
  }
}

/**
 * 前景层：准线（axis 模式；只有柱与 K 线时是整格的淡底）、激活的点（折线在这个键上的点，键盘聚焦时就是焦点代理）
 * 与焦点环（套在代理外面）。随激活与聚焦变化，不进场景。
 */
export function columnsOverlay(
  columns: CartesianColumns,
  layout: CartesianColumnsLayout,
  active: { readonly ref: ChartDatumRef } | null,
  trigger: 'axis' | 'item',
  focused: { readonly ref: ChartDatumRef, readonly ring: boolean } | null,
): { under: Mark[], over: Mark[] } {
  const under: Mark[] = []
  const over: Mark[] = []
  const { plot, metrics } = layout
  const lines = columns.visible.filter(s => s.spec.mark === 'line' && !s.low)
  const activeSeries = active ? columnsSeriesOf(columns, active.ref.seriesId) : undefined
  const activeP = active ? columnsPositionOf(columns, activeSeries, active.ref) : -1
  if (activeP >= 0 && activeSeries && trigger === 'axis') {
    const center = columnsAnchorAt(columns, layout, activeSeries, activeP)?.x ?? Number.NaN
    if (Number.isFinite(center)) {
      const bandOnly = columns.visible.every(s => s.spec.mark === 'bar' || s.spec.mark === 'candlestick')
      if (bandOnly) {
        const step = Math.max(1, layout.step)
        under.push({ kind: 'rect', key: 'crosshair', part: 'crosshair', x: center - step / 2, y: plot.y, width: step, height: plot.height })
      }
      else {
        const at = Math.round(center) + 0.5
        under.push({ kind: 'path', key: 'crosshair', part: 'crosshair', d: `M${at},${plot.y}L${at},${plot.y + plot.height}` })
      }
    }
  }
  // 激活的点：axis 模式每条折线在这个位置上一个，item 模式只有命中的那一个
  const points = new Map<string, number>()
  if (activeP >= 0 && activeSeries) {
    if (trigger === 'axis' && activeSeries.x === columns.key) {
      for (const s of lines)
        points.set(s.spec.id, activeP)
    }
    else if (lines.includes(activeSeries)) {
      points.set(activeSeries.spec.id, activeP)
    }
  }
  const focusSeries = focused ? columnsSeriesOf(columns, focused.ref.seriesId) : undefined
  const focusP = focused ? columnsPositionOf(columns, focusSeries, focused.ref) : -1
  if (focused && focusSeries && focusP >= 0 && lines.includes(focusSeries))
    points.set(focusSeries.spec.id, focusP)
  const pointSize = Math.PI * (metrics.pointSize / 2) ** 2
  for (const [id, p] of points) {
    const s = columnsSeriesOf(columns, id)!
    const anchor = columnsAnchorAt(columns, layout, s, p)
    if (!anchor)
      continue
    over.push({
      kind: 'symbol',
      key: columnsMarkKey(columns, s, p),
      part: 'point',
      x: anchor.x,
      y: anchor.y,
      size: pointSize,
      symbol: 'circle',
      datum: { seriesId: id, index: columns.start + p },
      paint: paintOf(s.spec),
      a11y: { label: '', focusable: focused != null && focusSeries === s && focusP === p },
    })
  }
  // 焦点环：画在代理外面，隔一道表面间隙；柱立在基线上的一端不外扩
  if (focused?.ring && focusSeries && focusP >= 0) {
    const inset = metrics.gap + 1
    const proxy = columnsProxyMark(columns, layout, focused.ref)?.mark
    if (proxy?.kind === 'rect') {
      const base = layout.valueScale.map(columns.spec.base.valueScale === 'log' ? layout.valueScale.domain[0]! : 0)
      const flush = (edge: number): boolean => base != null && Math.abs(edge - base) < 0.5
      const lo = proxy.y
      const hi = proxy.y + proxy.height
      const from = flush(lo) ? lo : lo - inset
      const to = flush(hi) ? hi : hi + inset
      over.push({ kind: 'rect', key: 'focus-ring', part: 'focus-ring', x: proxy.x - inset, y: from, width: proxy.width + inset * 2, height: to - from, cornerRadius: (proxy.cornerRadius ?? 0) + inset, orientation: 'vertical', baseline: proxy.baseline })
    }
    else {
      const anchor = columnsAnchorAt(columns, layout, focusSeries, focusP)
      if (anchor) {
        const own = proxy?.kind === 'symbol' ? Math.sqrt(proxy.size / Math.PI) : metrics.pointSize / 2
        const r = own + inset
        over.push({ kind: 'symbol', key: 'focus-ring', part: 'focus-ring', x: anchor.x, y: anchor.y, size: Math.PI * r * r, symbol: 'circle' })
      }
    }
  }
  return { under, over }
}
