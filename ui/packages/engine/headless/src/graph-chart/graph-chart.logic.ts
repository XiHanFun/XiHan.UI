/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 关系图的交互逻辑：取模型、数据引用的换算、详情载荷、激活来源、按方向的键盘导航、命中测试、焦点环与提示框。
// 只算值，不写属性：属性字典都在连接层。数据引用的 seriesId 是 node，index 是节点在数据里的位置。

import type { PropFn, Scope } from '@xihan-ui/core'
import type { ChartBaseContext, ChartDatumDetails, ChartDatumRef } from '../shared/chart'
import type { GraphModel, GraphNodeGeometry } from './graph-chart.model'
import type { GraphChartSchema, GraphOverlay } from './graph-chart.schema'
import type { GraphChartTranslations, GraphSummary, GraphTooltipModel, GraphTooltipRow, GraphView } from './graph-chart.types'
import { resolveLocale } from '@xihan-ui/core'
import { GRAPH_CHART_EN_US } from '../locale/en-US'
import { chartActiveSource, resolveChartTranslations } from '../shared/chart'
import { graphNodeKey } from './graph-chart.model'

/** 数据标记的缺省可及名，取自英文语言包。 */
export function defaultGraphDatumLabel(details: ChartDatumDetails): string {
  return GRAPH_CHART_EN_US.datumLabel(details)
}

/** 缺省摘要，取自英文语言包。 */
export function defaultGraphSummary(model: GraphSummary): string {
  return GRAPH_CHART_EN_US.summary(model)
}

export const GRAPH_TRANSLATIONS: GraphChartTranslations = Object.freeze({ ...GRAPH_CHART_EN_US })

const translationsCache = new WeakMap<object, GraphChartTranslations>()

/** 合并作者给的文案；同一个覆盖对象只合并一次，管线的无障碍段才不会因为文案对象每次新建而重算。 */
export function graphTranslations(overrides: Partial<GraphChartTranslations> | undefined): GraphChartTranslations {
  if (!overrides)
    return GRAPH_TRANSLATIONS
  let hit = translationsCache.get(overrides)
  if (!hit) {
    hit = resolveChartTranslations(GRAPH_TRANSLATIONS, overrides)
    translationsCache.set(overrides, hit)
  }
  return hit
}

/** 不缩放、不平移。 */
export const GRAPH_HOME_VIEW: GraphView = Object.freeze({ k: 1, x: 0, y: 0 })

/** 画面按的视图：zoom 关着时恒是原样，受控递进来的视图也不生效。 */
export function graphViewOf(prop: PropFn<GraphChartSchema>, context: GraphModelSource['context']): GraphView {
  return prop('zoom') === true ? context.get('view') ?? GRAPH_HOME_VIEW : GRAPH_HOME_VIEW
}

/** 取模型要读的那几处：机器的参数与连接层的服务都满足它。 */
export interface GraphModelSource {
  prop: PropFn<GraphChartSchema>
  context: { get: <K extends keyof GraphChartSchema['context']>(key: K) => GraphChartSchema['context'][K] }
  refs: { get: <K extends keyof GraphChartSchema['refs']>(key: K) => GraphChartSchema['refs'][K] }
  scope: Scope
}

/** 跑一遍管线：各段按输入引用记忆，悬停与聚焦只是读缓存。 */
export function graphModelOf(source: GraphModelSource): GraphModel {
  const { prop, context, refs, scope } = source
  return refs.get('pipeline')({
    nodes: prop('nodes'),
    links: prop('links'),
    layout: prop('layout'),
    root: prop('root'),
    directed: prop('directed'),
    hiddenSeries: context.get('hiddenSeries'),
    format: prop('format'),
    positions: context.get('positions') ?? null,
    view: graphViewOf(prop, context),
    size: context.get('size'),
    metrics: context.get('metrics'),
    measurer: refs.get('measurer'),
    measurerVersion: context.get('measurerVersion'),
    locale: resolveLocale(prop('locale'), scope),
    translations: graphTranslations(prop('translations')),
  })
}

/** 引用指着的看得见的节点。 */
export function graphNodeOf(model: GraphModel, ref: ChartDatumRef | null | undefined): GraphNodeGeometry | undefined {
  if (ref?.seriesId !== 'node')
    return undefined
  const spec = model.spec.nodes[ref.index]
  return spec ? model.scene?.layout.byId.get(spec.id) : undefined
}

export function graphNodeRef(g: GraphNodeGeometry): ChartDatumRef {
  return { seriesId: 'node', index: g.node.index }
}

/** 数据引用 → 标记键（焦点与 data-key）。 */
export function graphMarkKey(model: GraphModel, ref: ChartDatumRef): string | null {
  const g = graphNodeOf(model, ref)
  return g ? graphNodeKey(g.node.id) : null
}

/** 阅读序里第一个画出来的节点：Tab 首次进来落在它上面。 */
export function graphFirstRef(model: GraphModel): ChartDatumRef | null {
  const layout = model.scene?.layout
  for (const n of model.derived.nodes) {
    const g = layout?.byId.get(n.id)
    if (g)
      return graphNodeRef(g)
  }
  return null
}

