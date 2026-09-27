/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 雷达图的管线：规格归一（实体、指标、色槽）→ 派生（隐藏、各指标的量程）→ 布局（半径、角度、指标名的落位）→ 场景 → 无障碍。
// 每段只记住上一次的输入，悬停、聚焦与提示框开合不换任何一段的输入，整条管线走缓存。

import type { FontSpec, LineMark, Mark, NumberFormatSpec, PathMark, Scene, SymbolMark, TableModel, TextMark, TextMeasurer } from '@xihan-ui/viz'
import type { ChartMetrics, ChartRow, ChartSize, ChartSpecIssue } from '../shared/chart'
import type { RadarChartTranslations, RadarCurve, RadarIndicator, RadarScale, RadarShape, RadarSummary } from './radar-chart.types'
import { DIAGNOSTIC_CODES } from '@xihan-ui/core'
import { createNumberFormat, createScene, ellipsize, pointRadial, scaleLinear } from '@xihan-ui/viz'
import { CHART_SLOT_COUNT, memoizeLast } from '../shared/chart'

/** 指标的个数：少于 3 个围不成面，多于 10 个轴挤在一起读不出来。 */
export const RADAR_MIN_INDICATORS = 3
export const RADAR_MAX_INDICATORS = 10

/** 多于这么多系列时多边形互相遮挡，两两配对检查只有前 3 个色槽都合格。 */
export const RADAR_SAFE_SERIES = 3

/** 网格的圈数：量程取整也按这个刻度数取。 */
const RING_LEVELS = 4

/** 指标名最多占绘图区宽度的比例：再宽就截断，图本身不能被挤没。 */
const LABEL_WIDTH_SHARE = 0.22

const TAU = 2 * Math.PI

/* ---------- 规格 ---------- */

export interface RadarIndicatorSpec {
  readonly key: string
  readonly label: string
  readonly min: number | null
  readonly max: number | null
}

/** 一个实体（一个系列）：名字、色槽、所在的行与各指标上的值（缺失为 null）。 */
export interface RadarSeriesSpec {
  readonly id: string
  readonly name: string
  readonly slot: number
  readonly row: number
  readonly values: readonly (number | null)[]
}

