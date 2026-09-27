/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 漏斗图的管线：规格归一（阶段、数值）→ 派生（隐藏、转化率、色阶位置）→ 布局（行高、宽度、标签与转化率的落位）→ 场景 → 无障碍。
// 每段只记住上一次的输入，悬停、聚焦与提示框开合不换任何一段的输入，整条管线走缓存。

import type { FontSpec, LineMark, Mark, NumberFormatSpec, Scene, TableModel, TextMark, TextMeasurer } from '@xihan-ui/viz'
import type { ChartMetrics, ChartRow, ChartSize, ChartSpecIssue } from '../shared/chart'
import type { FunnelAlign, FunnelChartTranslations, FunnelConversion, FunnelDirection, FunnelLabels, FunnelShape, FunnelSummary } from './funnel-chart.types'
import { DIAGNOSTIC_CODES } from '@xihan-ui/core'
import { createNumberFormat, createScene, ellipsize } from '@xihan-ui/viz'
import { memoizeLast } from '../shared/chart'

/** 色阶只用从 30% 起的一段：最浅的一段压在承载面上看不清。 */
const SEQ_FLOOR = 0.3

/** 阶段标签与转化率最多占绘图区宽度的比例：再宽就截断，漏斗本身不能被挤没。 */
const LABEL_WIDTH_SHARE = 0.3

/* ---------- 规格 ---------- */

/** 一个阶段：名字、数值与所在的行。 */
export interface FunnelStageSpec {
  readonly id: string
  readonly name: string
  readonly value: number
  readonly row: number
}

