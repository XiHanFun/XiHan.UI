/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 桑基图的管线：规格归一（节点、流带、分组色槽，成环与非法流带报错）→ 派生（图例显隐后看得见的节点与流带）→
// 布局（分列、松弛、流带两端排位，名字先量再放）→ 场景 → 无障碍。每段只记住上一次的输入，悬停与聚焦不换任何一段的输入。

import type { AreaMark, FontSpec, Mark, NumberFormatSpec, RectMark, Scene, TableModel, TextMark, TextMeasurer } from '@xihan-ui/viz'
import type { SankeyNode } from '@xihan-ui/viz/sankey'
import type { ChartMetrics, ChartRow, ChartSize, ChartSpecIssue } from '../shared/chart'
import type {
  SankeyChartTranslations,
  SankeyLinkDatum,
  SankeyNodeAlign,
  SankeyNodeDatum,
  SankeyNodeSort,
  SankeyOrientation,
  SankeySummary,
} from './sankey-chart.types'
import { DIAGNOSTIC_CODES } from '@xihan-ui/core'
import { createNumberFormat, createScene, ellipsize, isVizError } from '@xihan-ui/viz'
import { sankey } from '@xihan-ui/viz/sankey'
import { CHART_SLOT_COUNT, memoizeLast } from '../shared/chart'

/* ---------- 规格 ---------- */

export interface SankeyNodeSpec {
  readonly id: string
  readonly name: string
  readonly group: string | null
  /** 分类色槽 1–8：按分组第一次出现的次序分；没有分组时全是 1。 */
  readonly slot: number
  /** 在节点数据里的位置；从流带推断出来的节点按出现的先后编号。 */
  readonly index: number
  readonly datum: ChartRow
}

export interface SankeyLinkSpec {
  readonly source: string
  readonly target: string
  readonly value: number
  /** 在流带数据里的位置。 */
  readonly index: number
  readonly datum: ChartRow
}

export interface SankeyGroupSpec {
  readonly id: string
  readonly slot: number
}

export interface SankeySpec {
  readonly nodes: readonly SankeyNodeSpec[]
  readonly byId: ReadonlyMap<string, SankeyNodeSpec>
  readonly links: readonly SankeyLinkSpec[]
  readonly groups: readonly SankeyGroupSpec[]
  readonly issues: readonly ChartSpecIssue[]
}

const EMPTY_SPEC: SankeySpec = Object.freeze({ nodes: [], byId: new Map(), links: [], groups: [], issues: [] })

/** 规格归一：节点缺省从流带推断；分组按第一次出现的先后分色槽；成环、自环、负值与不存在的节点报错。 */
export function normalizeSankeySpec(
  nodes: readonly SankeyNodeDatum[] | undefined,
  links: readonly SankeyLinkDatum[] | undefined,
): SankeySpec {
  if (!links || links.length === 0)
    return EMPTY_SPEC
  const inputs: SankeyNodeDatum[] = nodes ? [...nodes] : []
  if (!nodes) {
    const seen = new Set<string>()
    for (const link of links) {
      for (const id of [link.source, link.target]) {
        if (typeof id === 'string' && !seen.has(id)) {
          seen.add(id)
          inputs.push({ id })
        }
      }
    }
  }
  // 布局自己核一遍：重复的节点、不存在的端点、自环、负值与成环都在这里报出来
  try {
    sankey(inputs.map(n => ({ id: n.id })), links, { size: [1, 1], iterations: 0 })
  }
  catch (error) {
    if (!isVizError(error))
      throw error
    const negative = typeof error.detail.value === 'number' && error.detail.value < 0
    return { ...EMPTY_SPEC, issues: [{ code: negative ? DIAGNOSTIC_CODES.chartNegativeShare : DIAGNOSTIC_CODES.chartSankeyShape, message: error.message, detail: { ...error.detail } }] }
  }
  const groups: SankeyGroupSpec[] = []
  const slotOf = new Map<string, number>()
  for (const n of inputs) {
    if (n.group != null && !slotOf.has(n.group)) {
      slotOf.set(n.group, groups.length + 1)
      groups.push({ id: n.group, slot: groups.length + 1 })
    }
  }
  const issues: ChartSpecIssue[] = []
  if (groups.length > CHART_SLOT_COUNT)
    issues.push({ code: DIAGNOSTIC_CODES.chartTooManySeries, message: `分组有 ${groups.length} 个，分类色只有 ${CHART_SLOT_COUNT} 个：把小的分组合并，或者去掉分组`, detail: { count: groups.length } })
  const specs = inputs.map((n, index): SankeyNodeSpec => ({
    id: n.id,
    name: n.name ?? n.id,
    group: n.group ?? null,
    slot: n.group == null ? 1 : slotOf.get(n.group)!,
    index,
    datum: n as unknown as ChartRow,
  }))
  const linkSpecs = links.map((l, index): SankeyLinkSpec => ({ source: l.source, target: l.target, value: l.value, index, datum: l as unknown as ChartRow }))
  return { nodes: specs, byId: new Map(specs.map(n => [n.id, n])), links: linkSpecs, groups, issues }
}