export interface RadarSpec {
  readonly data: readonly ChartRow[]
  readonly indicators: readonly RadarIndicatorSpec[]
  readonly series: readonly RadarSeriesSpec[]
  readonly issues: readonly ChartSpecIssue[]
  /** 不妨碍画图、但读者会吃亏的写法：开发期按提醒报。 */
  readonly warnings: readonly ChartSpecIssue[]
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

function indicatorSpecs(indicators: readonly RadarIndicator[] | undefined): RadarIndicatorSpec[] {
  return (indicators ?? []).map(ind => ({
    key: ind.key,
    label: ind.label ?? ind.key,
    min: Number.isFinite(ind.min) ? ind.min! : null,
    max: Number.isFinite(ind.max) ? ind.max! : null,
  }))
}

/** 规格归一：取实体名与各指标的值，核字段、指标个数、量程与系列数，分色槽。 */
export function normalizeRadarSpec(
  data: readonly ChartRow[] | undefined,
  nameField: string | undefined,
  indicators: readonly RadarIndicator[] | undefined,
): RadarSpec {
  const rows = data ?? []
  const inds = indicatorSpecs(indicators)
  const issues: ChartSpecIssue[] = []
  const warnings: ChartSpecIssue[] = []
  if (inds.length < RADAR_MIN_INDICATORS || inds.length > RADAR_MAX_INDICATORS)
    issues.push({ code: DIAGNOSTIC_CODES.chartIndicatorCount, message: `雷达图要 ${RADAR_MIN_INDICATORS}–${RADAR_MAX_INDICATORS} 个指标，给了 ${inds.length} 个`, detail: { count: inds.length } })
  for (const ind of inds) {
    if (ind.min != null && ind.max != null && ind.min >= ind.max)
      issues.push({ code: DIAGNOSTIC_CODES.chartInvalidRange, message: `指标 ${ind.key} 的下限不小于上限`, detail: { key: ind.key, min: ind.min, max: ind.max } })
  }
  if (rows.length === 0 || !nameField || issues.length > 0)
    return { data: rows, indicators: inds, series: [], issues, warnings }
  for (const field of [nameField, ...inds.map(ind => ind.key)]) {
    if (!rows.some(row => row != null && field in row))
      issues.push({ code: DIAGNOSTIC_CODES.chartUnknownField, message: `字段 ${field} 在数据里不存在`, detail: { field } })
  }
  if (issues.length > 0)
    return { data: rows, indicators: inds, series: [], issues, warnings }

  const series: RadarSeriesSpec[] = rows.map((row, i) => ({
    id: String(row[nameField] ?? ''),
    name: String(row[nameField] ?? ''),
    slot: (i % CHART_SLOT_COUNT) + 1,
    row: i,
    values: inds.map(ind => toNumber(row[ind.key])),
  }))
  const seen = new Set<string>()
  for (const s of series) {
    if (seen.has(s.id))
      issues.push({ code: DIAGNOSTIC_CODES.chartDuplicateSeries, message: `实体名 ${s.id} 重复`, detail: { name: s.id } })
    seen.add(s.id)
  }
  if (series.length > CHART_SLOT_COUNT)
    issues.push({ code: DIAGNOSTIC_CODES.chartTooManySeries, message: `有 ${series.length} 个实体，分类色只有 ${CHART_SLOT_COUNT} 个`, detail: { count: series.length } })
  else if (series.length > RADAR_SAFE_SERIES)
    warnings.push({ code: DIAGNOSTIC_CODES.chartRadarOverlap, message: `有 ${series.length} 个实体：多边形互相遮挡，${RADAR_SAFE_SERIES} 个以上时考虑分成几张小图`, detail: { count: series.length } })
  return { data: rows, indicators: inds, series, issues, warnings }
}

/* ---------- 派生 ---------- */

export interface RadarDerived {
  readonly spec: RadarSpec
  /** 参与画的系列：没隐藏的，按数据次序。 */
  readonly visible: readonly RadarSeriesSpec[]
  /** 各指标的量程 [下, 上]：按全部系列算，图例显隐时其余系列的形状不变。 */
  readonly domains: readonly (readonly [number, number])[]
}

/** 取整到刻度上：上限按圈数取整，下限不动（缺省是 0）。 */
function niceMax(lo: number, hi: number): number {
  if (!(hi > lo))
    return lo + 1
  const [, top] = scaleLinear({ domain: [lo, hi], range: [0, 1] }).nice(RING_LEVELS).domain
  return top!
}

export function deriveRadar(spec: RadarSpec, hidden: readonly string[], scale: RadarScale): RadarDerived {
  const off = new Set(hidden)
  const visible = spec.series.filter(s => !off.has(s.id))
  const valuesAt = (j: number): number[] => spec.series.flatMap(s => (s.values[j] == null ? [] : [s.values[j]!]))
  const own = spec.indicators.map((ind, j): [number, number] => {
    const values = valuesAt(j)
    const lo = ind.min ?? Math.min(0, ...values)
    const hi = ind.max ?? niceMax(lo, Math.max(lo, ...values))
    return [lo, hi]
  })
  if (scale === 'independent' || own.length === 0)
    return { spec, visible, domains: own }
  // 共用量程：取各指标量程的并，上限再取整一次；作者写了上下限的指标以写的为准
  const lo = Math.min(...own.map(d => d[0]))
  const hiRaw = Math.max(...own.map(d => d[1]))
  const hi = spec.indicators.every(ind => ind.max != null) ? hiRaw : niceMax(lo, hiRaw)
  return { spec, visible, domains: spec.indicators.map(ind => [ind.min ?? lo, ind.max ?? hi] as const) }
}

/* ---------- 格式 ---------- */

export interface RadarFormats {
  readonly value: (value: number) => string
}

export function radarFormats(locale: string, format: NumberFormatSpec | ((value: number) => string) | undefined): RadarFormats {
  return { value: typeof format === 'function' ? format : createNumberFormat(locale, format ?? {}) }
}

/* ---------- 布局 ---------- */

/** 绘图区里的一个点（px）。 */
export interface RadarPoint {
  readonly x: number
  readonly y: number
}

export interface RadarLayoutOptions {
  readonly shape: RadarShape
  readonly area: boolean
  readonly curve: RadarCurve
}

export interface RadarLabelLayout {
  readonly text: string
  readonly x: number
  readonly y: number
  readonly anchor: 'start' | 'middle' | 'end'
  readonly baseline: 'top' | 'middle' | 'bottom'
}

export interface RadarLayout {
  readonly derived: RadarDerived
  readonly options: RadarLayoutOptions
  readonly size: ChartSize
  readonly cx: number
  readonly cy: number
  readonly radius: number
  /** 各指标轴的角度：0 在 12 点方向、顺时针为正。 */
  readonly angles: readonly number[]
  readonly labels: readonly RadarLabelLayout[]
  /** 系列 id → 各指标上的点；缺失的值落在圆心。 */
  readonly points: ReadonlyMap<string, readonly RadarPoint[]>
  readonly metrics: ChartMetrics
  readonly font: FontSpec
}

function at(cx: number, cy: number, angle: number, radius: number): RadarPoint {
  const [x, y] = pointRadial(angle, radius)
  return { x: cx + x, y: cy + y }
}

export function layoutRadar(
  derived: RadarDerived,
  options: RadarLayoutOptions,
  size: ChartSize,
  metrics: ChartMetrics,
  measurer: TextMeasurer,
  _measurerVersion: number,
): RadarLayout {
  const { width, height } = size
  const font = metrics.font
  const { indicators } = derived.spec
  const n = indicators.length
  const maxLabel = Math.max(0, width * LABEL_WIDTH_SHARE)
  const labelWidth = Math.min(maxLabel, Math.max(0, ...indicators.map(ind => measurer.measure(ind.label, font).width)))
  // 左右留出最宽的指标名，上下各留一行字
  const radius = Math.max(0, Math.min(
    width / 2 - labelWidth - metrics.labelGap - metrics.gap,
    height / 2 - font.lineHeight - metrics.labelGap - metrics.gap,
  ))
  const cx = width / 2
  const cy = height / 2
  const angles = indicators.map((_, j) => (j * TAU) / Math.max(1, n))
  const labels = indicators.map((ind, j): RadarLabelLayout => {
    const angle = angles[j]!
    const p = at(cx, cy, angle, radius + metrics.labelGap)
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)
    return {
      text: ellipsize(ind.label, labelWidth, font, measurer),
      x: p.x,
      y: p.y,
      // 右半边的字从轴端往外写，左半边往回写；正上方与正下方居中
      anchor: sin > 0.05 ? 'start' : sin < -0.05 ? 'end' : 'middle',
      baseline: cos > 0.05 ? 'bottom' : cos < -0.05 ? 'top' : 'middle',
    }
  })
  const points = new Map<string, readonly RadarPoint[]>()
  for (const s of derived.visible) {
    points.set(s.id, s.values.map((value, j) => {
      const [lo, hi] = derived.domains[j]!
      const t = value == null || !(hi > lo) ? 0 : Math.min(1, Math.max(0, (value - lo) / (hi - lo)))
      return at(cx, cy, angles[j]!, radius * t)
    }))
  }
  return { derived, options, size, cx, cy, radius, angles, labels, points, metrics, font }
}

