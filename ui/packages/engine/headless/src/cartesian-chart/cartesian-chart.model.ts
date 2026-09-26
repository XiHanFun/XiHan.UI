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
  TextMeasurer,
  TimeScale,
} from '@xihan-ui/viz'
import type { ChartKey, ChartMetrics, ChartRow, ChartSize, ChartSpecIssue } from '../shared/chart'
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
  scaleBand,
  scaleLinear,
  scaleLog,
  scalePoint,
  scaleTime,
  scaleUtc,
  solvePlotRect,
  stack,
} from '@xihan-ui/viz'
import { assignChartSeries, buildChartSummary, memoizeLast } from '../shared/chart'

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

  // 数值轴的刻度数按像素密度推：纵轴 2.5 倍行高一个，横轴 80px 一个；取整与标签精度用同一个数
  const valueTickCount = (range: readonly number[]): number => typeof spec.yAxis.ticks === 'number'
    ? spec.yAxis.ticks
    : Math.max(2, Math.floor(Math.abs(range[1]! - range[0]!) / (vertical ? font.lineHeight * 2.5 : 80)))
  const valueScaleOf = (plot: Rect): ContinuousScale => {
    const range = across(plot)
    const [lo, hi] = domains.value
    const base = spec.valueScale === 'log' ? scaleLog({ domain: [lo, hi], range }) : scaleLinear({ domain: [lo, hi], range })
    if (spec.yAxis.nice === false || domains.percent)
      return base
    return base.nice(valueTickCount(range))
  }

  const valueSpec: NumberFormatSpec = typeof spec.yAxis.format === 'object' && !isDateFormat(spec.yAxis.format)
    ? spec.yAxis.format
    : domains.percent ? { style: 'percent' } : {}
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
      [keyPosition]: {
        ...common,
        format: (v: unknown) => keyTickFormat(keyFormatScale as AxisScale)(v),
        ticks: spec.xAxis.ticks,
        labelOverflow: spec.xAxis.labelOverflow ?? 'auto',
        maxLabelSize: maxLabel,
        tickLength: keyTicks,
        title: spec.xAxis.title,
      },
      [valuePosition]: {
        ...common,
        format: (v: unknown) => valueTickFormat(valueFormatScale as AxisScale)(v),
        ticks: spec.yAxis.ticks,
        labelOverflow: spec.yAxis.labelOverflow ?? 'auto',
        maxLabelSize: maxLabel,
        tickLength: 0,
        title: spec.yAxis.title,
      },
    },
    scales: {
      [keyPosition]: (plot: Rect) => (keyFormatScale = keyScaleOf(plot)),
      [valuePosition]: (plot: Rect) => (valueFormatScale = valueScaleOf(plot)),
    },
  })

  const keyScale = solved.scales[keyPosition] as AxisScale
  const valueScale = solved.scales[valuePosition] as ContinuousScale
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
    valueAxis: solved.axes[valuePosition] as AxisLayout,
    keyCenters,
    bandwidth,
    font,
    metrics,
  }
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
}

/** 1px 线对齐到像素中心，避免被抗锯齿拉成两像素的灰线。 */
function crisp(value: number): number {
  return Math.round(value) + 0.5
}

function line(key: string, part: string, x1: number, y1: number, x2: number, y2: number): PathMark {
  return { kind: 'path', key, part, d: `M${x1},${y1}L${x2},${y2}` }
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
        const key = `${id}:${j}`
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
          ? { key: String(j), x: p.x, y: p.y, y0: b.y, defined }
          : { key: String(j), x: p.x, y: p.y, x0: b.x, defined })
        if (defined) {
          seriesAnchors[j] = p
          info.set(`${id}:${j}`, { seriesId: id, keyIndex: j })
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
            markers.push({ kind: 'symbol', key: `${id}:m:${j}`, part: 'dot', x: anchor.x, y: anchor.y, size, symbol: 'circle', paint, a11y: { label: '', focusable: false } })
        }
      }
      children.push(...markers)
    }
    data.push({ kind: 'group', key: `series:${id}`, part: 'series', children })
  }

  const scene = createScene({ version, layers: { back, data }, bounds: { x: 0, y: 0, width: layout.size.width, height: layout.size.height } })
  return { layout, scene, info, anchors }
}

/**
 * 首次出现从哪一帧起跑：折线原样在场，由描线关键帧从头描到尾；面积在场但全透明，随描线一起淡入；
 * 柱不在场，从基线长出；坐标轴、点与标签不在场，淡入。
 */
export function cartesianEntryScene(target: Scene): Scene {
  const seed = (marks: readonly Mark[]): Mark[] => marks.flatMap((mark): Mark[] => {
    if (mark.kind === 'group')
      return [{ ...mark, children: seed(mark.children) }]
    if (mark.kind === 'line')
      return [mark]
    if (mark.kind === 'area')
      return [{ ...mark, opacity: 0 }]
    return []
  })
  return createScene({ version: 0, layers: { data: seed(target.layers.data) }, bounds: target.bounds })
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
      : sceneOf(layoutOf(domains, input.size, input.metrics, input.measurer, input.measurerVersion, input.locale))
    return { spec, derived, domains, formats: a11y.formats, issues, scene, summary: a11y.summary, table: a11y.table }
  }
}