/* ---------- 派生 ---------- */

export interface SankeyDerived {
  readonly spec: SankeySpec
  /** 看得见的节点：分组没被隐藏、还连着看得见的流带。 */
  readonly nodes: readonly SankeyNodeSpec[]
  /** 看得见的流带：两端都看得见、流量大于 0。 */
  readonly links: readonly SankeyLinkSpec[]
}

export function deriveSankey(spec: SankeySpec, hiddenSeries: readonly string[]): SankeyDerived {
  const hidden = new Set(hiddenSeries)
  const shown = (n: SankeyNodeSpec | undefined): boolean => n != null && (n.group == null || !hidden.has(n.group))
  const links = spec.links.filter(l => l.value > 0 && shown(spec.byId.get(l.source)) && shown(spec.byId.get(l.target)))
  const used = new Set(links.flatMap(l => [l.source, l.target]))
  const nodes = spec.nodes.filter(n => used.has(n.id))
  return { spec, nodes, links }
}

/* ---------- 格式 ---------- */

export interface SankeyFormats {
  readonly value: (value: number) => string
  readonly share: (share: number) => string
}

export function sankeyFormats(locale: string, format: NumberFormatSpec | ((value: number) => string) | undefined): SankeyFormats {
  return {
    value: typeof format === 'function' ? format : createNumberFormat(locale, format ?? {}),
    share: createNumberFormat(locale, { style: 'percent', precision: { type: 'fixed', digits: 1 } }),
  }
}

/* ---------- 布局 ---------- */

export interface SankeyLayoutOptions {
  readonly orientation: SankeyOrientation
  readonly nodeAlign: SankeyNodeAlign
  readonly nodeSort: SankeyNodeSort
}

export interface SankeyLabelLayout {
  readonly text: string
  readonly x: number
  readonly y: number
  readonly anchor: 'start' | 'middle' | 'end'
  readonly baseline: 'top' | 'middle' | 'bottom'
}

export interface SankeyNodeGeometry {
  readonly node: SankeyNodeSpec
  /** 所在的列（自源头数）。 */
  readonly layer: number
  readonly value: number
  readonly inflow: number
  readonly outflow: number
  /** 屏幕上的外接框。 */
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly label: SankeyLabelLayout | null
}

export interface SankeyLinkGeometry {
  readonly link: SankeyLinkSpec
  /** 流带两端的中点与宽：提示框与渐变的锚点。 */
  readonly from: { readonly x: number, readonly y: number }
  readonly to: { readonly x: number, readonly y: number }
  readonly width: number
  /** 流带的上下两条边（流向横排时）：画成一块面积。 */
  readonly points: AreaMark['points']
}

export interface SankeyLayoutResult {
  readonly derived: SankeyDerived
  readonly options: SankeyLayoutOptions
  readonly size: ChartSize
  readonly nodes: readonly SankeyNodeGeometry[]
  readonly byId: ReadonlyMap<string, SankeyNodeGeometry>
  readonly links: readonly SankeyLinkGeometry[]
  /** 流带下标（数据里的位置）→ 几何。 */
  readonly byLink: ReadonlyMap<number, SankeyLinkGeometry>
  /** 看得见的列：每列按屏幕上的次序（横排自上而下、竖排自左而右）。 */
  readonly columns: readonly (readonly SankeyNodeGeometry[])[]
  readonly metrics: ChartMetrics
  readonly font: FontSpec
}