/* ---------- 场景 ---------- */

export interface RadarScene {
  readonly layout: RadarLayout
  readonly scene: Scene
}

/** 数据点的标记键：焦点、按键复用节点都靠它。 */
export function radarPointKey(seriesId: string, indicator: string): string {
  return `${seriesId}:${indicator}`
}

/** 同心圆的一圈：两段半圆弧接成整圈。 */
function circlePath(cx: number, cy: number, r: number): string {
  return `M${cx},${cy - r}A${r},${r},0,1,1,${cx},${cy + r}A${r},${r},0,1,1,${cx},${cy - r}Z`
}

export function radarScene(layout: RadarLayout, version: number): RadarScene {
  const { cx, cy, radius, angles, metrics } = layout
  const { indicators } = layout.derived.spec
  const back: Mark[] = []
  const data: Mark[] = []
  // 网格：等分的几圈与每个指标一根轴，都只给眼睛看
  for (let k = 1; k <= RING_LEVELS; k++) {
    const r = (radius * k) / RING_LEVELS
    const ring: LineMark | PathMark = layout.options.shape === 'circle'
      ? { kind: 'path', key: `ring:${k}`, part: 'grid-ring', d: circlePath(cx, cy, r) }
      : { kind: 'line', key: `ring:${k}`, part: 'grid-ring', curve: 'linearClosed', points: angles.map((a, j) => ({ key: indicators[j]!.key, ...at(cx, cy, a, r) })) }
    back.push(ring)
  }
  angles.forEach((a, j) => {
    back.push({ kind: 'line', key: `spoke:${indicators[j]!.key}`, part: 'spoke', curve: 'linear', points: [{ key: 'center', x: cx, y: cy }, { key: 'end', ...at(cx, cy, a, radius) }] })
  })
  layout.labels.forEach((label, j) => {
    const text: TextMark = { kind: 'text', key: `indicator:${indicators[j]!.key}`, part: 'indicator-label', x: label.x, y: label.y, text: label.text, anchor: label.anchor, baseline: label.baseline }
    back.push(text)
  })

  const curve = layout.options.curve === 'catmull-rom' ? 'catmullRomClosed' : 'linearClosed'
  const pointSize = Math.PI * (metrics.pointSize / 2) ** 2
  for (const s of layout.derived.visible) {
    const points = layout.points.get(s.id) ?? []
    const keyed = points.map((p, j) => ({ key: indicators[j]!.key, x: p.x, y: p.y }))
    const paint = { slot: s.slot, pattern: s.slot }
    const children: Mark[] = []
    if (layout.options.area)
      children.push({ kind: 'line', key: `${s.id}:area`, part: 'area-fill', curve, points: keyed, paint })
    children.push({ kind: 'line', key: `${s.id}:line`, part: 'line', curve, points: keyed, paint })
    // 顶点：缺失的值不画，也不进焦点次序
    points.forEach((p, j) => {
      if (s.values[j] == null)
        return
      const point: SymbolMark = {
        kind: 'symbol',
        key: radarPointKey(s.id, indicators[j]!.key),
        part: 'point',
        x: p.x,
        y: p.y,
        size: pointSize,
        symbol: 'circle',
        datum: { seriesId: s.id, index: j },
        paint,
        a11y: { label: '', focusable: true },
      }
      children.push(point)
    })
    data.push({ kind: 'group', key: `series:${s.id}`, part: 'series', children })
  }
  const scene = createScene({ version, layers: { back, data }, bounds: { x: 0, y: 0, width: layout.size.width, height: layout.size.height } })
  return { layout, scene }
}

