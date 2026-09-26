/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 饼图的管线：规格归一（「其他」合并、色槽）→ 派生（隐藏、角度次序、合计）→ 布局（半径、角度、标签避让）→ 场景 → 无障碍。
// 每段只记住上一次的输入，悬停、聚焦与提示框开合不换任何一段的输入，整条管线走缓存。

import type { ArcMark, FontSpec, LineMark, Mark, NumberFormatSpec, Scene, TableModel, TextMark, TextMeasurer } from '@xihan-ui/viz'
import type { ChartMetrics, ChartRow, ChartSize, ChartSpecIssue } from '../shared/chart'
import type { PieChartTranslations, PieLabels, PieSort, PieSummary, PieSweep, PieVariant } from './pie-chart.types'
import { DIAGNOSTIC_CODES } from '@xihan-ui/core'
import { createNumberFormat, createScene, ellipsize, foldSmall, pie, pointRadial } from '@xihan-ui/viz'
import { CHART_SLOT_COUNT, memoizeLast } from '../shared/chart'

/** 合并出来的「其他」扇区的 id：不与作者的扇区名混用。 */
export const PIE_OTHER_ID = '__other__'

/** 缺省最多保留几个扇区（含「其他」）。 */
export const PIE_MAX_SLICES = 6

/** 环形的内半径占外半径的比例。 */
const DONUT_RATIO = 0.6

/** 外侧标签最多占绘图区宽度的比例：再宽就截断，饼本身不能被挤没。 */
const LABEL_WIDTH_SHARE = 0.3

/** 外侧标签要让饼缩到这个半径以下时就不画，宁可只靠图例与提示框。 */
const MIN_RADIUS_WITH_LABELS = 32

const TAU = 2 * Math.PI

/* ---------- 规格 ---------- */

/** 一个扇区的身份：名字、数值、色槽与对应的数据行。 */
export interface PieSliceSpec {
  readonly id: string
  /** 名字；「其他」为空串，显示时取文案。 */
  readonly name: string
  /** 缺失值记为 0。 */
  readonly value: number
  /** 分类色槽 1–8；「其他」为 null。 */
  readonly slot: number | null
  readonly other: boolean
  /** 在原始数据里的行；「其他」是被合并的各行。 */
  readonly rows: readonly number[]
}

