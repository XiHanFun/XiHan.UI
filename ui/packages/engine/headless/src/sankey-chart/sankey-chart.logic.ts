/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 桑基图的交互逻辑：取模型、数据引用的换算、详情载荷、激活来源、按列的键盘导航、命中测试、焦点环与提示框。
// 只算值，不写属性：属性字典都在连接层。数据引用的 seriesId 是 node 或 link，index 是节点或流带在数据里的位置。

import type { PropFn, Scope } from '@xihan-ui/core'
import type { ChartBaseContext, ChartDatumDetails, ChartDatumRef, ChartKey } from '../shared/chart'
import type { SankeyLinkGeometry, SankeyModel, SankeyNodeGeometry } from './sankey-chart.model'
import type { SankeyChartSchema, SankeyOverlay } from './sankey-chart.schema'
import type { SankeyChartTranslations, SankeySummary, SankeyTooltipModel, SankeyTooltipRow } from './sankey-chart.types'
import { resolveLocale } from '@xihan-ui/core'
import { CHART_TRANSLATIONS, chartActiveSource, resolveChartTranslations } from '../shared/chart'
import { sankeyLinkKey, sankeyNodeKey } from './sankey-chart.model'

/** 提示框里流入、流出各列几条；多出来的合成一行「其他」。 */
const TOOLTIP_FLOWS = 6

/** 节点与流带的可及名：名字（流带是「源 → 目标」）与流量。 */
export function defaultSankeyDatumLabel(details: ChartDatumDetails): string {
  return `${details.seriesName}, ${details.formatted.value ?? ''}`
}

/** 缺省摘要：节点数、流带数、合计与最大的一条流带。 */
export function defaultSankeySummary(model: SankeySummary): string {
  if (model.linkCount === 0)
    return 'No data.'
  const head = `${model.nodeCount} nodes, ${model.linkCount} ${model.linkCount === 1 ? 'flow' : 'flows'}, total ${model.total}.`
  return model.largest ? `${head} Largest flow: ${model.largest.source} to ${model.largest.target}, ${model.largest.value}.` : head
}

export const SANKEY_TRANSLATIONS: SankeyChartTranslations = Object.freeze({
  ...CHART_TRANSLATIONS,
  datumLabel: defaultSankeyDatumLabel,
  sourceLabel: 'Source',
  targetLabel: 'Target',
  valueLabel: 'Value',
  inflowLabel: 'From',
  outflowLabel: 'To',
  summary: defaultSankeySummary,
})

const translationsCache = new WeakMap<object, SankeyChartTranslations>()

/** 合并作者给的文案；同一个覆盖对象只合并一次，管线的无障碍段才不会因为文案对象每次新建而重算。 */
export function sankeyTranslations(overrides: Partial<SankeyChartTranslations> | undefined): SankeyChartTranslations {
  if (!overrides)
    return SANKEY_TRANSLATIONS
  let hit = translationsCache.get(overrides)
  if (!hit) {
    hit = resolveChartTranslations(SANKEY_TRANSLATIONS, overrides)
    translationsCache.set(overrides, hit)
  }
  return hit
}

/** 取模型要读的那几处：机器的参数与连接层的服务都满足它。 */
export interface SankeyModelSource {
  prop: PropFn<SankeyChartSchema>
  context: { get: <K extends keyof ChartBaseContext>(key: K) => ChartBaseContext[K] }
  refs: { get: <K extends keyof SankeyChartSchema['refs']>(key: K) => SankeyChartSchema['refs'][K] }
  scope: Scope
}

/** 跑一遍管线：各段按输入引用记忆，悬停与聚焦只是读缓存。 */
export function sankeyModelOf(source: SankeyModelSource): SankeyModel {
  const { prop, context, refs, scope } = source
  return refs.get('pipeline')({
    nodes: prop('nodes'),
    links: prop('links'),
    orientation: prop('orientation'),
    nodeAlign: prop('nodeAlign'),
    nodeSort: prop('nodeSort'),
    hiddenSeries: context.get('hiddenSeries'),
    format: prop('format'),
    size: context.get('size'),
    metrics: context.get('metrics'),
    measurer: refs.get('measurer'),
    measurerVersion: context.get('measurerVersion'),
    locale: resolveLocale(prop('locale'), scope),
    translations: sankeyTranslations(prop('translations')),
  })
}