export function layoutSankey(
  derived: SankeyDerived,
  options: SankeyLayoutOptions,
  size: ChartSize,
  metrics: ChartMetrics,
  measurer: TextMeasurer,
  _measurerVersion: number,
): SankeyLayoutResult {
  const font = metrics.font
  const empty: SankeyLayoutResult = { derived, options, size, nodes: [], byId: new Map(), links: [], byLink: new Map(), columns: [], metrics, font }
  if (derived.links.length === 0 || size.width <= 0 || size.height <= 0)
    return empty
  const horizontal = options.orientation !== 'vertical'
  // 布局只会横排：竖排时把宽高对调，排完再转回来
  const along = horizontal ? size.width : size.height
  const across = horizontal ? size.height : size.width
  const nodeWidth = Math.max(1, metrics.barMax)
  // 同一列相邻节点至少隔一行字：名字写在节点侧面，挤不到一起
  const nodePadding = horizontal ? font.lineHeight : font.lineHeight + metrics.labelGap * 2
  const graph = sankey(derived.nodes.map(n => ({ id: n.id })), derived.links, {
    size: [along, across],
    nodeWidth,
    nodePadding,
    nodeAlign: options.nodeAlign,
    nodeSort: options.nodeSort,
  })
  const layers = graph.nodes.reduce((max, n) => Math.max(max, n.layer), 0) + 1
  // 相邻两列之间的空当：名字写在这里，截断到这么宽
  const lane = layers > 1 ? (along - nodeWidth * layers) / (layers - 1) : along - nodeWidth
  const gap = metrics.labelGap
  const toScreen = (a0: number, a1: number, c0: number, c1: number): { x: number, y: number, width: number, height: number } =>
    horizontal ? { x: a0, y: c0, width: a1 - a0, height: c1 - c0 } : { x: c0, y: a0, width: c1 - c0, height: a1 - a0 }

  const specOf = (n: SankeyNode): SankeyNodeSpec => derived.spec.byId.get(n.id)!
  const nodes: SankeyNodeGeometry[] = graph.nodes.map((n) => {
    const box = toScreen(n.x0, n.x1, n.y0, n.y1)
    const spec = specOf(n)
    const inflow = n.targetLinks.reduce((sum, l) => sum + l.value, 0)
    const outflow = n.sourceLinks.reduce((sum, l) => sum + l.value, 0)
    // 前半程的节点名字写在流向的下游一侧，后半程写在上游一侧，都落在列间的空当里
    const downstream = n.x0 < along / 2
    let label: SankeyLabelLayout | null
    if (horizontal) {
      const room = lane - gap * 2
      const text = room > 0 ? ellipsize(spec.name, room, font, measurer) : ''
      label = text ? { text, x: downstream ? box.x + box.width + gap : box.x - gap, y: box.y + box.height / 2, anchor: downstream ? 'start' : 'end', baseline: 'middle' } : null
    }
    else {
      const room = box.width + nodePadding - gap * 2
      const text = room > 0 ? ellipsize(spec.name, room, font, measurer) : ''
      label = text ? { text, x: box.x + box.width / 2, y: downstream ? box.y + box.height + gap : box.y - gap, anchor: 'middle', baseline: downstream ? 'top' : 'bottom' } : null
    }
    return { node: spec, layer: n.layer, value: n.value, inflow, outflow, ...box, label }
  })

  // 一列里的名字挨得太近时只留前一个：布局在挤的时候会把间隙收小，名字就会叠在一起
  const columns: SankeyNodeGeometry[][] = Array.from({ length: layers }, () => [])
  for (const g of nodes)
    columns[g.layer]!.push(g)
  const kept = new Map<SankeyNodeGeometry, SankeyLabelLayout | null>()
  for (const column of columns) {
    column.sort((a, b) => (horizontal ? a.y - b.y : a.x - b.x))
    let last = Number.NEGATIVE_INFINITY
    for (const g of column) {
      if (!g.label) {
        kept.set(g, null)
        continue
      }
      const at = horizontal ? g.label.y : g.label.x
      const need = horizontal ? font.lineHeight : measurer.measure(g.label.text, font).width + gap * 2
      if (at - last >= need) {
        kept.set(g, g.label)
        last = at
      }
      else {
        kept.set(g, null)
      }
    }
  }
  const finalNodes = nodes.map(g => ({ ...g, label: kept.get(g) ?? null }))
  const byGeometry = new Map(nodes.map((g, i) => [g, finalNodes[i]!]))
  const finalColumns = columns.map(column => column.map(g => byGeometry.get(g)!))

  const specLinks = new Map(derived.links.map((l, i) => [i, l]))
  const links: SankeyLinkGeometry[] = graph.links.map((l) => {
    const spec = specLinks.get(l.index)!
    const a0 = l.source.x1
    const a1 = l.target.x0
    const half = l.width / 2
    const points: AreaMark['points'] = horizontal
      ? [{ key: 'from', x: a0, y: l.y0 - half, y0: l.y0 + half }, { key: 'to', x: a1, y: l.y1 - half, y0: l.y1 + half }]
      : [{ key: 'from', y: a0, x: l.y0 - half, x0: l.y0 + half }, { key: 'to', y: a1, x: l.y1 - half, x0: l.y1 + half }]
    const from = horizontal ? { x: a0, y: l.y0 } : { x: l.y0, y: a0 }
    const to = horizontal ? { x: a1, y: l.y1 } : { x: l.y1, y: a1 }
    return { link: spec, from, to, width: l.width, points }
  })
  return {
    derived,
    options,
    size,
    nodes: finalNodes,
    byId: new Map(finalNodes.map(g => [g.node.id, g])),
    links,
    byLink: new Map(links.map(g => [g.link.index, g])),
    columns: finalColumns,
    metrics,
    font,
  }
}