export interface PieSpec {
  readonly data: readonly ChartRow[]
  /** 逐行的名字与数值（缺失记 0）：「其他」的提示框按行列出被合并的各项。 */
  readonly names: readonly string[]
  readonly values: readonly number[]
  /** 按数据次序，「其他」在最后。 */
  readonly slices: readonly PieSliceSpec[]
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

const EMPTY_SPEC: PieSpec = Object.freeze({ data: [], names: [], values: [], slices: [], issues: [] })

/** 规格归一：取名字与数值、核字段与负值、把尾部的小扇区并成「其他」、分色槽。 */
export function normalizePieSpec(
  data: readonly ChartRow[] | undefined,
  nameField: string | undefined,
  valueField: string | undefined,
  maxSlices: number | undefined,
): PieSpec {
  const rows = data ?? []
  if (rows.length === 0 || !nameField || !valueField)
    return rows.length === 0 ? EMPTY_SPEC : { data: rows, names: [], values: [], slices: [], issues: [] }
  const issues: ChartSpecIssue[] = []
  for (const field of [nameField, valueField]) {
    if (!rows.some(row => row != null && field in row))
      issues.push({ code: DIAGNOSTIC_CODES.chartUnknownField, message: `字段 ${field} 在数据里不存在`, detail: { field } })
  }
  if (issues.length > 0)
    return { data: rows, names: [], values: [], slices: [], issues }

  const values = rows.map(row => toNumber(row[valueField]) ?? 0)
  const names = rows.map(row => String(row[nameField] ?? ''))
  const negative = values.findIndex(v => v < 0)
  if (negative >= 0)
    return { data: rows, names, values, slices: [], issues: [{ code: DIAGNOSTIC_CODES.chartNegativeShare, message: '饼图的值不能为负', detail: { index: negative, value: values[negative] } }] }

  const seen = new Set<string>([PIE_OTHER_ID])
  for (const name of names) {
    if (seen.has(name))
      issues.push({ code: DIAGNOSTIC_CODES.chartDuplicateSeries, message: `扇区名 ${name} 重复`, detail: { name } })
    seen.add(name)
  }

  const limit = Number.isFinite(maxSlices) && (maxSlices as number) >= 2 ? Math.floor(maxSlices as number) : PIE_MAX_SLICES
  const indexes = rows.map((_, i) => i)
  const fold = foldSmall(indexes, { value: i => values[i], maxSlices: limit })
  if (fold.kept.length > CHART_SLOT_COUNT) {
    issues.push({ code: DIAGNOSTIC_CODES.chartTooManySeries, message: `保留的扇区有 ${fold.kept.length} 个，分类色只有 ${CHART_SLOT_COUNT} 个`, detail: { count: fold.kept.length } })
  }
  const slices: PieSliceSpec[] = fold.kept.map((i, k) => ({
    id: names[i]!,
    name: names[i]!,
    value: values[i]!,
    slot: (k % CHART_SLOT_COUNT) + 1,
    other: false,
    rows: [i],
  }))
  if (fold.folded.length > 0)
    slices.push({ id: PIE_OTHER_ID, name: '', value: fold.otherValue, slot: null, other: true, rows: fold.folded })
  return { data: rows, names, values, slices, issues }
}

/* ---------- 派生 ---------- */

export interface PieDerived {
  readonly spec: PieSpec
  /** 参与画的扇区：没隐藏、值大于 0，按角度次序（自 12 点顺时针）。 */
  readonly visible: readonly PieSliceSpec[]
  readonly total: number
}

/** 隐藏的扇区不画、不计合计；次序按数值从大到小或按数据次序，「其他」始终在最后。 */
export function derivePie(spec: PieSpec, hidden: readonly string[], sort: PieSort | undefined): PieDerived {
  const off = new Set(hidden)
  const shown = spec.slices.filter(s => !off.has(s.id) && s.value > 0)
  const kept = shown.filter(s => !s.other)
  if ((sort ?? 'descending') === 'descending')
    kept.sort((a, b) => b.value - a.value || a.rows[0]! - b.rows[0]!)
  const visible = [...kept, ...shown.filter(s => s.other)]
  return { spec, visible, total: visible.reduce((sum, s) => sum + s.value, 0) }
}

/* ---------- 格式 ---------- */

export interface PieFormats {
  readonly value: (value: number) => string
  readonly share: (share: number) => string
}

export function pieFormats(locale: string, format: NumberFormatSpec | ((value: number) => string) | undefined): PieFormats {
  const value = typeof format === 'function' ? format : createNumberFormat(locale, format ?? {})
  const share = createNumberFormat(locale, { style: 'percent', precision: { type: 'fixed', digits: 1 } })
  return { value, share }
}

/* ---------- 布局 ---------- */

export interface PieSliceGeometry {
  readonly slice: PieSliceSpec
  readonly share: number
  readonly startAngle: number
  readonly endAngle: number
  readonly padAngle: number
  readonly innerRadius: number
  readonly outerRadius: number
  /** 提示框与焦点代理的锚点：环厚中线、中间角度处（绘图区坐标）。 */
  readonly anchor: { readonly x: number, readonly y: number }
}

/** 绘图区里的一个点（px）。 */
export interface PiePoint {
  readonly x: number
  readonly y: number
}

export interface PieLabelLayout {
  readonly id: string
  readonly text: string
  readonly x: number
  readonly y: number
  readonly anchor: 'start' | 'middle' | 'end'
  /** 外侧标签的两段式引导线：扇区外沿、拐点、标签列三个点；内侧标签没有。 */
  readonly leader: readonly [PiePoint, PiePoint, PiePoint] | null
  /** 内侧标签压在扇区色上，字色要跟着色槽取。 */
  readonly inside: boolean
}

export interface PieLayoutOptions {
  readonly variant: PieVariant
  readonly rose: boolean
  readonly sweep: PieSweep
  readonly labels: PieLabels
}

export interface PieLayout {
  readonly derived: PieDerived
  readonly size: ChartSize
  readonly cx: number
  readonly cy: number
  readonly innerRadius: number
  readonly outerRadius: number
  readonly slices: readonly PieSliceGeometry[]
  readonly labels: readonly PieLabelLayout[]
  readonly metrics: ChartMetrics
  readonly font: FontSpec
}

function point(cx: number, cy: number, angle: number, radius: number): PiePoint {
  const [x, y] = pointRadial(angle, radius)
  return { x: cx + x, y: cy + y }
}

/** 一侧的外侧标签：自上而下推开，再自下而上回推；仍放不下就去掉数值最小的那个，直到放得下。 */
function settleColumn<T extends { y: number, value: number }>(items: T[], min: number, max: number, lineHeight: number): T[] {
  let kept = [...items].sort((a, b) => a.y - b.y)
  for (;;) {
    const ys = kept.map(item => item.y)
    for (let i = 0; i < ys.length; i++)
      ys[i] = Math.max(ys[i]!, i === 0 ? min : ys[i - 1]! + lineHeight)
    for (let i = ys.length - 1; i >= 0; i--)
      ys[i] = Math.min(ys[i]!, i === ys.length - 1 ? max : ys[i + 1]! - lineHeight)
    if (ys.length === 0 || ys[0]! >= min - 0.5)
      return kept.map((item, i) => ({ ...item, y: ys[i]! }))
    let smallest = 0
    kept.forEach((item, i) => {
      if (item.value < kept[smallest]!.value)
        smallest = i
    })
    kept = kept.filter((_, i) => i !== smallest)
  }
}

export function layoutPie(
  derived: PieDerived,
  options: PieLayoutOptions,
  size: ChartSize,
  metrics: ChartMetrics,
  measurer: TextMeasurer,
  _measurerVersion: number,
  formats: PieFormats,
  otherLabel: string,
): PieLayout {
  const { width, height } = size
  const font = metrics.font
  const lineHeight = font.lineHeight
  const half = options.sweep === 'half'
  const nameOf = (s: PieSliceSpec): string => (s.other ? otherLabel : s.name)
  const shareOf = (s: PieSliceSpec): number => (derived.total > 0 ? s.value / derived.total : 0)
  const textOf = (s: PieSliceSpec): string => `${nameOf(s)} ${formats.share(shareOf(s))}`

  // 外侧标签的引导线：先沿半径伸出一段，再横着接到标签列
  const radialLeg = metrics.pointSize
  const flatLeg = metrics.pointSize + metrics.labelGap
  const maxLabel = Math.max(0, width * LABEL_WIDTH_SHARE)
  const labelWidth = Math.min(maxLabel, Math.max(0, ...derived.visible.map(s => measurer.measure(textOf(s), font).width)))
  const radiusFor = (outside: boolean): number => {
    const side = outside ? labelWidth + radialLeg + flatLeg + metrics.labelGap : metrics.gap
    const vertical = outside ? lineHeight / 2 : metrics.gap
    return half
      ? Math.min(width / 2 - side, height - vertical - (outside ? lineHeight / 2 : 0))
      : Math.min(width / 2 - side, height / 2 - vertical)
  }
  let outside = options.labels === 'outside' && derived.visible.length > 0
  let radius = radiusFor(outside)
  if (outside && radius < MIN_RADIUS_WITH_LABELS) {
    outside = false
    radius = radiusFor(false)
  }
  radius = Math.max(0, radius)
  const inner = options.variant === 'pie' ? 0 : radius * DONUT_RATIO
  const cx = width / 2
  const cy = half ? (height + radius) / 2 : height / 2
  const [start, end] = half ? [-Math.PI / 2, Math.PI / 2] : [0, TAU]

  const n = derived.visible.length
  const padAngle = n > 1 && radius > 0 ? metrics.gap / radius : 0
  const max = Math.max(0, ...derived.visible.map(s => s.value))
  const angles = options.rose
    ? derived.visible.map((_, i) => {
        const step = (end - start) / Math.max(1, n)
        return { startAngle: start + i * step, endAngle: start + (i + 1) * step, padAngle: Math.min(padAngle, step) }
      })
    : pie(derived.visible, { value: s => s.value, sort: 'none', startAngle: start, endAngle: end, padAngle })
  const slices: PieSliceGeometry[] = derived.visible.map((slice, i) => {
    const a = angles[i]!
    const outer = options.rose && max > 0 ? inner + (radius - inner) * Math.sqrt(slice.value / max) : radius
    const mid = (a.startAngle + a.endAngle) / 2
    return {
      slice,
      share: shareOf(slice),
      startAngle: a.startAngle,
      endAngle: a.endAngle,
      padAngle: a.padAngle,
      innerRadius: inner,
      outerRadius: outer,
      anchor: point(cx, cy, mid, inner > 0 ? (inner + outer) / 2 : outer * DONUT_RATIO),
    }
  })

  const labels: PieLabelLayout[] = []
  if (outside) {
    const top = lineHeight / 2
    const bottom = half ? cy + lineHeight / 2 : height - lineHeight / 2
    for (const right of [true, false]) {
      const column = slices
        .map((g) => {
          const mid = (g.startAngle + g.endAngle) / 2
          const elbow = point(cx, cy, mid, radius + radialLeg)
          return { g, mid, elbow, y: elbow.y, value: g.slice.value }
        })
        .filter(item => (Math.sin(item.mid) >= 0) === right)
      const x = right ? cx + radius + radialLeg + flatLeg : cx - radius - radialLeg - flatLeg
      for (const item of settleColumn(column, top, bottom, lineHeight)) {
        const from = point(cx, cy, item.mid, item.g.outerRadius)
        labels.push({
          id: item.g.slice.id,
          text: ellipsize(textOf(item.g.slice), labelWidth, font, measurer),
          x: right ? x + metrics.labelGap : x - metrics.labelGap,
          y: item.y,
          anchor: right ? 'start' : 'end',
          leader: [from, item.elbow, { x, y: item.y }],
          inside: false,
        })
      }
    }
  }
  else if (options.labels === 'inside') {
    for (const g of slices) {
      // 「其他」是中性灰，没有配对的前景色，不在它上面写字
      if (g.slice.other)
        continue
      const text = formats.share(g.share)
      const textWidth = measurer.measure(text, font).width
      const radiusMid = g.innerRadius > 0 ? (g.innerRadius + g.outerRadius) / 2 : g.outerRadius * DONUT_RATIO
      const arcLength = (g.endAngle - g.startAngle - g.padAngle) * radiusMid
      // 扇区装不下就不画：挤出去的字压在邻居的颜色上读不清
      if (arcLength < textWidth + metrics.labelGap * 2 || g.outerRadius - g.innerRadius < lineHeight + metrics.gap * 2)
        continue
      const at = point(cx, cy, (g.startAngle + g.endAngle) / 2, radiusMid)
      labels.push({ id: g.slice.id, text, x: at.x, y: at.y, anchor: 'middle', leader: null, inside: true })
    }
  }
  return { derived, size, cx, cy, innerRadius: inner, outerRadius: radius, slices, labels, metrics, font }
}

/* ---------- 场景 ---------- */

export interface PieScene {
  readonly layout: PieLayout
  readonly scene: Scene
  /** 扇区 id → 几何。 */
  readonly geometry: ReadonlyMap<string, PieSliceGeometry>
}

/** 扇区对应的数据引用：普通扇区指向它那一行，「其他」没有单独的一行，记为 −1。 */
export function pieRefOf(slice: PieSliceSpec): { seriesId: string, index: number } {
  return { seriesId: slice.id, index: slice.other ? -1 : slice.rows[0]! }
}

/** 扇区的标记键：焦点、按键复用节点都靠它。 */
export function pieSliceKey(id: string): string {
  return `slice:${id}`
}

export function pieScene(layout: PieLayout, version: number): PieScene {
  const { cx, cy } = layout
  const data: Mark[] = []
  const front: Mark[] = []
  const geometry = new Map<string, PieSliceGeometry>()
  for (const g of layout.slices) {
    const slice = g.slice
    geometry.set(slice.id, g)
    const mark: ArcMark = {
      kind: 'arc',
      key: pieSliceKey(slice.id),
      part: 'slice',
      cx,
      cy,
      innerRadius: g.innerRadius,
      outerRadius: g.outerRadius,
      startAngle: g.startAngle,
      endAngle: g.endAngle,
      padAngle: g.padAngle,
      padRadius: layout.outerRadius,
      // 四角与柱的远端同一档圆角；弧会按环厚与弧长把它收小
      cornerRadius: layout.metrics.radius,
      datum: pieRefOf(slice),
      paint: slice.slot == null ? {} : { slot: slice.slot },
      a11y: { label: '', focusable: true },
    }
    data.push(mark)
  }
  for (const label of layout.labels) {
    if (label.leader) {
      // 画成三点的折线而不是路径字符串：过渡里按端点插值，跟着标签一起滑
      const [from, elbow, end] = label.leader
      const leader: LineMark = {
        kind: 'line',
        key: `leader:${label.id}`,
        part: 'leader-line',
        curve: 'linear',
        points: [{ key: 'from', ...from }, { key: 'elbow', ...elbow }, { key: 'end', ...end }],
      }
      front.push(leader)
    }
    const text: TextMark = {
      kind: 'text',
      key: `label:${label.id}`,
      part: 'slice-label',
      x: label.x,
      y: label.y,
      text: label.text,
      anchor: label.anchor,
      baseline: 'middle',
    }
    front.push(text)
  }
  const scene = createScene({ version, layers: { data, front }, bounds: { x: 0, y: 0, width: layout.size.width, height: layout.size.height } })
  return { layout, scene, geometry }
}

/**
 * 首次出现从哪一帧起跑：扇区都收在整圈的起始角上，起止角一起按比例放开，整圈顺着扫开；
 * 标签与引导线原样在场，等扫开的边缘到了由样式淡入。
 */
export function pieEntryScene(target: Scene): Scene {
  const arcs = target.layers.data.filter((mark): mark is ArcMark => mark.kind === 'arc')
  if (arcs.length === 0)
    return createScene({ version: 0, layers: {}, bounds: target.bounds })
  const origin = Math.min(...arcs.map(arc => arc.startAngle))
  return createScene({
    version: 0,
    layers: { data: arcs.map(arc => ({ ...arc, startAngle: origin, endAngle: origin })), front: target.layers.front },
    bounds: target.bounds,
  })
}

/**
 * 标签与引导线随扫开出现：每个扇区的中线角在整圈扫过的角度里所处的位置（0–1），
 * 标签与它的引导线在扫开的边缘到达中线时出现。
 */
export function pieRevealAt(target: Scene): ReadonlyMap<string, number> {
  const arcs = target.layers.data.filter((mark): mark is ArcMark => mark.kind === 'arc')
  const at = new Map<string, number>()
  if (arcs.length === 0)
    return at
  const origin = Math.min(...arcs.map(arc => arc.startAngle))
  const span = Math.max(...arcs.map(arc => arc.endAngle)) - origin
  for (const arc of arcs) {
    const id = arc.datum?.seriesId
    if (id == null)
      continue
    const position = span > 0 ? ((arc.startAngle + arc.endAngle) / 2 - origin) / span : 0
    at.set(`label:${id}`, position)
    at.set(`leader:${id}`, position)
  }
  return at
}

/* ---------- 无障碍 ---------- */

export function pieA11y(
  derived: PieDerived,
  formats: PieFormats,
  translations: PieChartTranslations,
): { summary: string, table: TableModel } {
  const nameOf = (s: PieSliceSpec): string => (s.other ? translations.otherLabel : s.name)
  const shareOf = (s: PieSliceSpec): number => (derived.total > 0 ? s.value / derived.total : 0)
  const ranked = [...derived.visible].sort((a, b) => b.value - a.value)
  const model: PieSummary = {
    sliceCount: derived.visible.length,
    total: formats.value(derived.total),
    slices: ranked.map(s => ({ name: nameOf(s), value: formats.value(s.value), share: formats.share(shareOf(s)) })),
  }
  const table: TableModel = {
    columns: [
      { id: 'name', label: translations.nameLabel },
      { id: 'value', label: translations.valueLabel },
      { id: 'share', label: translations.shareLabel },
    ],
    rows: derived.visible.map(s => ({
      key: s.id,
      cells: [
        { value: nameOf(s), text: nameOf(s) },
        { value: s.value, text: formats.value(s.value) },
        { value: shareOf(s), text: formats.share(shareOf(s)) },
      ],
    })),
  }
  return { summary: translations.summary(model), table }
}

/* ---------- 管线 ---------- */

export interface PiePipelineInput {
  readonly data: readonly ChartRow[] | undefined
  readonly name: string | undefined
  readonly value: string | undefined
  readonly maxSlices: number | undefined
  readonly sort: PieSort | undefined
  readonly variant: PieVariant | undefined
  readonly rose: boolean | undefined
  readonly sweep: PieSweep | undefined
  readonly labels: PieLabels | undefined
  readonly format: NumberFormatSpec | ((value: number) => string) | undefined
  readonly hiddenSeries: readonly string[]
  readonly size: ChartSize | null
  readonly metrics: ChartMetrics
  readonly measurer: TextMeasurer
  readonly measurerVersion: number
  readonly locale: string
  readonly translations: PieChartTranslations
}

export interface PieModel {
  readonly spec: PieSpec
  readonly derived: PieDerived
  readonly formats: PieFormats
  readonly issues: readonly ChartSpecIssue[]
  /** 尚未测量或规格不合法时为 null。 */
  readonly scene: PieScene | null
  readonly summary: string
  readonly table: TableModel
}

export type PiePipeline = (input: PiePipelineInput) => PieModel

/** 建一条管线：每个图表实例一条，放在机器的 refs 里。 */
export function createPiePipeline(): PiePipeline {
  const normalize = memoizeLast(normalizePieSpec)
  const derive = memoizeLast(derivePie)
  const formatsOf = memoizeLast(pieFormats)
  const optionsOf = memoizeLast((variant: PieVariant, rose: boolean, sweep: PieSweep, labels: PieLabels): PieLayoutOptions => ({ variant, rose, sweep, labels }))
  const layoutOf = memoizeLast(layoutPie)
  let version = 0
  const sceneOf = memoizeLast((layout: PieLayout) => pieScene(layout, ++version))
  const a11yOf = memoizeLast(pieA11y)
  // 隐藏的扇区按内容记忆：受控时作者可能每次给一个新数组，内容没变不该重算
  const hiddenOf = memoizeLast((key: string): readonly string[] => JSON.parse(key) as string[])
  return (input) => {
    const spec = normalize(input.data, input.name, input.value, input.maxSlices)
    const derived = derive(spec, hiddenOf(JSON.stringify([...input.hiddenSeries].sort())), input.sort)
    const formats = formatsOf(input.locale, input.format)
    const a11y = a11yOf(derived, formats, input.translations)
    const options = optionsOf(input.variant ?? 'donut', input.rose ?? false, input.sweep ?? 'full', input.labels ?? 'outside')
    const scene = input.size == null || spec.issues.length > 0
      ? null
      : sceneOf(layoutOf(derived, options, input.size, input.metrics, input.measurer, input.measurerVersion, formats, input.translations.otherLabel))
    return { spec, derived, formats, issues: spec.issues, scene, summary: a11y.summary, table: a11y.table }
  }
}