/** 首次出现从哪一帧起跑：各系列的轮廓与顶点都收在圆心，一起向外张开；网格与指标名淡入。 */
export function radarEntryScene(target: Scene): Scene {
  const cx = target.bounds.x + target.bounds.width / 2
  const cy = target.bounds.y + target.bounds.height / 2
  const collapse = (mark: Mark): Mark => {
    if (mark.kind === 'group')
      return { ...mark, children: mark.children.map(collapse) }
    if (mark.kind === 'line')
      return { ...mark, points: mark.points.map(p => ({ ...p, x: cx, y: cy })) }
    if (mark.kind === 'symbol')
      return { ...mark, x: cx, y: cy }
    return mark
  }
  return createScene({ version: 0, layers: { data: target.layers.data.map(collapse) }, bounds: target.bounds })
}

/* ---------- 无障碍 ---------- */

export function radarA11y(
  derived: RadarDerived,
  formats: RadarFormats,
  translations: RadarChartTranslations,
): { summary: string, table: TableModel } {
  const { indicators } = derived.spec
  const text = (value: number | null): string => (value == null ? translations.missingValue : formats.value(value))
  const model: RadarSummary = {
    seriesCount: derived.visible.length,
    indicatorCount: indicators.length,
    series: derived.visible.map((s) => {
      // 最高与最低按在各自量程里的位置比：量程不同的两个指标，原值不能直接比
      const ranked = s.values
        .map((value, j) => {
          const [lo, hi] = derived.domains[j]!
          return value == null || !(hi > lo) ? null : { j, value, t: (value - lo) / (hi - lo) }
        })
        .filter(v => v != null)
        .sort((a, b) => b.t - a.t || a.j - b.j)
      const pick = (v: typeof ranked[number] | undefined): { indicator: string, value: string } | null =>
        v ? { indicator: indicators[v.j]!.label, value: formats.value(v.value) } : null
      return { name: s.name, highest: pick(ranked[0]), lowest: ranked.length > 1 ? pick(ranked.at(-1)) : null }
    }),
  }
  const table: TableModel = {
    columns: [
      { id: 'name', label: translations.nameLabel },
      ...indicators.map(ind => ({ id: ind.key, label: ind.label })),
    ],
    rows: derived.visible.map(s => ({
      key: s.id,
      cells: [
        { value: s.name, text: s.name },
        ...s.values.map(value => ({ value, text: text(value) })),
      ],
    })),
  }
  return { summary: translations.summary(model), table }
}