/* ---------- 场景 ---------- */

export interface SankeyScene {
  readonly layout: SankeyLayoutResult
  readonly scene: Scene
}

/** 节点与流带的标记键：焦点与按键复用节点都靠它。 */
export function sankeyNodeKey(id: string): string {
  return `node:${id}`
}

export function sankeyLinkKey(index: number): string {
  return `link:${index}`
}

export function sankeyScene(layout: SankeyLayoutResult, version: number): SankeyScene {
  const horizontal = layout.options.orientation !== 'vertical'
  const radius = layout.metrics.radius
  // 流带垫在节点下面：节点压住流带的两端
  const data: Mark[] = layout.links.map((g): AreaMark => ({
    kind: 'area',
    key: sankeyLinkKey(g.link.index),
    part: 'link',
    datum: { seriesId: 'link', index: g.link.index },
    points: g.points,
    curve: horizontal ? 'bumpX' : 'bumpY',
    orientation: horizontal ? 'vertical' : 'horizontal',
  }))
  const front: Mark[] = []
  for (const g of layout.nodes) {
    const node: RectMark = {
      kind: 'rect',
      key: sankeyNodeKey(g.node.id),
      part: 'node',
      datum: { seriesId: 'node', index: g.node.index },
      paint: { slot: g.node.slot },
      a11y: { label: '', focusable: true },
      x: g.x,
      y: g.y,
      width: g.width,
      height: g.height,
      cornerRadius: Math.min(radius, g.width / 2, g.height / 2),
    }
    data.push(node)
    if (g.label) {
      const text: TextMark = { kind: 'text', key: `label:${g.node.id}`, part: 'node-label', x: g.label.x, y: g.label.y, text: g.label.text, anchor: g.label.anchor, baseline: g.label.baseline }
      front.push(text)
    }
  }
  const scene = createScene({ version, layers: { data, front }, bounds: { x: 0, y: 0, width: layout.size.width, height: layout.size.height } })
  return { layout, scene }
}

/** 首次出现从哪一帧起跑：流带与节点一起淡入；流带没有「从哪里长出来」的自然起点。名字淡入。 */
export function sankeyEntryScene(target: Scene): Scene {
  return createScene({ version: 0, layers: { data: target.layers.data.map(mark => ({ ...mark, opacity: 0 })) }, bounds: target.bounds })
}