/** 悬停、聚焦或点击到某个节点时报告的内容：数值、连线数，有向时分出入。 */
export function graphDetails(model: GraphModel, ref: ChartDatumRef): ChartDatumDetails | null {
  const g = graphNodeOf(model, ref)
  if (!g)
    return null
  const degree = model.derived.degree.get(g.node.id) ?? { in: 0, out: 0 }
  const links = degree.in + degree.out
  const formatted: Record<string, string> = {
    key: g.node.name,
    links: model.formats.count(links),
    incoming: model.formats.count(degree.in),
    outgoing: model.formats.count(degree.out),
  }
  if (g.node.value != null)
    formatted.value = model.formats.value(g.node.value)
  return {
    seriesId: g.node.id,
    seriesName: g.node.name,
    slot: g.node.slot,
    tone: null,
    index: g.node.index,
    key: g.node.id,
    values: { value: g.node.value, links, incoming: degree.in, outgoing: degree.out },
    formatted,
    datum: g.node.datum,
    point: { x: g.x, y: g.y },
  }
}

export interface GraphActive {
  readonly ref: ChartDatumRef
  /** 联动过来的键不算本图的激活：不通知、不画焦点环。 */
  readonly source: 'pointer' | 'keyboard' | 'linked'
}

/** 激活的节点：指针优先，其次键盘，都没有时看受控的 activeKey（节点的身份）。 */
export function graphActive(model: GraphModel, context: Pick<ChartBaseContext, 'hover' | 'focused' | 'focusWithin' | 'dismissed' | 'activeKey'>): GraphActive | null {
  const source = chartActiveSource(context)
  if (source === 'pointer' && context.hover && graphNodeOf(model, context.hover.ref))
    return { ref: context.hover.ref, source }
  if (source === 'keyboard' && context.focused && graphNodeOf(model, context.focused))
    return { ref: context.focused, source }
  if (source == null && !context.dismissed && context.activeKey != null) {
    const g = model.scene?.layout.byId.get(String(context.activeKey))
    if (g)
      return { ref: graphNodeRef(g), source: 'linked' }
  }
  return null
}

/** 键盘的走法：朝四个方向，或阅读序的头尾。 */
export type GraphNavIntent = 'left' | 'right' | 'up' | 'down' | 'first' | 'last'

const DIRECTIONS = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] } as const

/**
 * 按方向的键盘导航：在这个方向左右各 45° 的锥形里找节点，离得近、又偏得少的优先（横向偏移按两倍计）；
 * 锥形里没有节点就原地不动（返回 null）。Home / End 到阅读序的头尾。
 */
export function graphNavTarget(model: GraphModel, from: ChartDatumRef, intent: GraphNavIntent): ChartDatumRef | null {
  const layout = model.scene?.layout
  const here = graphNodeOf(model, from)
  if (!layout || !here)
    return null
  if (intent === 'first' || intent === 'last') {
    const order = model.derived.nodes.map(n => layout.byId.get(n.id)).filter((g): g is GraphNodeGeometry => g != null)
    const target = intent === 'first' ? order[0] : order[order.length - 1]
    return target && target !== here ? graphNodeRef(target) : null
  }
  const [ux, uy] = DIRECTIONS[intent]
  let best: GraphNodeGeometry | null = null
  let score = Number.POSITIVE_INFINITY
  for (const g of layout.nodes) {
    if (g === here)
      continue
    const dx = g.x - here.x
    const dy = g.y - here.y
    const along = dx * ux + dy * uy
    const across = Math.abs(dx * uy - dy * ux)
    if (along <= 0 || across > along)
      continue
    const s = along + across * 2
    if (s < score) {
      score = s
      best = g
    }
  }
  return best ? graphNodeRef(best) : null
}

/** 指针命中：离指针最近、且在节点半径与最小命中尺寸一半里较大者之内的节点。 */
export function graphHitTest(model: GraphModel, x: number, y: number): ChartDatumRef | null {
  const layout = model.scene?.layout
  if (!layout)
    return null
  const reach = layout.metrics.hitMin / 2
  let best: GraphNodeGeometry | null = null
  let closest = Number.POSITIVE_INFINITY
  for (const g of layout.nodes) {
    const d = Math.hypot(x - g.x, y - g.y)
    if (d <= Math.max(g.r, reach) && d - g.r < closest) {
      best = g
      closest = d - g.r
    }
  }
  return best ? graphNodeRef(best) : null
}

const EMPTY_OVERLAY: GraphOverlay = Object.freeze({ over: [] })

/** 前景层：键盘聚焦时在节点外画一圈焦点环，隔一道表面间隙。 */
export function graphOverlay(model: GraphModel, focused: { ref: ChartDatumRef, ring: boolean } | null): GraphOverlay {
  const layout = model.scene?.layout
  const g = focused?.ring ? graphNodeOf(model, focused.ref) : undefined
  if (!layout || !g)
    return EMPTY_OVERLAY
  const inset = layout.metrics.gap + 1
  return { over: [{ kind: 'arc', key: 'focus-ring', part: 'focus-ring', cx: g.x, cy: g.y, innerRadius: 0, outerRadius: g.r + inset, startAngle: 0, endAngle: 2 * Math.PI }] }
}

/** 提示框的内容：头部是名字，下面是数值（有的话）与连线数，有向时分出入。 */
export function graphTooltip(model: GraphModel, active: GraphActive | null, translations: GraphChartTranslations): GraphTooltipModel | null {
  const details = active ? graphDetails(model, active.ref) : null
  if (!details)
    return null
  const rows: GraphTooltipRow[] = []
  if (details.formatted.value)
    rows.push({ key: 'value', name: translations.valueLabel, value: details.formatted.value })
  if (model.directed) {
    rows.push({ key: 'incoming', name: translations.incomingLabel, value: details.formatted.incoming! })
    rows.push({ key: 'outgoing', name: translations.outgoingLabel, value: details.formatted.outgoing! })
  }
  else {
    rows.push({ key: 'links', name: translations.linksLabel, value: details.formatted.links! })
  }
  return { header: details.seriesName, rows }
}