/* ---------- 管线 ---------- */

export interface RadarPipelineInput {
  readonly data: readonly ChartRow[] | undefined
  readonly nameField: string | undefined
  readonly indicators: readonly RadarIndicator[] | undefined
  readonly shape: RadarShape | undefined
  readonly area: boolean | undefined
  readonly scale: RadarScale | undefined
  readonly curve: RadarCurve | undefined
  readonly format: NumberFormatSpec | ((value: number) => string) | undefined
  readonly hiddenSeries: readonly string[]
  readonly size: ChartSize | null
  readonly metrics: ChartMetrics
  readonly measurer: TextMeasurer
  readonly measurerVersion: number
  readonly locale: string
  readonly translations: RadarChartTranslations
}

export interface RadarModel {
  readonly spec: RadarSpec
  readonly derived: RadarDerived
  readonly formats: RadarFormats
  readonly issues: readonly ChartSpecIssue[]
  readonly warnings: readonly ChartSpecIssue[]
  /** 尚未测量或规格不合法时为 null。 */
  readonly scene: RadarScene | null
  readonly summary: string
  readonly table: TableModel
}

export type RadarPipeline = (input: RadarPipelineInput) => RadarModel

/** 建一条管线：每个图表实例一条，放在机器的 refs 里。 */
export function createRadarPipeline(): RadarPipeline {
  const normalize = memoizeLast(normalizeRadarSpec)
  const derive = memoizeLast(deriveRadar)
  const formatsOf = memoizeLast(radarFormats)
  const optionsOf = memoizeLast((shape: RadarShape, area: boolean, curve: RadarCurve): RadarLayoutOptions => ({ shape, area, curve }))
  const layoutOf = memoizeLast(layoutRadar)
  let version = 0
  const sceneOf = memoizeLast((layout: RadarLayout) => radarScene(layout, ++version))
  const a11yOf = memoizeLast(radarA11y)
  // 隐藏的系列按内容记忆：受控时作者可能每次给一个新数组，内容没变不该重算
  const hiddenOf = memoizeLast((key: string): readonly string[] => JSON.parse(key) as string[])
  return (input) => {
    const spec = normalize(input.data, input.nameField, input.indicators)
    const derived = derive(spec, hiddenOf(JSON.stringify([...input.hiddenSeries].sort())), input.scale ?? 'independent')
    const formats = formatsOf(input.locale, input.format)
    const a11y = a11yOf(derived, formats, input.translations)
    const options = optionsOf(input.shape ?? 'polygon', input.area ?? true, input.curve ?? 'linear')
    const scene = input.size == null || spec.issues.length > 0
      ? null
      : sceneOf(layoutOf(derived, options, input.size, input.metrics, input.measurer, input.measurerVersion))
    return { spec, derived, formats, issues: spec.issues, warnings: spec.warnings, scene, summary: a11y.summary, table: a11y.table }
  }
}