/** 引用指着的看得见的节点。 */
export function sankeyNodeOf(model: SankeyModel, ref: ChartDatumRef | null | undefined): SankeyNodeGeometry | undefined {
  if (ref?.seriesId !== 'node')
    return undefined
  const spec = model.spec.nodes[ref.index]
  return spec ? model.scene?.layout.byId.get(spec.id) : undefined
}

/** 引用指着的看得见的流带。 */
export function sankeyLinkOf(model: SankeyModel, ref: ChartDatumRef | null | undefined): SankeyLinkGeometry | undefined {
  return ref?.seriesId === 'link' ? model.scene?.layout.byLink.get(ref.index) : undefined
}

export function sankeyNodeRef(g: SankeyNodeGeometry): ChartDatumRef {
  return { seriesId: 'node', index: g.node.index }
}

/** 引用是否还指着一个画出来的节点或流带。 */
export function sankeyVisible(model: SankeyModel, ref: ChartDatumRef | null | undefined): ref is ChartDatumRef {
  return sankeyNodeOf(model, ref) != null || sankeyLinkOf(model, ref) != null
}

/** 数据引用 → 标记键（焦点与 data-key）。 */
export function sankeyMarkKey(model: SankeyModel, ref: ChartDatumRef): string | null {
  const node = sankeyNodeOf(model, ref)
  if (node)
    return sankeyNodeKey(node.node.id)
  return sankeyLinkOf(model, ref) ? sankeyLinkKey(ref.index) : null
}

/** 联动用的键：节点是它的身份，流带是「源→目标」。 */
export function sankeyKeyOf(model: SankeyModel, ref: ChartDatumRef): ChartKey | null {
  const node = sankeyNodeOf(model, ref)
  if (node)
    return node.node.id
  const link = sankeyLinkOf(model, ref)
  return link ? `${link.link.source}→${link.link.target}` : null
}

/** 第一列最上面的节点：Tab 首次进来落在它上面。 */
export function sankeyFirstRef(model: SankeyModel): ChartDatumRef | null {
  const first = model.scene?.layout.columns.find(c => c.length > 0)?.[0]
  return first ? sankeyNodeRef(first) : null
}

/** 悬停、聚焦或点击到某个节点或流带时报告的内容。 */
export function sankeyDetails(model: SankeyModel, ref: ChartDatumRef): ChartDatumDetails | null {
  const node = sankeyNodeOf(model, ref)
  if (node) {
    return {
      seriesId: node.node.id,
      seriesName: node.node.name,
      slot: node.node.slot,
      tone: null,
      index: node.node.index,
      key: node.node.id,
      values: { value: node.value, inflow: node.inflow, outflow: node.outflow },
      formatted: {
        key: node.node.name,
        value: model.formats.value(node.value),
        inflow: model.formats.value(node.inflow),
        outflow: model.formats.value(node.outflow),
      },
      datum: node.node.datum,
      point: { x: node.x + node.width / 2, y: node.y + node.height / 2 },
    }
  }
  const link = sankeyLinkOf(model, ref)
  if (!link)
    return null
  const source = model.spec.byId.get(link.link.source)!
  const target = model.spec.byId.get(link.link.target)!
  const name = `${source.name} → ${target.name}`
  return {
    seriesId: source.id,
    seriesName: name,
    slot: source.slot,
    tone: null,
    index: link.link.index,
    key: `${source.id}→${target.id}`,
    values: { value: link.link.value, source: source.id, target: target.id },
    formatted: { key: name, value: model.formats.value(link.link.value) },
    datum: link.link.datum,
    // 流带中线的正中：两端的曲线对称，参数取一半正好落在两端中点的连线上
    point: { x: (link.from.x + link.to.x) / 2, y: (link.from.y + link.to.y) / 2 },
  }
}

export interface SankeyActive {
  readonly ref: ChartDatumRef
  /** 联动过来的键不算本图的激活：不通知、不画焦点环。 */
  readonly source: 'pointer' | 'keyboard' | 'linked'
}

/** 激活的节点或流带：指针优先，其次键盘，都没有时看受控的 activeKey（节点的身份或「源→目标」）。 */
export function sankeyActive(model: SankeyModel, context: Pick<ChartBaseContext, 'hover' | 'focused' | 'focusWithin' | 'dismissed' | 'activeKey'>): SankeyActive | null {
  const source = chartActiveSource(context)
  if (source === 'pointer' && context.hover && sankeyVisible(model, context.hover.ref))
    return { ref: context.hover.ref, source }
  if (source === 'keyboard' && context.focused && sankeyVisible(model, context.focused))
    return { ref: context.focused, source }
  if (source == null && !context.dismissed && context.activeKey != null) {
    const key = String(context.activeKey)
    const layout = model.scene?.layout
    const node = layout?.byId.get(key)
    if (node)
      return { ref: sankeyNodeRef(node), source: 'linked' }
    const link = layout?.links.find(g => `${g.link.source}→${g.link.target}` === key)
    if (link)
      return { ref: { seriesId: 'link', index: link.link.index }, source: 'linked' }
  }
  return null
}