/* ---------- 无障碍 ---------- */

export function sankeyA11y(
  derived: SankeyDerived,
  formats: SankeyFormats,
  translations: SankeyChartTranslations,
): { summary: string, table: TableModel } {
  const { spec, nodes, links } = derived
  const nameOf = (id: string): string => spec.byId.get(id)?.name ?? id
  const targets = new Set(links.map(l => l.target))
  const total = links.filter(l => !targets.has(l.source)).reduce((sum, l) => sum + l.value, 0)
  const largest = links.reduce<SankeyLinkSpec | null>((best, l) => (best == null || l.value > best.value ? l : best), null)
  const model: SankeySummary = {
    nodeCount: nodes.length,
    linkCount: links.length,
    total: formats.value(total),
    largest: largest ? { source: nameOf(largest.source), target: nameOf(largest.target), value: formats.value(largest.value) } : null,
  }
  const table: TableModel = {
    columns: [
      { id: 'source', label: translations.sourceLabel },
      { id: 'target', label: translations.targetLabel },
      { id: 'value', label: translations.valueLabel },
    ],
    rows: links.map(l => ({
      key: `${l.source}→${l.target}`,
      cells: [
        { value: nameOf(l.source), text: nameOf(l.source) },
        { value: nameOf(l.target), text: nameOf(l.target) },
        { value: l.value, text: formats.value(l.value) },
      ],
    })),
  }
  return { summary: translations.summary(model), table }
}

/* ---------- 管线 ---------- */

export interface SankeyPipelineInput {
  readonly nodes: readonly SankeyNodeDatum[] | undefined
  readonly links: readonly SankeyLinkDatum[] | undefined
  readonly orientation: SankeyOrientation | undefined
  readonly nodeAlign: SankeyNodeAlign | undefined
  readonly nodeSort: SankeyNodeSort | undefined
  readonly hiddenSeries: readonly string[]
  readonly format: NumberFormatSpec | ((value: number) => string) | undefined
  readonly size: ChartSize | null
  readonly metrics: ChartMetrics
  readonly measurer: TextMeasurer
  readonly measurerVersion: number
  readonly locale: string
  readonly translations: SankeyChartTranslations
}

export interface SankeyModel {
  readonly spec: SankeySpec
  readonly derived: SankeyDerived
  readonly formats: SankeyFormats
  readonly options: SankeyLayoutOptions
  readonly issues: readonly ChartSpecIssue[]
  /** 尚未测量或规格不合法时为 null。 */
  readonly scene: SankeyScene | null
  readonly summary: string
  readonly table: TableModel
}

export type SankeyPipeline = (input: SankeyPipelineInput) => SankeyModel

/** 建一条管线：每个图表实例一条，放在机器的 refs 里。 */
export function createSankeyPipeline(): SankeyPipeline {
  const normalize = memoizeLast(normalizeSankeySpec)
  const derive = memoizeLast(deriveSankey)
  const formatsOf = memoizeLast(sankeyFormats)
  const optionsOf = memoizeLast((orientation: SankeyOrientation, nodeAlign: SankeyNodeAlign, nodeSort: SankeyNodeSort): SankeyLayoutOptions => ({ orientation, nodeAlign, nodeSort }))
  const layoutOf = memoizeLast(layoutSankey)
  let version = 0
  const sceneOf = memoizeLast((layout: SankeyLayoutResult) => sankeyScene(layout, ++version))
  const a11yOf = memoizeLast(sankeyA11y)
  return (input) => {
    const spec = normalize(input.nodes, input.links)
    const derived = derive(spec, input.hiddenSeries)
    const formats = formatsOf(input.locale, input.format)
    const a11y = a11yOf(derived, formats, input.translations)
    const options = optionsOf(input.orientation ?? 'horizontal', input.nodeAlign ?? 'justify', input.nodeSort ?? 'auto')
    const scene = input.size == null || spec.issues.length > 0
      ? null
      : sceneOf(layoutOf(derived, options, input.size, input.metrics, input.measurer, input.measurerVersion))
    return { spec, derived, formats, options, issues: spec.issues, scene, summary: a11y.summary, table: a11y.table }
  }
}
