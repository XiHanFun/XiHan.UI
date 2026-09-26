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
  BandScale,
  ContinuousScale,
  CurveName,
  FontSpec,
  KeyedPoint,
  LineMark,
  Mark,
  NumberFormatSpec,
  PathMark,
  Rect,
  Scene,
  TableModel,
  TextMark,
  TextMeasurer,
  TimeScale,
} from '@xihan-ui/viz'
import type { ChartKey, ChartLabelBox, ChartMetrics, ChartRow, ChartSize, ChartSpecIssue } from '../shared/chart'
import type {
  CartesianAxis,
  CartesianAxisFormat,
  CartesianChartTranslations,
  CartesianCurve,
  CartesianOrientation,
  CartesianScaleKind,
  CartesianSeries,
} from './cartesian-chart.types'
import { DIAGNOSTIC_CODES } from '@xihan-ui/core'
import {
  buildTableModel,
  createNumberFormat,
  createScene,
  inferDomain,
  isVizError,
  layoutAxis,
  scaleBand,
  scaleLinear,
  scaleLog,
  scalePoint,
  scaleTime,
  scaleUtc,
  solvePlotRect,
  stack,
} from '@xihan-ui/viz'
import { assignChartSeries, buildChartSummary, labelBox, memoizeLast, placeWithoutOverlap, settleColumn } from '../shared/chart'

/* ---------- 规格 ---------- */

