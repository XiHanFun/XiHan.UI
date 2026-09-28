/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 迷你图的管线：规格归一（取值、横坐标、参考带）→ 场景（留边、比例尺、标记）→ 摘要。
// 每段只记住上一次的输入；迷你图不接悬停与聚焦，尺寸与度量不变时整条管线走缓存。

import type { AreaMark, LineMark, Mark, NumberFormatSpec, RectMark, Scene, SymbolMark } from '@xihan-ui/viz'
import type { ChartMetrics, ChartRow, ChartSize, ChartSpecIssue } from '../shared/chart'
import type {
  SparklineCurve,
  SparklineMarkerKind,
  SparklineMarkers,
  SparklineReference,
  SparklineSummary,
  SparklineTranslations,
  SparklineVariant,
} from './sparkline.types'
import { DIAGNOSTIC_CODES } from '@xihan-ui/core'
import { createNumberFormat, createScene, scaleLinear } from '@xihan-ui/viz'
import { memoizeLast } from '../shared/chart'

/** 场景里各个数据标记共用的系列 id：迷你图只有一条系列。 */
export const SPARKLINE_SERIES = 'sparkline'

/* ---------- 规格 ---------- */

export interface SparklineSpec {
  /** 逐个数据的值；缺失为 null。 */
  readonly values: readonly (number | null)[]
  /** 逐个数据的横坐标（数值或日期的时间值）；按数据次序等距排开时为 null。 */
  readonly xs: readonly (number | null)[] | null
  /** 逐个数据的键：过渡按它对齐新旧两帧，数据整体平移一格时折线跟着滑动而不是变形。 */
  readonly keys: readonly string[]
  readonly band: readonly [number, number] | null
  /** 参考线的值：固定值原样，mean / median 按有值的点算出；没有参考线或没有数据时为 null。 */
  readonly reference: number | null
  /** 有值的点数。 */
  readonly count: number
  readonly issues: readonly ChartSpecIssue[]
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number')
    return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

/** 横坐标：数值与日期取时间值，其余（类目名）返回 null。 */
function toPosition(value: unknown): number | null {
  if (value instanceof Date)
    return Number.isFinite(value.valueOf()) ? value.valueOf() : null
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function isRow(value: unknown): value is ChartRow {
  return value != null && typeof value === 'object'
}

const EMPTY_SPEC: SparklineSpec = Object.freeze({ values: [], xs: null, keys: [], band: null, reference: null, count: 0, issues: [] })

/** 参考线的值：固定值原样，均值与中位数按有值的点算。 */
function referenceValue(reference: SparklineReference | undefined, values: readonly (number | null)[]): number | null {
  if (reference == null)
    return null
  if (typeof reference === 'number')
    return reference
  const defined = values.filter((v): v is number => v != null).sort((a, b) => a - b)
  if (defined.length === 0)
    return null
  if (reference === 'mean')
    return defined.reduce((sum, v) => sum + v, 0) / defined.length
  const mid = defined.length >> 1
  return defined.length % 2 === 1 ? defined[mid]! : (defined[mid - 1]! + defined[mid]!) / 2
}

/** 规格归一：取值与横坐标、核字段与参考带。 */
export function normalizeSparklineSpec(
  data: SparklineDataInput | undefined,
  x: string | undefined,
  y: string | undefined,
  band: readonly [number, number] | undefined,
  reference?: SparklineReference,
): SparklineSpec {
  const issues: ChartSpecIssue[] = []
  if (reference != null && reference !== 'mean' && reference !== 'median' && !(typeof reference === 'number' && Number.isFinite(reference)))
    issues.push({ code: DIAGNOSTIC_CODES.chartInvalidRange, message: '参考线要写成有限数，或 mean / median', detail: { reference } })
  let range: readonly [number, number] | null = null
  if (band != null) {
    const [lo, hi] = band
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo > hi)
      issues.push({ code: DIAGNOSTIC_CODES.chartInvalidRange, message: '参考带要写成 [下界, 上界]，两端都是有限数且下界不大于上界', detail: { band } })
    else
      range = [lo, hi]
  }
  const items = data ?? []
  if (items.length === 0)
    return issues.length === 0 ? EMPTY_SPEC : { ...EMPTY_SPEC, issues }

  const rows = items.some(isRow)
  if (rows) {
    if (!y) {
      issues.push({ code: DIAGNOSTIC_CODES.chartUnknownField, message: '数据是对象数组时要用 y 指明数值字段', detail: { field: y } })
    }
    else {
      for (const field of x ? [x, y] : [y]) {
        if (!items.some(item => isRow(item) && field in item))
          issues.push({ code: DIAGNOSTIC_CODES.chartUnknownField, message: `字段 ${field} 在数据里不存在`, detail: { field } })
      }
    }
  }
  if (issues.length > 0)
    return { ...EMPTY_SPEC, issues }

  const valueOf = (item: unknown): number | null => (isRow(item) ? toNumber(item[y!]) : toNumber(item))
  const rawX = rows && x ? items.map(item => (isRow(item) ? item[x] : undefined)) : null
  // 横坐标全是数值或日期时按间距排开；混进了类目名就只能按次序等距
  const continuous = rawX != null && rawX.every(v => v == null || toPosition(v) != null) && rawX.some(v => v != null)
  const xs = continuous ? rawX.map(toPosition) : null
  const values = items.map((item, i) => {
    const value = valueOf(item)
    // 横坐标缺了的点放不上去，与缺值同样断开
    return xs && xs[i] == null ? null : value
  })

  const seen = new Set<string>()
  const keys = items.map((_, i) => {
    const raw = rawX?.[i]
    let key = raw instanceof Date ? String(raw.valueOf()) : raw == null ? String(i) : String(raw)
    if (seen.has(key))
      key = `${key}#${i}`
    seen.add(key)
    return key
  })
  return { values, xs, keys, band: range, reference: referenceValue(reference, values), count: values.filter(v => v != null).length, issues }
}

/** 数据的两种写法。 */
export type SparklineDataInput = readonly (number | null | undefined)[] | readonly ChartRow[]

/* ---------- 标记点 ---------- */

/**
 * 要标出的数据：下标 → 它是哪一种。末点优先于最高、最低：同一个点既是末点又是最高点时只标一次。
 * 全部相等时没有最高与最低可言，只标末点。
 */
export function sparklineMarkerIndexes(values: readonly (number | null)[], markers: SparklineMarkers): ReadonlyMap<number, SparklineMarkerKind> {
  const out = new Map<number, SparklineMarkerKind>()
  if (markers === 'none')
    return out
  let last = -1
  let max = -1
  let min = -1
  values.forEach((v, i) => {
    if (v == null)
      return
    last = i
    if (max < 0 || v > values[max]!)
      max = i
    if (min < 0 || v < values[min]!)
      min = i
  })
  if (last < 0)
    return out
  out.set(last, 'last')
  if (markers === 'extremes' && values[max] !== values[min]) {
    if (!out.has(max))
      out.set(max, 'max')
    if (!out.has(min))
      out.set(min, 'min')
  }
  return out
}

/* ---------- 场景 ---------- */

export interface SparklineSceneOptions {
  readonly variant: SparklineVariant
  readonly curve: SparklineCurve
  readonly markers: SparklineMarkers
}

export interface SparklineScene {
  readonly scene: Scene
  /** 标出的数据：下标 → 哪一种；柱形态按它把柱换成强调色。 */
  readonly markers: ReadonlyMap<number, SparklineMarkerKind>
}

function refOf(index: number): { seriesId: string, index: number } {
  return { seriesId: SPARKLINE_SERIES, index }
}

/** 柱在一格里的宽度与左缘：格子装得下间隙时两侧各留半个，宽度不超过柱厚上限。 */
function barSlot(i: number, step: number, metrics: ChartMetrics): { x: number, width: number } {
  const width = step > metrics.gap * 2 ? Math.min(metrics.barMax, step - metrics.gap) : step
  return { x: i * step + (step - width) / 2, width }
}

export function sparklineScene(spec: SparklineSpec, options: SparklineSceneOptions, size: ChartSize, metrics: ChartMetrics, version: number): SparklineScene {
  const { width, height } = size
  const { variant } = options
  const bounds = { x: 0, y: 0, width, height }
  const back: Mark[] = []
  const data: Mark[] = []
  const front: Mark[] = []
  const markers = variant === 'win-loss' ? new Map<number, SparklineMarkerKind>() : sparklineMarkerIndexes(spec.values, options.markers)
  const n = spec.values.length
  // 没有一个有值的点：什么都不画，连参考带也不画——一条孤零零的底读不出任何东西
  if (spec.count === 0)
    return { scene: createScene({ version, layers: {}, bounds }), markers }

  if (variant === 'win-loss') {
    // 只看正负：正值在中线之上、负值在中线之下，柱等高；0 与缺失不画
    const step = n > 0 ? width / n : 0
    const half = Math.max(0, (height - metrics.gap) / 2)
    spec.values.forEach((v, i) => {
      if (v == null || v === 0)
        return
      const slot = barSlot(i, step, metrics)
      const rise = v > 0
      const bar: RectMark = {
        kind: 'rect',
        key: `bar:${spec.keys[i]}`,
        part: 'bar',
        x: slot.x,
        y: rise ? 0 : height - half,
        width: slot.width,
        height: half,
        cornerRadius: metrics.radius,
        baseline: rise ? 'end' : 'start',
        datum: refOf(i),
        paint: { trend: rise ? 'rise' : 'fall' },
      }
      data.push(bar)
    })
    return { scene: createScene({ version, layers: { data }, bounds }), markers }
  }

  const defined = spec.values.filter((v): v is number => v != null)
  const domain = [...defined, ...(spec.band ?? []), ...(spec.reference == null ? [] : [spec.reference])]
  let lo = domain.length > 0 ? Math.min(...domain) : 0
  let hi = domain.length > 0 ? Math.max(...domain) : 0
  if (variant === 'bar') {
    // 柱从 0 长出：纵向范围必须包含 0，否则柱长不再与数值成比例
    lo = Math.min(lo, 0)
    hi = Math.max(hi, 0)
  }
  if (lo === hi) {
    // 全部相等时画在正中
    lo -= 1
    hi += 1
  }

  // 折线的两端与标记点不能被根的边裁掉：留出线宽的一半，有标记点时留出点的半径加上外圈
  const pointReach = options.markers === 'none' ? 0 : metrics.pointSize / 2 + metrics.gap / 2
  const inset = variant === 'bar' ? 0 : Math.max(metrics.lineWidth / 2, pointReach)
  const yScale = scaleLinear({ domain: [lo, hi], range: [height - inset, inset] })
  const yOf = (v: number): number => yScale.map(v) ?? 0

  if (spec.band) {
    const top = yOf(spec.band[1])
    const band: RectMark = { kind: 'rect', key: 'band', part: 'band', x: 0, y: top, width, height: yOf(spec.band[0]) - top }
    back.push(band)
  }

  // 参考线横贯整条，压在数据底下：它是读数据的尺子，不抢数据的位置
  if (spec.reference != null) {
    const y = yOf(spec.reference)
    back.push({ kind: 'line', key: 'reference', part: 'reference-line', curve: 'linear', points: [{ key: 'start', x: 0, y }, { key: 'end', x: width, y }] })
  }

  if (variant === 'bar') {
    const step = n > 0 ? width / n : 0
    const base = yOf(0)
    spec.values.forEach((v, i) => {
      if (v == null)
        return
      const slot = barSlot(i, step, metrics)
      const top = yOf(v)
      const up = v >= 0
      const bar: RectMark = {
        kind: 'rect',
        key: `bar:${spec.keys[i]}`,
        part: 'bar',
        x: slot.x,
        y: up ? top : base,
        width: slot.width,
        height: Math.abs(base - top),
        cornerRadius: metrics.radius,
        baseline: up ? 'end' : 'start',
        datum: refOf(i),
      }
      data.push(bar)
    })
    return { scene: createScene({ version, layers: { back, data }, bounds }), markers }
  }

  // 横向：有数值或日期横坐标时按间距，否则按次序等距；只有一个点时放在正中
  const span = width - inset * 2
  const xOf = ((): ((i: number) => number) => {
    if (spec.xs) {
      const positions = spec.xs.filter((v): v is number => v != null)
      const x0 = Math.min(...positions)
      const x1 = Math.max(...positions)
      if (x0 === x1)
        return () => width / 2
      const xScale = scaleLinear({ domain: [x0, x1], range: [inset, width - inset] })
      return i => xScale.map(spec.xs![i] ?? x0) ?? 0
    }
    return n > 1 ? i => inset + (span * i) / (n - 1) : () => width / 2
  })()

  const curve = options.curve === 'monotone' ? 'monotoneX' : 'linear'
  const points = spec.values.map((v, i) => ({
    key: spec.keys[i]!,
    x: xOf(i),
    y: v == null ? height : yOf(v),
    y0: height,
    defined: v != null,
  }))
  if (variant === 'area') {
    // 面积铺到根的下沿：它只衬托形状，不按面积读数
    const area: AreaMark = { kind: 'area', key: 'area', part: 'area-fill', points, curve }
    data.push(area)
  }
  const line: LineMark = { kind: 'line', key: 'line', part: 'line', points, curve }
  data.push(line)

  const dotSize = Math.PI * (metrics.pointSize / 2) ** 2
  for (const [i, kind] of markers) {
    const p = points[i]!
    const dot: SymbolMark = { kind: 'symbol', key: `dot:${kind}`, part: 'dot', x: p.x, y: p.y, size: dotSize, symbol: 'circle', datum: refOf(i) }
    front.push(dot)
  }
  return { scene: createScene({ version, layers: { back, data, front }, bounds }), markers }
}

/**
 * 首次出现从哪一帧起跑：折线原样在场，由描线关键帧从头描到尾；标记点原样在场，等笔尖到了由样式淡入；
 * 面积与参考带在场但全透明，随描线一起淡入；柱不在场，从基线长出。
 */
export function sparklineEntryScene(target: Scene): Scene {
  const seed = (marks: readonly Mark[]): Mark[] => marks.flatMap((mark): Mark[] => {
    if (mark.kind === 'line' || mark.kind === 'symbol')
      return [mark]
    if (mark.kind === 'area' || mark.part === 'band' || mark.part === 'reference-line')
      return [{ ...mark, opacity: 0 }]
    return []
  })
  return createScene({
    version: 0,
    layers: { back: seed(target.layers.back), data: seed(target.layers.data), front: seed(target.layers.front) },
    bounds: target.bounds,
  })
}

/** 首次出现时标记点在描线进程里的位置（0–1）：从起点量起的折线长度占全长的比例，笔尖扫到时出现。 */
export function sparklineRevealAt(target: Scene): ReadonlyMap<string, number> {
  const at = new Map<string, number>()
  const line = target.layers.data.find((m): m is LineMark => m.kind === 'line')
  if (!line)
    return at
  const lengths: { x: number, y: number, length: number }[] = []
  let total = 0
  let last: { x: number, y: number } | null = null
  for (const p of line.points) {
    if (p.defined === false) {
      last = null
      continue
    }
    if (last)
      total += Math.hypot(p.x - last.x, p.y - last.y)
    lengths.push({ x: p.x, y: p.y, length: total })
    last = p
  }
  for (const mark of target.layers.front) {
    if (mark.kind !== 'symbol')
      continue
    const hit = lengths.find(p => p.x === mark.x && p.y === mark.y)
    at.set(mark.key, hit && total > 0 ? hit.length / total : 1)
  }
  return at
}

/* ---------- 摘要 ---------- */

export interface SparklineFormats {
  readonly value: (value: number) => string
  readonly change: (value: number) => string
}

export function sparklineFormats(locale: string, format: NumberFormatSpec | ((value: number) => string) | undefined): SparklineFormats {
  const value = typeof format === 'function' ? format : createNumberFormat(locale, format ?? {})
  const change = createNumberFormat(locale, { style: 'percent', precision: { type: 'fixed', digits: 1 } })
  return { value, change }
}

/** 摘要模型：点数、范围、末值、首末变化率；盈亏形态另数正负。 */
export function sparklineSummaryModel(spec: SparklineSpec, variant: SparklineVariant, formats: SparklineFormats): SparklineSummary {
  const defined = spec.values.filter((v): v is number => v != null)
  const first = defined[0]
  const last = defined.at(-1)
  const two = defined.length >= 2
  const change = two && first !== 0 ? Math.abs(last! / first! - 1) : null
  return {
    variant,
    count: defined.length,
    min: defined.length > 0 ? formats.value(Math.min(...defined)) : null,
    max: defined.length > 0 ? formats.value(Math.max(...defined)) : null,
    first: first == null ? null : formats.value(first),
    last: last == null ? null : formats.value(last),
    change: change == null ? null : formats.change(change),
    direction: !two ? null : last! > first! ? 'up' : last! < first! ? 'down' : 'flat',
    wins: defined.filter(v => v > 0).length,
    losses: defined.filter(v => v < 0).length,
    ties: defined.filter(v => v === 0).length,
    // 盈亏形态不画参考线，也不读
    reference: variant === 'win-loss' || spec.reference == null ? null : formats.value(spec.reference),
  }
}

/* ---------- 管线 ---------- */

export interface SparklinePipelineInput {
  readonly data: SparklineDataInput | undefined
  readonly x: string | undefined
  readonly y: string | undefined
  readonly band: readonly [number, number] | undefined
  readonly reference: SparklineReference | undefined
  readonly variant: SparklineVariant | undefined
  readonly curve: SparklineCurve | undefined
  readonly markers: SparklineMarkers | undefined
  readonly format: NumberFormatSpec | ((value: number) => string) | undefined
  readonly size: ChartSize | null
  readonly metrics: ChartMetrics
  readonly locale: string
  readonly translations: SparklineTranslations
}

export interface SparklineModel {
  readonly spec: SparklineSpec
  readonly issues: readonly ChartSpecIssue[]
  /** 尚未测量或规格不合法时为 null。 */
  readonly scene: SparklineScene | null
  readonly summary: string
}

export type SparklinePipeline = (input: SparklinePipelineInput) => SparklineModel

/** 建一条管线：每个实例一条，放在机器的 refs 里。 */
export function createSparklinePipeline(): SparklinePipeline {
  const normalize = memoizeLast(normalizeSparklineSpec)
  const formatsOf = memoizeLast(sparklineFormats)
  const optionsOf = memoizeLast((variant: SparklineVariant, curve: SparklineCurve, markers: SparklineMarkers): SparklineSceneOptions => ({ variant, curve, markers }))
  let version = 0
  const sceneOf = memoizeLast((spec: SparklineSpec, options: SparklineSceneOptions, size: ChartSize, metrics: ChartMetrics) =>
    sparklineScene(spec, options, size, metrics, ++version))
  const summaryOf = memoizeLast((spec: SparklineSpec, variant: SparklineVariant, formats: SparklineFormats, translations: SparklineTranslations) =>
    translations.summary(sparklineSummaryModel(spec, variant, formats)))
  // 参考带按内容记忆：作者常在模板里写字面量数组，每次渲染都是新数组
  const bandOf = memoizeLast((lo: number | undefined, hi: number | undefined): readonly [number, number] | undefined =>
    lo === undefined && hi === undefined ? undefined : [lo as number, hi as number])
  return (input) => {
    const spec = normalize(input.data, input.x, input.y, bandOf(input.band?.[0], input.band?.[1]), input.reference)
    const variant = input.variant ?? 'line'
    const options = optionsOf(variant, input.curve ?? 'linear', input.markers ?? 'last')
    const scene = input.size == null || spec.issues.length > 0 ? null : sceneOf(spec, options, input.size, input.metrics)
    const summary = summaryOf(spec, variant, formatsOf(input.locale, input.format), input.translations)
    return { spec, issues: spec.issues, scene, summary }
  }
}