/** 键盘的走法：同一列里前后，沿流向到下游 / 上游的相邻列，头尾两列。 */
export type SankeyNavIntent = 'next' | 'prev' | 'downstream' | 'upstream' | 'first' | 'last'

/**
 * 按列的键盘导航：同一列里按屏幕次序前后走；到相邻列时取与当前节点流量最大的相连节点，没有相连的就取位置最近的；
 * 头尾两列同样取位置最近的。到头原地不动（返回 null）。
 */
export function sankeyNavTarget(model: SankeyModel, from: ChartDatumRef, intent: SankeyNavIntent): ChartDatumRef | null {
  const layout = model.scene?.layout
  const node = sankeyNodeOf(model, from)
  if (!layout || !node)
    return null
  const horizontal = layout.options.orientation !== 'vertical'
  const columns = layout.columns.filter(c => c.length > 0)
  const at = columns.findIndex(c => c.includes(node))
  const column = columns[at]!
  if (intent === 'next' || intent === 'prev') {
    const i = column.indexOf(node) + (intent === 'next' ? 1 : -1)
    return i >= 0 && i < column.length ? sankeyNodeRef(column[i]!) : null
  }
  const target = intent === 'downstream' ? at + 1 : intent === 'upstream' ? at - 1 : intent === 'first' ? 0 : columns.length - 1
  if (target === at || target < 0 || target >= columns.length)
    return null
  const candidates = columns[target]!
  const center = (g: SankeyNodeGeometry): number => (horizontal ? g.y + g.height / 2 : g.x + g.width / 2)
  if (intent === 'downstream' || intent === 'upstream') {
    // 两端连着的流带：取流量最大的那一端
    let best: SankeyNodeGeometry | null = null
    let most = -1
    for (const link of layout.derived.links) {
      const other = link.source === node.node.id ? link.target : link.target === node.node.id ? link.source : null
      const g = other == null ? undefined : layout.byId.get(other)
      if (g && candidates.includes(g) && link.value > most) {
        best = g
        most = link.value
      }
    }
    if (best)
      return sankeyNodeRef(best)
  }
  const here = center(node)
  const nearest = candidates.reduce((a, b) => (Math.abs(center(b) - here) < Math.abs(center(a) - here) ? b : a))
  return sankeyNodeRef(nearest)
}

/** 流带中线在流向坐标 a 处的横向位置：两端各一段水平切线的三次贝塞尔，沿流向单调，二分求参数。 */
function ribbonCenter(g: SankeyLinkGeometry, a: number, horizontal: boolean): number | null {
  const a0 = horizontal ? g.from.x : g.from.y
  const a1 = horizontal ? g.to.x : g.to.y
  const c0 = horizontal ? g.from.y : g.from.x
  const c1 = horizontal ? g.to.y : g.to.x
  if (a < Math.min(a0, a1) || a > Math.max(a0, a1))
    return null
  const mid = (a0 + a1) / 2
  const along = (t: number): number => {
    const u = 1 - t
    return a0 * u * u * u + 3 * mid * u * u * t + 3 * mid * u * t * t + a1 * t * t * t
  }
  let lo = 0
  let hi = 1
  for (let i = 0; i < 24; i++) {
    const t = (lo + hi) / 2
    if ((along(t) < a) === (a0 < a1))
      lo = t
    else
      hi = t
  }
  const t = (lo + hi) / 2
  const u = 1 - t
  return c0 * (u * u * u + 3 * u * u * t) + c1 * (3 * u * t * t + t * t * t)
}