/** 归一后的系列。 */
export interface CartesianSeriesSpec {
  readonly id: string
  readonly name: string
  readonly slot: number | null
  readonly tone: Tone | null
  readonly mark: 'bar' | 'line'
  readonly x: string
  readonly y: string
  /** 声明次序。 */
  readonly order: number
  /** 堆叠组；不堆叠为 null。 */
  readonly stack: string | null
  readonly stackOffset: 'none' | 'expand' | 'diverging'
  readonly curve: CurveName
  readonly area: boolean
  readonly symbols: 'auto' | 'always' | 'none'
  readonly connectNulls: boolean
  /** 数据标签：柱可写 inside / end，折线只写 end。 */
  readonly labels: 'none' | 'inside' | 'end'
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

/** 缺失值：null、undefined、NaN 与非数都算缺失，不按 0 处理。 */
function numberOf(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function inferKeyScale(rows: readonly ChartRow[], series: readonly CartesianSeries[], axis: CartesianAxis): CartesianScaleKind {
  if (axis.scale)
    return axis.scale
  if (series.some(s => s.mark === 'bar'))
    return 'band'
  let dates = 0
  let numbers = 0
  let others = 0
  for (const row of rows) {
    for (const s of series) {
      const value = row[s.x]
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
  const assignment = assignChartSeries(seriesInput.map(s => ({ id: s.id, field: s.y, name: s.name, slot: s.slot, tone: s.tone })))
  const issues: ChartSpecIssue[] = [...assignment.issues]

  // 字段在数据里一次都没出现，多半是拼错了：空数据不判，那时什么字段都「不存在」
  if (rows.length > 0) {
    for (const s of seriesInput) {
      for (const field of [s.x, s.y]) {
        if (!rows.some(row => field in row))
          issues.push({ code: DIAGNOSTIC_CODES.chartUnknownField, message: `系列引用的字段「${field}」在数据里不存在`, detail: { field } })
      }
    }
  }

  // 同一堆叠组的堆叠方式必须一致：柱与折线各自成组
  const offsets = new Map<string, Set<string>>()
  for (const s of seriesInput) {
    if (s.stack == null || s.stackOffset == null)
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
  const hasNegative = (s: CartesianSeries): boolean => rows.some(row => (numberOf(row[s.y]) ?? 0) < 0)
  const groupOffset = (s: CartesianSeries): 'none' | 'expand' | 'diverging' => {
    if (s.stack == null)
      return 'none'
    const members = seriesInput.filter(o => o.mark === s.mark && o.stack === s.stack)
    const explicit = members.find(o => o.stackOffset != null)?.stackOffset
    if (explicit)
      return explicit
    return s.mark === 'bar' && members.some(hasNegative) ? 'diverging' : 'none'
  }

  const series = seriesInput.map((s, order): CartesianSeriesSpec => {
    const identity = assignment.series[order]!
    return {
      id: identity.id,
      name: identity.name,
      slot: identity.slot,
      tone: identity.tone,
      mark: s.mark,
      x: s.x,
      y: s.y,
      order,
      stack: s.stack ?? null,
      stackOffset: groupOffset(s),
      curve: s.mark === 'line' ? CURVES[s.curve ?? 'linear'] : 'linear',
      area: s.mark === 'line' && s.area === true,
      symbols: s.mark === 'line' ? (s.symbols ?? 'auto') : 'none',
      connectNulls: s.mark === 'line' && s.connectNulls === true,
      labels: s.labels ?? 'none',
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
        const value = row[s.x]
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

/** 一个系列在每个键上的值与堆叠后的两端。数组按 keys 的位置对齐，缺失为 null。 */
export interface CartesianSeriesValues {
  readonly spec: CartesianSeriesSpec
  /** 原始值。 */
  readonly values: readonly (number | null)[]
  /** 该键取自哪一行；没有时为 −1。 */
  readonly rows: readonly number[]
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
  /** 数据引用（系列 id → 行号）→ 在 keys 里的位置；隐藏系列与没有值的行不在表里。 */
  readonly keyOfRow: ReadonlyMap<string, ReadonlyMap<number, number>>
}

export function deriveCartesian(spec: CartesianSpec, hiddenSeries: readonly string[]): CartesianDerived {
  const hidden = new Set(hiddenSeries)
  const issues: ChartSpecIssue[] = []
  const n = spec.keys.length
  const base = spec.series.filter(s => !hidden.has(s.id)).map((s) => {
    const values = filled<number | null>(n, null)
    const rows = filled(n, -1)
    spec.rows.forEach((row, index) => {
      const id = cartesianKeyId(row[s.x])
      const at = id == null ? undefined : spec.keyIndex.get(id)
      // 同一个键出现在多行时取第一行：一个标记对应一行数据
      if (at === undefined || rows[at] !== -1)
        return
      rows[at] = index
      values[at] = numberOf(row[s.y])
    })
    return { spec: s, values, rows }
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
  readonly issues: readonly ChartSpecIssue[]
}

function toNumber(value: number | Date | undefined): number | undefined {
  return value instanceof Date ? value.valueOf() : value
}

export function cartesianDomains(derived: CartesianDerived): CartesianDomains {
  const { spec } = derived
  const issues: ChartSpecIssue[] = []
  const bars = derived.visible.some(s => s.spec.mark === 'bar')
  const percent = derived.visible.length > 0 && derived.visible.every(s => s.spec.stack != null && s.spec.stackOffset === 'expand')
  const values: number[] = []
  for (const s of derived.visible) {
    for (let j = 0; j < s.high.length; j++) {
      const hi = s.high[j]
      const lo = s.low[j]
      if (hi != null)
        values.push(hi)
      if (lo != null && s.spec.mark === 'bar')
        values.push(lo)
      else if (lo != null && s.spec.area)
        values.push(lo)
    }
  }
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
    const numbers = spec.keys.map(k => (k instanceof Date ? k.valueOf() : Number(k))).filter(Number.isFinite)
    const low = toNumber(spec.xAxis.min) ?? Math.min(...numbers)
    const high = toNumber(spec.xAxis.max) ?? Math.max(...numbers)
    key = numbers.length === 0 && spec.xAxis.min == null ? [0, 1] : low === high ? [low - 1, high + 1] : [low, high]
    if (spec.keyScale === 'log' && (key[0] <= 0 || key[1] <= 0)) {
      issues.push({ code: DIAGNOSTIC_CODES.chartLogDomain, message: '对数轴的定义域必须全为正数', detail: { domain: key } })
      key = [1, 10]
    }
  }
  return { derived, value, key, percent, issues }
}

/* ---------- 格式 ---------- */

export interface CartesianFormats {
  /** 自变量键写成文字：提示框头部、数据表首列、可及名。 */
  readonly key: (key: ChartKey) => string
  /** 数值写成文字。 */
  readonly value: (value: number) => string
}

function isDateFormat(format: CartesianAxisFormat | undefined): format is Intl.DateTimeFormatOptions {
  return typeof format === 'object' && format != null && !('style' in format) && !('notation' in format) && !('precision' in format)
}

const DATE_DEFAULT: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }

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
  /** 每个键在自变量方向上的像素中心。 */
  readonly keyCenters: readonly number[]
  /** 类目轴的带宽；连续轴为 0。 */
  readonly bandwidth: number
  readonly font: FontSpec
  readonly metrics: ChartMetrics
  readonly measurer: TextMeasurer
  readonly formats: CartesianFormats
  /** 堆叠柱写合计。 */
  readonly totals: boolean
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
): CartesianLayout {
  void measurerVersion
  const { spec } = domains.derived
  const vertical = spec.orientation === 'vertical'
  const font = metrics.font
  const formats = cartesianFormats(spec, locale)
  const categoryKeys = spec.keys.map(categoryKey)
  const keyOf = new Map(categoryKeys.map((k, i) => [k, spec.keys[i]!]))
  const keyAxisConfig = spec.xAxis
  const barCount = domains.derived.visible.some(s => s.spec.mark === 'bar')

  // 自变量轴沿哪个方向；horizontal 下类目自上而下排
  const along = (plot: Rect): [number, number] => vertical
    ? (keyAxisConfig.reverse ? [plot.x + plot.width, plot.x] : [plot.x, plot.x + plot.width])
    : (keyAxisConfig.reverse ? [plot.y + plot.height, plot.y] : [plot.y, plot.y + plot.height])
  const across = (plot: Rect): [number, number] => vertical
    ? (spec.yAxis.reverse ? [plot.y, plot.y + plot.height] : [plot.y + plot.height, plot.y])
    : (spec.yAxis.reverse ? [plot.x + plot.width, plot.x] : [plot.x, plot.x + plot.width])

  const keyScaleOf = (plot: Rect): AxisScale => {
    const range = along(plot)
    if (spec.keyScale === 'band')
      return scaleBand({ domain: categoryKeys, range, paddingInner: barCount ? 0.2 : 0.1, paddingOuter: barCount ? 0.1 : 0.05 })
    if (spec.keyScale === 'point')
      return scalePoint({ domain: categoryKeys, range, paddingOuter: 0.5 })
    const [lo, hi] = domains.key ?? [0, 1]
    if (spec.keyScale === 'time')
      return scaleTime({ domain: [new Date(lo), new Date(hi)], range })
    if (spec.keyScale === 'utc')
      return scaleUtc({ domain: [new Date(lo), new Date(hi)], range })
    const scale = spec.keyScale === 'log' ? scaleLog({ domain: [lo, hi], range }) : scaleLinear({ domain: [lo, hi], range })
    return spec.xAxis.nice ? scale.nice() : scale
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
    const base = spec.valueScale === 'log' ? scaleLog({ domain: [lo, hi], range }) : scaleLinear({ domain: [lo, hi], range })
    if (spec.yAxis.nice === false || domains.percent)
      return base
    return base.nice(valueTickCount(range))
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
  const keyCenters = spec.keys.map((key) => {
    if (isCategoryScale(keyScale)) {
      const at = (keyScale.map as (k: string | number) => number | undefined)(categoryKey(key))
      return at == null ? Number.NaN : at + bandwidth / 2
    }
    const at = (keyScale.map as (v: unknown) => number | undefined)(key)
    return at ?? Number.NaN
  })
  return {
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
  /** 在 keys 里的位置；系列分组与整条折线为 −1。 */
  readonly keyIndex: number
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
  if (spec.xAxis.grid === true) {
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
    const paint = { ...(s.spec.slot != null ? { slot: s.spec.slot } : {}), ...(s.spec.tone != null ? { tone: s.spec.tone } : {}) }
    const children: Mark[] = []
    const seriesAnchors = filled<{ x: number, y: number } | null>(spec.keys.length, null)
    anchors.set(id, seriesAnchors)
    info.set(`series:${id}`, { seriesId: id, keyIndex: -1 })

    if (s.spec.mark === 'bar') {
      const slotIndex = barSlots.indexOf(s.spec.stack == null ? `s:${id}` : `g:${s.spec.stack}`)
      for (let j = 0; j < spec.keys.length; j++) {
        const lo = s.low[j]
        const hi = s.high[j]
        const center = layout.keyCenters[j]!
        if (lo == null || hi == null || !Number.isFinite(center))
          continue
        const start = center - groupWidth / 2 + slotIndex * (thickness + gap)
        // 对数轴上没有 0：不堆叠的柱从定义域下界长起
        const a = s.spec.stack == null && spec.valueScale === 'log' ? baseline : toValue(lo)
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
        info.set(key, { seriesId: id, keyIndex: j })
        const rect = vertical
          ? { x: start, y: Math.min(a, far), width: thickness, height: Math.abs(far - a) }
          : { x: Math.min(a, far), y: start, width: Math.abs(far - a), height: thickness }
        children.push({
          kind: 'rect',
          key,
          part: 'bar',
          ...rect,
          cornerRadius: outer ? radius : 0,
          orientation: vertical ? 'vertical' : 'horizontal',
          // 基线在哪一端：纵向正值在下端（end）、负值在上端；横向正值在左端（start）
          baseline: vertical ? (positive ? 'end' : 'start') : (positive ? 'start' : 'end'),
          datum: { seriesId: id, index: rowIndex },
          paint,
          a11y: { label: '', focusable: true },
        })
        seriesAnchors[j] = point(start + thickness / 2, b)
        bars.set(key, { ...rect, positive, stacked: s.spec.stack != null, row: rowIndex })
      }
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
          seriesAnchors[j] = p
          info.set(`${id}:${cartesianDatumId(spec.keys[j]!)}`, { seriesId: id, keyIndex: j })
        }
      }
      // 单调平滑沿自变量方向求：横向时自变量是 y
      const curve: CurveName = !vertical && s.spec.curve === 'monotoneX' ? 'monotoneY' : s.spec.curve
      if (s.spec.area)
        children.push({ kind: 'area', key: `${id}:area`, part: 'area-fill', points, curve, orientation: spec.orientation, paint, a11y: { label: '', focusable: false } })
      children.push({
        kind: 'line',
        key: `${id}:line`,
        part: 'line',
        points: points.map(({ key, x, y, defined }) => ({ key, x, y, defined })),
        curve,
        datum: { seriesId: id, index: 0 },
        paint,
        a11y: { label: '', focusable: true },
      })
      // 数据点：点间距够宽（16px）时才画，太密的点连成一片反而看不清线
      const spacing = spec.keys.length > 1 ? Math.abs(layout.keyCenters[1]! - layout.keyCenters[0]!) : Number.POSITIVE_INFINITY
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

  const labels = cartesianLabels(layout, bars, anchors)
  const scene = createScene({ version, layers: { back, data, front: labels.marks }, bounds: { x: 0, y: 0, width: layout.size.width, height: layout.size.height } })
  return { layout, scene, info, anchors, placements: labels.placements }
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
}

/**
 * 数据标签、堆叠合计与线尾标签，写在前景层。按重要性落位：合计最先，其次线尾标签，最后逐个数据的标签；
 * 与已落位的重叠、越出视口就不写。柱内的标签放不下（字比柱宽、比柱短）不写。
 */
function cartesianLabels(
  layout: CartesianLayout,
  bars: ReadonlyMap<string, BarBox>,
  anchors: ReadonlyMap<string, readonly ({ x: number, y: number } | null)[]>,
): { marks: Mark[], placements: ReadonlyMap<string, 'inside' | 'end'> } {
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
    text: string,
    at: LabelAt,
    placement: 'inside' | 'end',
    priority: number,
    extra: Partial<Pick<TextMark, 'datum' | 'paint'>> = {},
  ): void => {
    const [x, y, anchor, baseline] = at
    candidates.push({
      mark: { kind: 'text', key, part, x, y, text, anchor, baseline, ...extra },
      box: labelBox(x, y, widthOf(text), lineHeight, anchor, baseline),
      priority,
      placement,
    })
  }
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
          add(`label:${key}`, 'data-label', text, at, 'inside', 1, { datum, paint })
        }
        else {
          add(`label:${key}`, 'data-label', text, outside(box), 'end', 1, { datum, paint })
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
        add(`label:${id}:${cartesianDatumId(spec.keys[j]!)}`, 'data-label', formats.value(v), at, 'end', 1, { datum: { seriesId: id, index: s.rows[j]! }, paint })
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
          add(`total:${stack}:${cartesianDatumId(k)}:${sign === 'positive' ? '+' : '-'}`, 'total-label', formats.value(sum), outside(edge), 'end', 3)
        }
      })
    }
  }

  // 线尾标签写在最后一个点的右边；竖向时几条线挤在一起，上下推开，挤不下去掉末值最小的。
  // 有标签被推离了线尾的高度，整列往右挪出一段，被推开的用引导线连回线尾
  const ends: { s: CartesianSeriesValues, text: string, x: number, y: number, px: number, py: number, value: number }[] = []
  for (const s of visible) {
    if (!s.spec.endLabel)
      continue
    const label = endLabelText(s, formats)
    const p = label ? anchors.get(s.spec.id)?.[label.index] : null
    if (!label || !p)
      continue
    ends.push({ s, text: label.text, x: p.x + half + gap * 2, y: p.y, px: p.x, py: p.y, value: Math.abs(s.values[label.index] ?? 0) })
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
    add(`end:${id}`, 'end-label', end.text, [x, end.y, 'start', 'middle'], 'end', 2, { datum, paint })
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

  const kept = placeWithoutOverlap(candidates, { x: 0, y: 0, width: size.width, height: size.height })
  // 标签没落位，它的引导线也不画
  const lines = kept.map(c => leaders.get(c.mark.key)).filter((line): line is LineMark => line != null)
  return {
    marks: [...lines, ...kept.map(c => c.mark)],
    placements: new Map(kept.map(c => [c.mark.key, c.placement])),
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

/** 柱的标签在柱长到八成多时出现；合计与线尾标签等全部长完、描完再出现。 */
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
    else if (mark.part === 'end-label' || mark.part === 'leader-line') {
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

export function cartesianA11y(
  derived: CartesianDerived,
  locale: string,
  translations: CartesianChartTranslations,
): { summary: string, table: TableModel, formats: CartesianFormats } {
  const { spec } = derived
  const formats = cartesianFormats(spec, locale)
  // 规格不合法（id 重复）时也要给出摘要与数据表：同一个 id 只取第一个系列
  const ids = new Set<string>()
  const unique = derived.visible.filter(s => !ids.has(s.spec.id) && ids.add(s.spec.id))
  const series = unique.map(s => ({
    id: s.spec.id,
    name: s.spec.name,
    points: spec.keys.map((key, j) => ({ key, value: s.values[j] ?? null })),
  }))
  const summary = translations.summary(buildChartSummary(series, { formatKey: k => formats.key(k as ChartKey), formatValue: v => formats.value(v) }))
  const table = buildTableModel({
    keyLabel: translations.keyLabel,
    series,
    formatKey: k => formats.key(k as ChartKey),
    formatValue: v => formats.value(v),
    missingText: translations.missingValue,
  })
  return { summary, table, formats }
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
}

export interface CartesianModel {
  readonly spec: CartesianSpec
  readonly derived: CartesianDerived
  readonly domains: CartesianDomains
  readonly formats: CartesianFormats
  /** 规格不合法的原因；非空时不画标记。 */
  readonly issues: readonly ChartSpecIssue[]
  /** 尚未测量时为 null。 */
  readonly scene: CartesianScene | null
  readonly summary: string
  readonly table: TableModel
}

export type CartesianPipeline = (input: CartesianPipelineInput) => CartesianModel

/** 建一条管线：每个图表实例一条，放在机器的 refs 里。 */
export function createCartesianPipeline(): CartesianPipeline {
  const normalize = memoizeLast(normalizeCartesianSpec)
  const derive = memoizeLast(deriveCartesian)
  const domainsOf = memoizeLast(cartesianDomains)
  const layoutOf = memoizeLast(layoutCartesian)
  let version = 0
  const sceneOf = memoizeLast((layout: CartesianLayout) => cartesianScene(layout, ++version))
  const a11yOf = memoizeLast(cartesianA11y)
  // 隐藏系列按内容记忆：受控时作者可能每次给一个新数组，内容没变不该重算
  const hiddenOf = memoizeLast((key: string): readonly string[] => JSON.parse(key) as string[])
  return (input) => {
    const spec = normalize(input.data, input.series, input.xAxis, input.yAxis, input.orientation)
    const derived = derive(spec, hiddenOf(JSON.stringify([...input.hiddenSeries].sort())))
    const domains = domainsOf(derived)
    const a11y = a11yOf(derived, input.locale, input.translations)
    const issues = [...spec.issues, ...derived.issues, ...domains.issues]
    const scene = input.size == null || issues.length > 0
      ? null
      : sceneOf(layoutOf(domains, input.size, input.metrics, input.measurer, input.measurerVersion, input.locale, input.totals === true))
    return { spec, derived, domains, formats: a11y.formats, issues, scene, summary: a11y.summary, table: a11y.table }
  }
}