export interface FunnelSpec {
  readonly data: readonly ChartRow[]
  /** 按数据次序，就是阶段的先后。 */
  readonly stages: readonly FunnelStageSpec[]
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

const EMPTY_SPEC: FunnelSpec = Object.freeze({ data: [], stages: [], issues: [] })

/** 规格归一：取阶段名与数值（缺失记 0），核字段、负值与重名。 */
export function normalizeFunnelSpec(data: readonly ChartRow[] | undefined, nameField: string | undefined, valueField: string | undefined): FunnelSpec {
  const rows = data ?? []
  if (rows.length === 0 || !nameField || !valueField)
    return rows.length === 0 ? EMPTY_SPEC : { data: rows, stages: [], issues: [] }
  const issues: ChartSpecIssue[] = []
  for (const field of [nameField, valueField]) {
    if (!rows.some(row => row != null && field in row))
      issues.push({ code: DIAGNOSTIC_CODES.chartUnknownField, message: `字段 ${field} 在数据里不存在`, detail: { field } })
  }
  if (issues.length > 0)
    return { data: rows, stages: [], issues }
  const stages = rows.map((row, i): FunnelStageSpec => ({
    id: String(row[nameField] ?? ''),
    name: String(row[nameField] ?? ''),
    value: toNumber(row[valueField]) ?? 0,
    row: i,
  }))
  const negative = stages.findIndex(s => s.value < 0)
  if (negative >= 0)
    return { data: rows, stages: [], issues: [{ code: DIAGNOSTIC_CODES.chartNegativeShare, message: '漏斗图的值不能为负', detail: { index: negative, value: stages[negative]!.value } }] }
  const seen = new Set<string>()
  for (const s of stages) {
    if (seen.has(s.id))
      issues.push({ code: DIAGNOSTIC_CODES.chartDuplicateSeries, message: `阶段名 ${s.id} 重复`, detail: { name: s.id } })
    seen.add(s.id)
  }
  return { data: rows, stages, issues }
}

/* ---------- 派生 ---------- */

/** 一个可见阶段的派生量：两种转化率（第一阶段为 null）与色阶位置。 */
export interface FunnelStage {
  readonly spec: FunnelStageSpec
  /** 在可见阶段里的次序。 */
  readonly index: number
  /** 相对上一个可见阶段；上一阶段为 0 时为 null。 */
  readonly previous: number | null
  /** 相对第一个可见阶段；第一阶段为 0 时为 null。 */
  readonly first: number | null
  /** 顺序色阶上的位置：第一阶段最深（1），往后逐级变浅，止于 SEQ_FLOOR。 */
  readonly t: number
}

export interface FunnelDerived {
  readonly spec: FunnelSpec
  readonly visible: readonly FunnelStage[]
  readonly max: number
}

/** 隐藏的阶段不画，转化率跳过它按相邻的可见阶段算。 */
export function deriveFunnel(spec: FunnelSpec, hidden: readonly string[]): FunnelDerived {
  const off = new Set(hidden)
  const kept = spec.stages.filter(s => !off.has(s.id))
  const head = kept[0]?.value ?? 0
  const visible = kept.map((s, i): FunnelStage => {
    const before = i > 0 ? kept[i - 1]!.value : null
    return {
      spec: s,
      index: i,
      previous: before == null || before === 0 ? null : s.value / before,
      first: i === 0 || head === 0 ? null : s.value / head,
      t: kept.length > 1 ? 1 - (1 - SEQ_FLOOR) * (i / (kept.length - 1)) : 1,
    }
  })
  return { spec, visible, max: Math.max(0, ...kept.map(s => s.value)) }
}

/* ---------- 格式 ---------- */

export interface FunnelFormats {
  readonly value: (value: number) => string
  readonly rate: (rate: number) => string
}

export function funnelFormats(locale: string, format: NumberFormatSpec | ((value: number) => string) | undefined): FunnelFormats {
  return {
    value: typeof format === 'function' ? format : createNumberFormat(locale, format ?? {}),
    rate: createNumberFormat(locale, { style: 'percent', precision: { type: 'fixed', digits: 1 } }),
  }
}

/* ---------- 布局 ---------- */

export interface FunnelLayoutOptions {
  readonly shape: FunnelShape
  readonly align: FunnelAlign
  readonly direction: FunnelDirection
  readonly conversion: FunnelConversion
  readonly labels: FunnelLabels
}

/** 一个阶段的几何：四个角（左上、右上、右下、左下）与锚点。 */
export interface FunnelStageGeometry {
  readonly stage: FunnelStage
  readonly y: number
  readonly height: number
  readonly corners: readonly [FunnelPoint, FunnelPoint, FunnelPoint, FunnelPoint]
  /** 提示框与焦点的锚点：阶段的中心。 */
  readonly anchor: FunnelPoint
}

export interface FunnelPoint {
  readonly x: number
  readonly y: number
}

export interface FunnelLabelLayout {
  readonly id: string
  readonly text: string
  readonly x: number
  readonly y: number
  readonly anchor: 'start' | 'middle' | 'end'
  /** 写在阶段里：压在色阶色上，要描一圈承载面色。 */
  readonly inside: boolean
}

export interface FunnelLayout {
  readonly derived: FunnelDerived
  readonly options: FunnelLayoutOptions
  readonly size: ChartSize
  /** 漏斗占的横向范围（不含两侧的标签列）。 */
  readonly left: number
  readonly right: number
  readonly stages: readonly FunnelStageGeometry[]
  readonly labels: readonly FunnelLabelLayout[]
  readonly conversions: readonly FunnelLabelLayout[]
  readonly metrics: ChartMetrics
  readonly font: FontSpec
}

/** 阶段标签的文字：名字与数值。 */
export function funnelLabelText(stage: FunnelStage, formats: FunnelFormats): string {
  return `${stage.spec.name} ${formats.value(stage.spec.value)}`
}

/** 转化率的文字：按基准取一种；第一阶段与基准为 0 时没有。 */
export function funnelConversionText(stage: FunnelStage, conversion: FunnelConversion, formats: FunnelFormats): string | null {
  const rate = conversion === 'previous' ? stage.previous : conversion === 'first' ? stage.first : null
  return rate == null ? null : formats.rate(rate)
}

export function layoutFunnel(
  derived: FunnelDerived,
  options: FunnelLayoutOptions,
  size: ChartSize,
  metrics: ChartMetrics,
  measurer: TextMeasurer,
  _measurerVersion: number,
  formats: FunnelFormats,
): FunnelLayout {
  const { width, height } = size
  const font = metrics.font
  const n = derived.visible.length
  const maxText = Math.max(0, width * LABEL_WIDTH_SHARE)
  const measure = (text: string): number => Math.min(maxText, measurer.measure(text, font).width)
  // 转化率写在左侧一列、落在两个阶段的交界处；外侧标签跟在各自阶段的右边，右侧留出最长那条的宽度
  const conversionTexts = derived.visible.map(s => funnelConversionText(s, options.conversion, formats))
  const leftGutter = conversionTexts.some(t => t != null)
    ? Math.max(0, ...conversionTexts.map(t => (t == null ? 0 : measure(t)))) + metrics.labelGap * 2
    : 0
  const labelTexts = derived.visible.map(s => funnelLabelText(s, formats))
  const rightGutter = options.labels === 'outside' && n > 0
    ? Math.max(0, ...labelTexts.map(measure)) + metrics.labelGap * 2
    : 0
  const left = leftGutter
  const right = Math.max(left, width - rightGutter)
  const span = right - left
  const gap = metrics.gap
  const rowHeight = n > 0 ? Math.max(0, (height - gap * (n - 1)) / n) : 0
  const widthOf = (value: number): number => (derived.max > 0 ? (span * value) / derived.max : 0)
  const center = (left + right) / 2
  const edges = (w: number): [number, number] => (options.align === 'start' ? [left, left + w] : [center - w / 2, center + w / 2])

  const stages = derived.visible.map((stage, i): FunnelStageGeometry => {
    // 金字塔从下往上排：第一阶段在最下面
    const row = options.direction === 'up' ? n - 1 - i : i
    const y = row * (rowHeight + gap)
    const own = widthOf(stage.spec.value)
    // 梯形朝着下一阶段的那条边取下一阶段的宽度，最后一个阶段两条边一样宽；条形两条边都是自己的宽度
    const next = options.shape === 'trapezoid' && i < n - 1 ? widthOf(derived.visible[i + 1]!.spec.value) : own
    const [topW, bottomW] = options.direction === 'up' ? [next, own] : [own, next]
    const [tl, tr] = edges(topW)
    const [bl, br] = edges(bottomW)
    return {
      stage,
      y,
      height: rowHeight,
      corners: [{ x: tl, y }, { x: tr, y }, { x: br, y: y + rowHeight }, { x: bl, y: y + rowHeight }],
      anchor: { x: options.align === 'start' ? left + Math.max(own, next) / 2 : center, y: y + rowHeight / 2 },
    }
  })

  const labels = stages.map((g, i): FunnelLabelLayout => {
    const text = labelTexts[i]!
    const textWidth = measurer.measure(text, font).width
    const [x0, x1] = [Math.min(g.corners[0].x, g.corners[3].x), Math.max(g.corners[1].x, g.corners[2].x)]
    const narrowest = Math.min(g.corners[1].x - g.corners[0].x, g.corners[2].x - g.corners[3].x)
    const cy = g.y + g.height / 2
    // 指定写在里面且放得下就写在阶段里；否则跟在阶段右边
    if (options.labels === 'inside' && textWidth + metrics.labelGap * 2 <= narrowest && font.lineHeight <= g.height)
      return { id: g.stage.spec.id, text, x: options.align === 'start' ? x0 + metrics.labelGap : (x0 + x1) / 2, y: cy, anchor: options.align === 'start' ? 'start' : 'middle', inside: true }
    const x = x1 + metrics.labelGap
    return { id: g.stage.spec.id, text: ellipsize(text, Math.max(0, width - x), font, measurer), x, y: cy, anchor: 'start', inside: false }
  })

  const conversions: FunnelLabelLayout[] = []
  stages.forEach((g, i) => {
    const text = conversionTexts[i]
    if (text == null || i === 0)
      return
    // 落在这一阶段与上一阶段的交界处：金字塔里上一阶段在下面
    const boundary = options.direction === 'up' ? g.y + g.height + gap / 2 : g.y - gap / 2
    conversions.push({ id: g.stage.spec.id, text: ellipsize(text, leftGutter, font, measurer), x: left - metrics.labelGap, y: boundary, anchor: 'end', inside: false })
  })
  return { derived, options, size, left, right, stages, labels, conversions, metrics, font }
}

/* ---------- 场景 ---------- */

export interface FunnelScene {
  readonly layout: FunnelLayout
  readonly scene: Scene
  /** 阶段 id → 几何。 */
  readonly geometry: ReadonlyMap<string, FunnelStageGeometry>
}

/** 阶段的标记键：焦点、按键复用节点都靠它。 */
export function funnelStageKey(id: string): string {
  return `stage:${id}`
}

export function funnelScene(layout: FunnelLayout, version: number): FunnelScene {
  const data: Mark[] = []
  const front: Mark[] = []
  const geometry = new Map<string, FunnelStageGeometry>()
  for (const g of layout.stages) {
    const id = g.stage.spec.id
    geometry.set(id, g)
    // 四个角按键插值：数据变化时阶段在原处伸缩，梯形的斜边跟着下一阶段走
    const [tl, tr, br, bl] = g.corners
    const stage: LineMark = {
      kind: 'line',
      key: funnelStageKey(id),
      part: 'stage',
      curve: 'linearClosed',
      points: [{ key: 'tl', ...tl }, { key: 'tr', ...tr }, { key: 'br', ...br }, { key: 'bl', ...bl }],
      datum: { seriesId: id, index: g.stage.spec.row },
      paint: { t: g.stage.t },
      a11y: { label: '', focusable: true },
    }
    data.push(stage)
  }
  for (const label of layout.labels) {
    const text: TextMark = { kind: 'text', key: `label:${label.id}`, part: 'stage-label', x: label.x, y: label.y, text: label.text, anchor: label.anchor, baseline: 'middle' }
    front.push(text)
  }
  for (const c of layout.conversions) {
    const text: TextMark = { kind: 'text', key: `conversion:${c.id}`, part: 'conversion', x: c.x, y: c.y, text: c.text, anchor: c.anchor, baseline: 'middle' }
    front.push(text)
  }
  const scene = createScene({ version, layers: { data, front }, bounds: { x: 0, y: 0, width: layout.size.width, height: layout.size.height } })
  return { layout, scene, geometry }
}

/** 首次出现从哪一帧起跑：阶段都收成一条线（居中收到中线、对齐起始边收到左缘），横向展开；标签淡入。 */
export function funnelEntryScene(target: Scene): Scene {
  const stages = target.layers.data.filter((mark): mark is LineMark => mark.kind === 'line')
  if (stages.length === 0)
    return createScene({ version: 0, layers: {}, bounds: target.bounds })
  const xs = stages.flatMap(s => s.points.map(p => p.x))
  const lo = Math.min(...xs)
  const hi = Math.max(...xs)
  // 左缘都对齐时是 start 对齐：收到左缘；否则收到中线
  const flush = stages.every(s => Math.abs(s.points[0]!.x - lo) < 0.5 && Math.abs(s.points[3]!.x - lo) < 0.5)
  const to = flush ? lo : (lo + hi) / 2
  return createScene({
    version: 0,
    layers: { data: stages.map(s => ({ ...s, points: s.points.map(p => ({ ...p, x: to })) })) },
    bounds: target.bounds,
  })
}

/* ---------- 无障碍 ---------- */

export function funnelA11y(
  derived: FunnelDerived,
  formats: FunnelFormats,
  translations: FunnelChartTranslations,
): { summary: string, table: TableModel } {
  const { visible } = derived
  const rate = (r: number | null): string => (r == null ? translations.missingValue : formats.rate(r))
  const firstStage = visible[0]
  const lastStage = visible.at(-1)
  const steepest = visible
    .filter(s => s.previous != null)
    .sort((a, b) => a.previous! - b.previous! || a.index - b.index)[0]
  const model: FunnelSummary = {
    stageCount: visible.length,
    first: firstStage ? { name: firstStage.spec.name, value: formats.value(firstStage.spec.value) } : null,
    last: lastStage ? { name: lastStage.spec.name, value: formats.value(lastStage.spec.value) } : null,
    overall: visible.length > 1 && lastStage!.first != null ? formats.rate(lastStage!.first) : null,
    steepest: steepest ? { from: visible[steepest.index - 1]!.spec.name, to: steepest.spec.name, rate: formats.rate(steepest.previous!) } : null,
  }
  const table: TableModel = {
    columns: [
      { id: 'name', label: translations.nameLabel },
      { id: 'value', label: translations.valueLabel },
      { id: 'previous', label: translations.previousLabel },
      { id: 'first', label: translations.firstLabel },
    ],
    rows: visible.map(s => ({
      key: s.spec.id,
      cells: [
        { value: s.spec.name, text: s.spec.name },
        { value: s.spec.value, text: formats.value(s.spec.value) },
        { value: s.previous, text: rate(s.previous) },
        { value: s.first, text: rate(s.first) },
      ],
    })),
  }
  return { summary: translations.summary(model), table }
}

/* ---------- 管线 ---------- */

export interface FunnelPipelineInput {
  readonly data: readonly ChartRow[] | undefined
  readonly nameField: string | undefined
  readonly valueField: string | undefined
  readonly shape: FunnelShape | undefined
  readonly align: FunnelAlign | undefined
  readonly direction: FunnelDirection | undefined
  readonly conversion: FunnelConversion | undefined
  readonly labels: FunnelLabels | undefined
  readonly format: NumberFormatSpec | ((value: number) => string) | undefined
  readonly hiddenSeries: readonly string[]
  readonly size: ChartSize | null
  readonly metrics: ChartMetrics
  readonly measurer: TextMeasurer
  readonly measurerVersion: number
  readonly locale: string
  readonly translations: FunnelChartTranslations
}

export interface FunnelModel {
  readonly spec: FunnelSpec
  readonly derived: FunnelDerived
  readonly formats: FunnelFormats
  readonly options: FunnelLayoutOptions
  readonly issues: readonly ChartSpecIssue[]
  /** 尚未测量或规格不合法时为 null。 */
  readonly scene: FunnelScene | null
  readonly summary: string
  readonly table: TableModel
}

export type FunnelPipeline = (input: FunnelPipelineInput) => FunnelModel

/** 建一条管线：每个图表实例一条，放在机器的 refs 里。 */
export function createFunnelPipeline(): FunnelPipeline {
  const normalize = memoizeLast(normalizeFunnelSpec)
  const derive = memoizeLast(deriveFunnel)
  const formatsOf = memoizeLast(funnelFormats)
  const optionsOf = memoizeLast((shape: FunnelShape, align: FunnelAlign, direction: FunnelDirection, conversion: FunnelConversion, labels: FunnelLabels): FunnelLayoutOptions => ({ shape, align, direction, conversion, labels }))
  const layoutOf = memoizeLast(layoutFunnel)
  let version = 0
  const sceneOf = memoizeLast((layout: FunnelLayout) => funnelScene(layout, ++version))
  const a11yOf = memoizeLast(funnelA11y)
  // 隐藏的阶段按内容记忆：受控时作者可能每次给一个新数组，内容没变不该重算
  const hiddenOf = memoizeLast((key: string): readonly string[] => JSON.parse(key) as string[])
  return (input) => {
    const spec = normalize(input.data, input.nameField, input.valueField)
    const derived = derive(spec, hiddenOf(JSON.stringify([...input.hiddenSeries].sort())))
    const formats = formatsOf(input.locale, input.format)
    const a11y = a11yOf(derived, formats, input.translations)
    const options = optionsOf(input.shape ?? 'trapezoid', input.align ?? 'center', input.direction ?? 'down', input.conversion ?? 'previous', input.labels ?? 'outside')
    const scene = input.size == null || spec.issues.length > 0
      ? null
      : sceneOf(layoutOf(derived, options, input.size, input.metrics, input.measurer, input.measurerVersion, formats))
    return { spec, derived, formats, options, issues: spec.issues, scene, summary: a11y.summary, table: a11y.table }
  }
}