/** 指针命中：先看节点（细的节点沿流向放宽到最小命中尺寸），再看流带（落在带里、离中线最近的那条）。 */
export function sankeyHitTest(model: SankeyModel, x: number, y: number): ChartDatumRef | null {
  const layout = model.scene?.layout
  if (!layout)
    return null
  const horizontal = layout.options.orientation !== 'vertical'
  const hitMin = layout.metrics.hitMin
  for (const g of layout.nodes) {
    const padX = horizontal ? Math.max(0, (hitMin - g.width) / 2) : 0
    const padY = horizontal ? 0 : Math.max(0, (hitMin - g.height) / 2)
    if (x >= g.x - padX && x <= g.x + g.width + padX && y >= g.y - padY && y <= g.y + g.height + padY)
      return sankeyNodeRef(g)
  }
  let best: SankeyLinkGeometry | null = null
  let closest = Number.POSITIVE_INFINITY
  for (const g of layout.links) {
    const c = ribbonCenter(g, horizontal ? x : y, horizontal)
    if (c == null)
      continue
    const d = Math.abs((horizontal ? y : x) - c)
    if (d <= g.width / 2 && d < closest) {
      best = g
      closest = d
    }
  }
  return best ? { seriesId: 'link', index: best.link.index } : null
}

const EMPTY_OVERLAY: SankeyOverlay = Object.freeze({ over: [] })

/** 前景层：键盘聚焦时在节点外画一圈焦点环，隔一道表面间隙。 */
export function sankeyOverlay(model: SankeyModel, focused: { ref: ChartDatumRef, ring: boolean } | null): SankeyOverlay {
  const layout = model.scene?.layout
  const g = focused?.ring ? sankeyNodeOf(model, focused.ref) : undefined
  if (!layout || !g)
    return EMPTY_OVERLAY
  const inset = layout.metrics.gap + 1
  return {
    over: [{
      kind: 'rect',
      key: 'focus-ring',
      part: 'focus-ring',
      x: g.x - inset,
      y: g.y - inset,
      width: g.width + inset * 2,
      height: g.height + inset * 2,
      cornerRadius: layout.metrics.radius + inset,
      baseline: 'none',
    }],
  }
}

/** 流入或流出的明细：按流量从大到小，多出来的合成一行「其他」。 */
function flowRows(model: SankeyModel, node: SankeyNodeGeometry, kind: 'in' | 'out', translations: SankeyChartTranslations): SankeyTooltipRow[] {
  const links = model.derived.links
    .filter(l => (kind === 'in' ? l.target : l.source) === node.node.id)
    .sort((a, b) => b.value - a.value)
  const prefix = kind === 'in' ? translations.inflowLabel : translations.outflowLabel
  const rows = links.slice(0, TOOLTIP_FLOWS).map((l): SankeyTooltipRow => {
    const other = model.spec.byId.get(kind === 'in' ? l.source : l.target)!
    return { key: `${kind}:${other.id}`, name: `${prefix} ${other.name}`, value: model.formats.value(l.value), slot: other.slot, kind }
  })
  const rest = links.slice(TOOLTIP_FLOWS)
  if (rest.length > 0) {
    const sum = rest.reduce((s, l) => s + l.value, 0)
    rows.push({ key: `${kind}:\u0000other`, name: `${prefix} ${translations.otherLabel}`, value: model.formats.value(sum), slot: null, kind })
  }
  return rows
}

/** 提示框的内容：节点写合计与流入流出的明细；流带写流量与它占两端的比例。 */
export function sankeyTooltip(model: SankeyModel, active: SankeyActive | null, translations: SankeyChartTranslations): SankeyTooltipModel | null {
  if (!active)
    return null
  const node = sankeyNodeOf(model, active.ref)
  if (node) {
    return {
      header: node.node.name,
      rows: [
        { key: 'value', name: translations.valueLabel, value: model.formats.value(node.value), slot: node.node.slot, kind: 'value' },
        ...flowRows(model, node, 'in', translations),
        ...flowRows(model, node, 'out', translations),
      ],
    }
  }
  const link = sankeyLinkOf(model, active.ref)
  if (!link)
    return null
  const source = model.scene!.layout.byId.get(link.link.source)!
  const target = model.scene!.layout.byId.get(link.link.target)!
  const rows: SankeyTooltipRow[] = [{ key: 'value', name: translations.valueLabel, value: model.formats.value(link.link.value), slot: source.node.slot, kind: 'value' }]
  if (source.outflow > 0)
    rows.push({ key: 'source', name: `${translations.outflowLabel} ${target.node.name}`, value: model.formats.share(link.link.value / source.outflow), slot: null, kind: 'share' })
  if (target.inflow > 0)
    rows.push({ key: 'target', name: `${translations.inflowLabel} ${source.node.name}`, value: model.formats.share(link.link.value / target.inflow), slot: null, kind: 'share' })
  return { header: `${source.node.name} → ${target.node.name}`, rows }
}
