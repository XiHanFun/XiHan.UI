/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 关系图的管线：规格归一（节点、连线、分组色槽，树布局组树，非法数据与规模报错）→ 派生（图例显隐后看得见的节点与连线、阅读序）→
// 底图（力导 / 环形 / 树 / 径向树，落到布局坐标）→ 摆放（拖动后的位置、画布的平移缩放）→ 场景（连线、箭头、节点，名字先量再放）→ 无障碍。
// 每段只记住上一次的输入，悬停与聚焦不换任何一段的输入。

import type { FontSpec, LineMark, Mark, NumberFormatSpec, PathMark, PathSegment, Scene, TableModel, TextMark, TextMeasurer } from '@xihan-ui/viz'
import type { ForceOptions, ForceSimulation } from '@xihan-ui/viz/graph'
import type { HierarchyNode } from '@xihan-ui/viz/hierarchy'
import type { ChartMetrics, ChartRow, ChartSize, ChartSpecIssue } from '../shared/chart'
import type { GraphChartTranslations, GraphLayout, GraphLinkDatum, GraphNodeDatum, GraphSummary, GraphView } from './graph-chart.types'
import { DIAGNOSTIC_CODES } from '@xihan-ui/core'
import { createNumberFormat, createScene, ellipsize, isVizError, segmentsPath } from '@xihan-ui/viz'
import { circular, forceSimulation } from '@xihan-ui/viz/graph'
import { hierarchy, tree } from '@xihan-ui/viz/hierarchy'
import { CHART_SLOT_COUNT, memoizeLast } from '../shared/chart'

/** 多过这么多个节点交互会变慢：按提醒报。 */
export const GRAPH_INTERACTIVE_LIMIT = 500
/** 多过这么多个节点不画：先聚合。 */
export const GRAPH_NODE_LIMIT = 2000

/**
 * 力导的定位力：宽视口时纵向拉得紧、横向拉得松，收敛出来的形状接近视口的宽高比，
 * 等比缩放进视口时不再只按短边截住、留出大片空白。宽高比夹在 1/3 到 3 之间，极端视口不把图拉扁。
 */
const PULL_STRENGTH = 0.05
const PULL_EXPONENT = 0.75
const PULL_ASPECT_MAX = 3

/* ---------- 规格 ---------- */

export interface GraphNodeSpec {
  readonly id: string
  readonly name: string
  readonly group: string | null
  /** 分类色槽 1–8：按分组第一次出现的先后分；没有分组时全是 1。 */
  readonly slot: number
  /** 在节点数据里的位置。 */
  readonly index: number
  readonly value: number | null
  /** 预设坐标；没写或不是有限数时为 null。 */
  readonly x: number | null
  readonly y: number | null
  readonly datum: ChartRow
}

export interface GraphLinkSpec {
  readonly source: string
  readonly target: string
  readonly value: number | null
  /** 连线上写的字；没写或是空串时为 null。 */
  readonly label: string | null
  /** 在连线数据里的位置。 */
  readonly index: number
  readonly datum: ChartRow
}

export interface GraphSpec {
  readonly nodes: readonly GraphNodeSpec[]
  readonly byId: ReadonlyMap<string, GraphNodeSpec>
  readonly links: readonly GraphLinkSpec[]
  readonly groups: readonly { readonly id: string, readonly slot: number }[]
  /** 树与径向树：从根组成的树；其余布局为 null。 */
  readonly tree: HierarchyNode<GraphNodeSpec> | null
  readonly issues: readonly ChartSpecIssue[]
  readonly warnings: readonly ChartSpecIssue[]
}

const EMPTY_SPEC: GraphSpec = Object.freeze({ nodes: [], byId: new Map(), links: [], groups: [], tree: null, issues: [], warnings: [] })

function shapeIssue(message: string, detail: Record<string, unknown>): GraphSpec {
  return { ...EMPTY_SPEC, issues: [{ code: DIAGNOSTIC_CODES.chartGraphShape, message, detail }] }
}

function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/** 规格归一：节点重复、端点不存在、自环报错；分组按第一次出现的先后分色槽；树布局从根组树，组不成树报错。 */
export function normalizeGraphSpec(
  nodes: readonly GraphNodeDatum[] | undefined,
  links: readonly GraphLinkDatum[] | undefined,
  layout: GraphLayout,
  root: string | undefined,
): GraphSpec {
  if (!nodes || nodes.length === 0)
    return EMPTY_SPEC
  if (nodes.length > GRAPH_NODE_LIMIT)
    return { ...EMPTY_SPEC, issues: [{ code: DIAGNOSTIC_CODES.chartGraphSize, message: `关系图有 ${nodes.length} 个节点，多于 ${GRAPH_NODE_LIMIT} 个不画：先按分组聚合`, detail: { count: nodes.length } }] }
  const byId = new Map<string, GraphNodeSpec>()
  const groups: { id: string, slot: number }[] = []
  const slotOf = new Map<string, number>()
  for (const [index, n] of nodes.entries()) {
    if (byId.has(n.id))
      return shapeIssue(`节点 ${n.id} 重复`, { id: n.id, index })
    if (n.group != null && !slotOf.has(n.group)) {
      slotOf.set(n.group, groups.length + 1)
      groups.push({ id: n.group, slot: groups.length + 1 })
    }
    const x = finite(n.x)
    const y = finite(n.y)
    // 预设布局靠节点自己的坐标：缺一个就摆不上去
    if (layout === 'preset' && (x == null || y == null))
      return shapeIssue(`预设布局下节点 ${n.id} 缺有限数的 x / y`, { id: n.id, index })
    byId.set(n.id, { id: n.id, name: n.name ?? n.id, group: n.group ?? null, slot: n.group == null ? 1 : slotOf.get(n.group)!, index, value: finite(n.value), x, y, datum: n as unknown as ChartRow })
  }
  const specLinks: GraphLinkSpec[] = []
  for (const [index, l] of (links ?? []).entries()) {
    if (!byId.has(l.source) || !byId.has(l.target))
      return shapeIssue(`连线 ${l.source} → ${l.target} 指向不存在的节点`, { index, source: l.source, target: l.target })
    if (l.source === l.target)
      return shapeIssue(`连线 ${l.source} → ${l.target} 是自环`, { index, node: l.source })
    specLinks.push({ source: l.source, target: l.target, value: finite(l.value), label: l.label ? String(l.label) : null, index, datum: l as unknown as ChartRow })
  }
  const issues: ChartSpecIssue[] = []
  const warnings: ChartSpecIssue[] = []
  if (groups.length > CHART_SLOT_COUNT)
    issues.push({ code: DIAGNOSTIC_CODES.chartTooManySeries, message: `分组有 ${groups.length} 个，分类色只有 ${CHART_SLOT_COUNT} 个：把小的分组合并，或者去掉分组`, detail: { count: groups.length } })
  if (nodes.length > GRAPH_INTERACTIVE_LIMIT)
    warnings.push({ code: DIAGNOSTIC_CODES.chartGraphSize, message: `关系图有 ${nodes.length} 个节点，多于 ${GRAPH_INTERACTIVE_LIMIT} 个时交互会变慢`, detail: { count: nodes.length } })
  const specNodes = [...byId.values()]
  let treeRoot: HierarchyNode<GraphNodeSpec> | null = null
  if (layout === 'tree' || layout === 'radial-tree') {
    // 连线从父指向子：每个节点至多一个父节点，根没有父节点，全部节点都从根走得到
    const parents = new Map<string, string>()
    for (const l of specLinks) {
      if (parents.has(l.target))
        return shapeIssue(`树布局下节点 ${l.target} 有两个父节点`, { node: l.target, parents: [parents.get(l.target), l.source] })
      parents.set(l.target, l.source)
    }
    const top = root ?? specNodes.find(n => !parents.has(n.id))?.id
    if (top == null || !byId.has(top))
      return shapeIssue('树布局要一个根：没有入边的节点，或 root 指定的节点', { root })
    if (parents.has(top))
      return shapeIssue(`树布局的根 ${top} 不能有父节点`, { root: top, parent: parents.get(top) })
    const children = new Map<string, GraphNodeSpec[]>()
    for (const l of specLinks)
      children.set(l.source, [...(children.get(l.source) ?? []), byId.get(l.target)!])
    try {
      treeRoot = hierarchy(byId.get(top)!, n => children.get(n.id) ?? null)
    }
    catch (error) {
      if (isVizError(error))
        return shapeIssue('树布局的连线成环', { ...error.detail })
      throw error
    }
    const reached = treeRoot.descendants().length
    if (reached !== specNodes.length)
      return shapeIssue(`树布局下有 ${specNodes.length - reached} 个节点从根 ${top} 走不到`, { root: top, unreachable: specNodes.length - reached })
  }
  return { nodes: specNodes, byId, links: specLinks, groups, tree: treeRoot, issues, warnings }
}

/* ---------- 派生 ---------- */

export interface GraphDerived {
  readonly spec: GraphSpec
  /** 看得见的节点，按阅读序：树是深度优先的先序，其余按分组再按名字。 */
  readonly nodes: readonly GraphNodeSpec[]
  readonly visible: ReadonlySet<string>
  /** 看得见的连线：两端都看得见。 */
  readonly links: readonly GraphLinkSpec[]
  /** 每个看得见的节点的入边与出边数。 */
  readonly degree: ReadonlyMap<string, { readonly in: number, readonly out: number }>
}

export function deriveGraph(spec: GraphSpec, hiddenSeries: readonly string[]): GraphDerived {
  const hidden = new Set(hiddenSeries)
  const shown = (n: GraphNodeSpec): boolean => n.group == null || !hidden.has(n.group)
  let nodes: GraphNodeSpec[]
  if (spec.tree) {
    // 树：藏起来的节点连同它的子孙一起不画
    nodes = []
    const stack = [spec.tree]
    while (stack.length > 0) {
      const node = stack.pop()!
      if (!shown(node.data))
        continue
      nodes.push(node.data)
      const kids = node.children ?? []
      for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i]!)
    }
  }
  else {
    const order = new Map(spec.groups.map(g => [g.id, g.slot]))
    nodes = spec.nodes.filter(shown).sort((a, b) =>
      (order.get(a.group ?? '') ?? 0) - (order.get(b.group ?? '') ?? 0) || a.name.localeCompare(b.name) || a.index - b.index)
  }
  const visible = new Set(nodes.map(n => n.id))
  const links = spec.links.filter(l => visible.has(l.source) && visible.has(l.target))
  const degree = new Map(nodes.map(n => [n.id, { in: 0, out: 0 }]))
  for (const l of links) {
    degree.get(l.source)!.out += 1
    degree.get(l.target)!.in += 1
  }
  return { spec, nodes, visible, links, degree }
}

/* ---------- 格式 ---------- */

export interface GraphFormats {
  readonly value: (value: number) => string
  readonly count: (value: number) => string
}

export function graphFormats(locale: string, format: NumberFormatSpec | ((value: number) => string) | undefined): GraphFormats {
  return {
    value: typeof format === 'function' ? format : createNumberFormat(locale, format ?? {}),
    count: createNumberFormat(locale, {}),
  }
}

/* ---------- 底图：布局坐标 ---------- */

export interface GraphBase {
  readonly derived: GraphDerived
  readonly layout: GraphLayout
  readonly size: ChartSize
  /** 布局坐标里的位置（没有平移缩放时就是屏幕坐标）。 */
  readonly positions: ReadonlyMap<string, { readonly x: number, readonly y: number }>
  readonly radius: ReadonlyMap<string, number>
  /** 力导把模拟的结果缩放到视口时乘的倍数：拖动时的模拟按它换算弹簧长度。 */
  readonly fit: number
  /** 环形与径向树的圆心：名字朝外写。 */
  readonly center: { readonly x: number, readonly y: number } | null
  readonly metrics: ChartMetrics
  readonly font: FontSpec
}

/** 节点半径：有数值时按平方根比例尺在半个到两个点径之间，没有数值时一个点径。 */
function radii(derived: GraphDerived, metrics: ChartMetrics): Map<string, number> {
  const base = metrics.pointSize
  const max = derived.nodes.reduce((m, n) => Math.max(m, n.value ?? 0), 0)
  const valued = derived.nodes.some(n => n.value != null)
  return new Map(derived.nodes.map((n) => {
    if (!valued || max <= 0)
      return [n.id, base]
    const t = Math.sqrt(Math.max(0, n.value ?? 0) / max)
    return [n.id, base / 2 + (base * 2 - base / 2) * t]
  }))
}

/** 力导的参数：弹簧长度随两端半径加长，碰撞半径留一道间隙；拖动时的模拟按 fit 换算。 */
export function graphForceOptions(derived: GraphDerived, radius: ReadonlyMap<string, number>, metrics: ChartMetrics, fit: number): ForceOptions {
  const ids = derived.nodes.map(n => n.id)
  const r = (i: number): number => radius.get(ids[i]!) ?? metrics.pointSize
  return {
    linkDistance: link => (r(link.source) + r(link.target) + 30) * fit,
    charge: i => -(30 + r(i) * r(i)) * fit * fit,
    collide: i => r(i) + metrics.gap * 2,
    center: null,
  }
}

export function layoutGraphBase(derived: GraphDerived, layout: GraphLayout, size: ChartSize, metrics: ChartMetrics, measurer: TextMeasurer, _measurerVersion: number): GraphBase {
  const font = metrics.font
  const radius = radii(derived, metrics)
  const positions = new Map<string, { x: number, y: number }>()
  const base = { derived, layout, size, positions, radius, fit: 1, center: null as { x: number, y: number } | null, metrics, font }
  const n = derived.nodes.length
  if (n === 0 || size.width <= 0 || size.height <= 0)
    return base
  const { width, height } = size
  const rMax = Math.max(...radius.values())
  const gap = metrics.labelGap
  const labelWidth = (text: string): number => measurer.measure(text, font).width
  // 名字最宽取视口的一个比例：名字再长就截断，不为它压缩图
  const maxLabel = Math.min(width, height) * 0.22
  const widest = Math.min(maxLabel, derived.nodes.reduce((m, node) => Math.max(m, labelWidth(node.name)), 0))

  if (layout === 'circular') {
    const cx = width / 2
    const cy = height / 2
    const R = Math.max(0, Math.min(width, height) / 2 - widest - rMax - gap * 2)
    const points = circular(n, { center: [cx, cy], radius: R, group: i => derived.nodes[i]!.group })
    for (const p of points) positions.set(derived.nodes[p.index]!.id, { x: p.x, y: p.y })
    return { ...base, center: { x: cx, y: cy } }
  }

  if (layout === 'tree' || layout === 'radial-tree') {
    const visible = derived.visible
    const root = derived.spec.tree!
    // 藏起来的子树不参与排布：按看得见的节点重新组一棵
    const pruned = hierarchy(root, node => (node.children ?? []).filter(c => visible.has(c.data.id)))
    if (layout === 'tree') {
      const leafRoom = Math.min(width * 0.3, widest + rMax + gap)
      const rootRoom = Math.min(width * 0.2, labelWidth(root.data.name) + rMax + gap)
      tree(pruned, { size: [Math.max(0, height - rMax * 2 - gap * 2), Math.max(0, width - leafRoom - rootRoom)] })
      pruned.each(node => positions.set(node.data.data.id, { x: rootRoom + node.y, y: rMax + gap + node.x }))
      return base
    }
    const cx = width / 2
    const cy = height / 2
    const R = Math.max(0, Math.min(width, height) / 2 - widest - rMax - gap * 2)
    tree(pruned, { size: [2 * Math.PI, R], separation: (a, b) => (a.parent === b.parent ? 1 : 2) / Math.max(1, a.depth) })
    pruned.each(node => positions.set(node.data.data.id, { x: cx + node.y * Math.sin(node.x), y: cy - node.y * Math.cos(node.x) }))
    return { ...base, center: { x: cx, y: cy } }
  }

  // 预设：按节点自己的坐标等比缩放进视口，四周留的空与力导一样（名字写在节点下面，底边多留一行）
  if (layout === 'preset') {
    const padX = rMax + gap + widest / 2
    const padTop = rMax + gap
    const padBottom = rMax + gap * 2 + font.lineHeight
    const availW = Math.max(1, width - padX * 2)
    const availH = Math.max(1, height - padTop - padBottom)
    const xs = derived.nodes.map(node => node.x ?? 0)
    const ys = derived.nodes.map(node => node.y ?? 0)
    const x0 = Math.min(...xs)
    const y0 = Math.min(...ys)
    const spanX = Math.max(...xs) - x0
    const spanY = Math.max(...ys) - y0
    // 只有一个点、或全在一条线上：那一向不缩放，摆在正中
    const scale = Math.min(spanX > 0 ? availW / spanX : Number.POSITIVE_INFINITY, spanY > 0 ? availH / spanY : Number.POSITIVE_INFINITY)
    const k = Number.isFinite(scale) ? scale : 1
    const ox = padX + (availW - spanX * k) / 2
    const oy = padTop + (availH - spanY * k) / 2
    derived.nodes.forEach((node, i) => positions.set(node.id, { x: ox + (xs[i]! - x0) * k, y: oy + (ys[i]! - y0) * k }))
    return base
  }

  // 力导：同步跑到收敛，再把结果缩放、平移到视口里；名字写在节点下面，底边多留一行
  const index = new Map(derived.nodes.map((node, i) => [node.id, i]))
  const links = derived.links.map(l => ({ source: index.get(l.source)!, target: index.get(l.target)! }))
  const padX = rMax + gap + widest / 2
  const padTop = rMax + gap
  const padBottom = rMax + gap * 2 + font.lineHeight
  const availW = Math.max(1, width - padX * 2)
  const availH = Math.max(1, height - padTop - padBottom)
  const aspect = Math.min(PULL_ASPECT_MAX, Math.max(1 / PULL_ASPECT_MAX, availW / availH))
  const kx = PULL_STRENGTH * aspect ** -PULL_EXPONENT
  const ky = PULL_STRENGTH * aspect ** PULL_EXPONENT
  const sim = forceSimulation(n, links, {
    ...graphForceOptions(derived, radius, metrics, 1),
    center: [0, 0],
    x: { target: 0, strength: kx },
    y: { target: 0, strength: ky },
  })
  sim.run()
  let x0 = Number.POSITIVE_INFINITY
  let y0 = Number.POSITIVE_INFINITY
  let x1 = Number.NEGATIVE_INFINITY
  let y1 = Number.NEGATIVE_INFINITY
  sim.nodes.forEach((p) => {
    x0 = Math.min(x0, p.x)
    y0 = Math.min(y0, p.y)
    x1 = Math.max(x1, p.x)
    y1 = Math.max(y1, p.y)
  })
  // 一两个节点时模拟的范围几乎是 0：放大有上限，免得两个节点被拉到视口两端
  const fit = Math.min(availW / Math.max(x1 - x0, 1e-9), availH / Math.max(y1 - y0, 1e-9), 3)
  const ox = padX + (availW - (x1 - x0) * fit) / 2
  const oy = padTop + (availH - (y1 - y0) * fit) / 2
  sim.nodes.forEach((p, i) => positions.set(derived.nodes[i]!.id, { x: ox + (p.x - x0) * fit, y: oy + (p.y - y0) * fit }))
  return { ...base, fit }
}

/** 拖动时活着的模拟与节点的对照。 */
export interface GraphSimulationRef {
  readonly sim: ForceSimulation
  readonly ids: readonly string[]
  readonly index: ReadonlyMap<string, number>
  /** 建它时的底图：数据或尺寸换了就作废。 */
  readonly base: GraphBase
}

/**
 * 拖动开始时按当前的位置建一个模拟：弹簧与电荷按底图的缩放换算；不再向心，也不带底图的定位力——
 * 定位力会把放下的节点拽回原处，拖动就白拖了。
 */
export function createGraphSimulation(base: GraphBase, placed: ReadonlyMap<string, { readonly x: number, readonly y: number }>): GraphSimulationRef {
  const { derived } = base
  const ids = derived.nodes.map(n => n.id)
  const index = new Map(ids.map((id, i) => [id, i]))
  const links = derived.links.map(l => ({ source: index.get(l.source)!, target: index.get(l.target)! }))
  const sim = forceSimulation(ids.length, links, graphForceOptions(derived, base.radius, base.metrics, base.fit), ids.map(id => placed.get(id)!))
  return { sim, ids, index, base }
}

/* ---------- 摆放与场景 ---------- */

export interface GraphLabelLayout {
  readonly text: string
  readonly x: number
  readonly y: number
  readonly anchor: 'start' | 'middle' | 'end'
  readonly baseline: 'top' | 'middle' | 'bottom'
}

export interface GraphNodeGeometry {
  readonly node: GraphNodeSpec
  /** 屏幕坐标。 */
  readonly x: number
  readonly y: number
  readonly r: number
  readonly label: GraphLabelLayout | null
}

export interface GraphLinkGeometry {
  readonly link: GraphLinkSpec
  readonly from: { readonly x: number, readonly y: number }
  readonly to: { readonly x: number, readonly y: number }
  /** 有权重时的线宽；没有权重时为 null，由皮肤决定。 */
  readonly width: number | null
  /** 有向时目标一端的箭头。 */
  readonly arrow: PathSegment | null
  /** 连线上的字：写在两端节点圆心连线的中点；和节点、节点名字压在一起或越出绘图区时不写。 */
  readonly label: { readonly text: string, readonly x: number, readonly y: number } | null
}

export interface GraphLayoutResult {
  readonly base: GraphBase
  readonly size: ChartSize
  readonly view: GraphView
  /** 摆放后的布局坐标（拖动过的节点在它被放下的地方）。 */
  readonly placed: ReadonlyMap<string, { readonly x: number, readonly y: number }>
  readonly nodes: readonly GraphNodeGeometry[]
  readonly byId: ReadonlyMap<string, GraphNodeGeometry>
  readonly links: readonly GraphLinkGeometry[]
  readonly metrics: ChartMetrics
  readonly font: FontSpec
}

/** 箭头：尖端落在目标节点的边上，沿连线方向。 */
/** 箭头三角形的三个顶点：尖端在 to，底边垂直于连线。过渡按这三个点插值，与连线同步移动。 */
function arrowPoints(from: { x: number, y: number }, to: { x: number, y: number }, length: number): PathSegment {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const d = Math.hypot(dx, dy) || 1
  const ux = dx / d
  const uy = dy / d
  const half = length * 0.4
  const bx = to.x - ux * length
  const by = to.y - uy * length
  return { points: [{ x: to.x, y: to.y }, { x: bx - uy * half, y: by + ux * half }, { x: bx + uy * half, y: by - ux * half }], closed: true }
}

export function layoutGraph(base: GraphBase, positions: Readonly<Record<string, { readonly x: number, readonly y: number }>> | null, view: GraphView, directed: boolean, measurer: TextMeasurer): GraphLayoutResult {
  const { derived, metrics, font, size } = base
  // 拖动过的位置盖在底图上；数据换过、对不上的就不用
  const placed = new Map(base.positions)
  if (positions) {
    for (const [id, p] of Object.entries(positions)) {
      if (placed.has(id))
        placed.set(id, p)
    }
  }
  const toScreen = (p: { x: number, y: number }): { x: number, y: number } => ({ x: p.x * view.k + view.x, y: p.y * view.k + view.y })
  const gap = metrics.labelGap
  const maxLabel = Math.min(size.width, size.height) * 0.22
  const lineHeight = font.lineHeight
  const center = base.center ? toScreen(base.center) : null
  const nodes: GraphNodeGeometry[] = derived.nodes.map((node) => {
    const at = toScreen(placed.get(node.id) ?? { x: 0, y: 0 })
    const r = base.radius.get(node.id) ?? metrics.pointSize
    const text = ellipsize(node.name, maxLabel, font, measurer)
    let label: GraphLabelLayout | null = null
    if (text) {
      if (base.layout === 'force' || base.layout === 'preset') {
        label = { text, x: at.x, y: at.y + r + gap, anchor: 'middle', baseline: 'top' }
      }
      else if (base.layout === 'tree') {
        const leaf = (derived.degree.get(node.id)?.out ?? 0) === 0
        label = leaf
          ? { text, x: at.x + r + gap, y: at.y, anchor: 'start', baseline: 'middle' }
          : { text, x: at.x - r - gap, y: at.y, anchor: 'end', baseline: 'middle' }
      }
      else {
        // 环形与径向树：沿半径朝外写，右半边往外、左半边往回，正上正下居中
        const cx = center?.x ?? at.x
        const cy = center?.y ?? at.y
        const dx = at.x - cx
        const dy = at.y - cy
        const d = Math.hypot(dx, dy)
        const ux = d > 0 ? dx / d : 0
        const uy = d > 0 ? dy / d : -1
        const off = r + gap
        const anchor = ux > 0.3 ? 'start' : ux < -0.3 ? 'end' : 'middle'
        const baseline = anchor !== 'middle' ? 'middle' : uy < 0 ? 'bottom' : 'top'
        label = { text, x: at.x + ux * off, y: at.y + uy * off, anchor, baseline }
      }
    }
    return { node, x: at.x, y: at.y, r, label }
  })

  // 名字互相压住时按连线多少让位：连得多的节点先放；越出绘图区的不放
  const degree = derived.degree
  const priority = [...nodes].sort((a, b) => {
    const da = (degree.get(a.node.id)?.in ?? 0) + (degree.get(a.node.id)?.out ?? 0)
    const db = (degree.get(b.node.id)?.in ?? 0) + (degree.get(b.node.id)?.out ?? 0)
    return db - da || (b.node.value ?? 0) - (a.node.value ?? 0)
  })
  const boxes: { x0: number, y0: number, x1: number, y1: number }[] = []
  const kept = new Set<GraphNodeGeometry>()
  for (const g of priority) {
    if (!g.label)
      continue
    const w = measurer.measure(g.label.text, font).width
    const x0 = g.label.anchor === 'start' ? g.label.x : g.label.anchor === 'end' ? g.label.x - w : g.label.x - w / 2
    const y0 = g.label.baseline === 'top' ? g.label.y : g.label.baseline === 'bottom' ? g.label.y - lineHeight : g.label.y - lineHeight / 2
    const box = { x0, y0, x1: x0 + w, y1: y0 + lineHeight }
    if (box.x0 < 0 || box.y0 < 0 || box.x1 > size.width || box.y1 > size.height)
      continue
    if (boxes.some(b => box.x0 < b.x1 && b.x0 < box.x1 && box.y0 < b.y1 && b.y0 < box.y1))
      continue
    boxes.push(box)
    kept.add(g)
  }
  const final = nodes.map(g => (kept.has(g) ? g : { ...g, label: null }))
  const byId = new Map(final.map(g => [g.node.id, g]))

  /** 连线上的字：放在两端圆心连线的中点，与已放下的名字、或越出绘图区时不写，节点名字优先。 */
  const linkLabelOf = (link: GraphLinkSpec, s: GraphNodeGeometry, t: GraphNodeGeometry): GraphLinkGeometry['label'] => {
    if (!link.label)
      return null
    const text = ellipsize(link.label, maxLabel, font, measurer)
    if (!text)
      return null
    const x = (s.x + t.x) / 2
    const y = (s.y + t.y) / 2
    const w = measurer.measure(text, font).width
    const box = { x0: x - w / 2, y0: y - lineHeight / 2, x1: x + w / 2, y1: y + lineHeight / 2 }
    if (box.x0 < 0 || box.y0 < 0 || box.x1 > size.width || box.y1 > size.height)
      return null
    if (boxes.some(b => box.x0 < b.x1 && b.x0 < box.x1 && box.y0 < b.y1 && b.y0 < box.y1))
      return null
    // 也不压在节点上：两端靠得太近、或中点正好落在别的节点上时不写
    const hitsNode = final.some((g) => {
      const dx = g.x - Math.max(box.x0, Math.min(g.x, box.x1))
      const dy = g.y - Math.max(box.y0, Math.min(g.y, box.y1))
      return dx * dx + dy * dy < g.r * g.r
    })
    if (hitsNode)
      return null
    boxes.push(box)
    return { text, x, y }
  }

  const valued = derived.links.some(l => l.value != null)
  const maxValue = derived.links.reduce((m, l) => Math.max(m, l.value ?? 0), 0)
  const thin = metrics.lineWidth / 2
  const arrowLength = metrics.pointSize + metrics.lineWidth
  const links: GraphLinkGeometry[] = derived.links.map((link) => {
    const s = byId.get(link.source)!
    const t = byId.get(link.target)!
    const width = valued && maxValue > 0 ? thin + (metrics.lineWidth * 2 - thin) * Math.sqrt(Math.max(0, link.value ?? 0) / maxValue) : null
    if (!directed)
      return { link, from: { x: s.x, y: s.y }, to: { x: t.x, y: t.y }, width, arrow: null, label: linkLabelOf(link, s, t) }
    // 有向：线停在箭头的底边，箭头的尖端停在目标节点的边上，隔一道间隙
    const dx = t.x - s.x
    const dy = t.y - s.y
    const d = Math.hypot(dx, dy) || 1
    const tip = { x: t.x - (dx / d) * (t.r + metrics.gap), y: t.y - (dy / d) * (t.r + metrics.gap) }
    const end = { x: tip.x - (dx / d) * arrowLength * 0.8, y: tip.y - (dy / d) * arrowLength * 0.8 }
    return { link, from: { x: s.x, y: s.y }, to: end, width, arrow: arrowPoints({ x: s.x, y: s.y }, tip, arrowLength), label: linkLabelOf(link, s, t) }
  })
  return { base, size, view, placed, nodes: final, byId, links, metrics, font }
}

export interface GraphScene {
  readonly layout: GraphLayoutResult
  readonly scene: Scene
}

export function graphNodeKey(id: string): string {
  return `node:${id}`
}

export function graphScene(layout: GraphLayoutResult, version: number): GraphScene {
  const horizontalTree = layout.base.layout === 'tree'
  const data: Mark[] = []
  const front: Mark[] = []
  // 连线垫在最下面，箭头其上，节点压在连线的两端上
  for (const g of layout.links) {
    const line: LineMark = {
      kind: 'line',
      key: `link:${g.link.index}`,
      part: 'link',
      datum: { seriesId: 'link', index: g.link.index },
      points: [{ key: 'from', ...g.from }, { key: 'to', ...g.to }],
      curve: horizontalTree ? 'bumpX' : 'linear',
    }
    data.push(line)
  }
  for (const g of layout.links) {
    if (!g.arrow)
      continue
    const arrow: PathMark = { kind: 'path', key: `arrow:${g.link.index}`, part: 'arrow', datum: { seriesId: 'link', index: g.link.index }, d: segmentsPath([g.arrow]), segments: [g.arrow] }
    data.push(arrow)
  }
  for (const g of layout.nodes) {
    data.push({
      kind: 'arc',
      key: graphNodeKey(g.node.id),
      part: 'node',
      datum: { seriesId: 'node', index: g.node.index },
      paint: { slot: g.node.slot },
      a11y: { label: '', focusable: true },
      cx: g.x,
      cy: g.y,
      innerRadius: 0,
      outerRadius: g.r,
      startAngle: 0,
      endAngle: 2 * Math.PI,
    })
    if (g.label) {
      const text: TextMark = { kind: 'text', key: `label:${g.node.id}`, part: 'node-label', x: g.label.x, y: g.label.y, text: g.label.text, anchor: g.label.anchor, baseline: g.label.baseline }
      front.push(text)
    }
  }
  // 连线上的字压在节点之上：它写在连线中点，节点不会盖到它
  for (const g of layout.links) {
    if (g.label)
      front.push({ kind: 'text', key: `link-label:${g.link.index}`, part: 'link-label', x: g.label.x, y: g.label.y, text: g.label.text, anchor: 'middle', baseline: 'middle' })
  }
  const scene = createScene({ version, layers: { data, front }, bounds: { x: 0, y: 0, width: layout.size.width, height: layout.size.height } })
  return { layout, scene }
}

/** 首次出现从哪一帧起跑：节点从圆心长出，连线与箭头淡入。 */
export function graphEntryScene(target: Scene): Scene {
  const data = target.layers.data.map((mark): Mark => (mark.kind === 'arc' ? { ...mark, outerRadius: 0 } : { ...mark, opacity: 0 }))
  return createScene({ version: 0, layers: { data }, bounds: target.bounds })
}

/* ---------- 无障碍 ---------- */

export function graphA11y(
  derived: GraphDerived,
  formats: GraphFormats,
  translations: GraphChartTranslations,
): { summary: string, table: TableModel } {
  const { spec, nodes, links, degree } = derived
  const nameOf = (id: string): string => spec.byId.get(id)?.name ?? id
  let hub: GraphSummary['hub'] = null
  for (const n of nodes) {
    const d = (degree.get(n.id)?.in ?? 0) + (degree.get(n.id)?.out ?? 0)
    if (d > 0 && (!hub || d > hub.degree))
      hub = { name: n.name, degree: d }
  }
  const valued = links.some(l => l.value != null)
  const labelled = links.some(l => l.label != null)
  const table: TableModel = {
    columns: [
      { id: 'source', label: translations.sourceLabel },
      { id: 'target', label: translations.targetLabel },
      ...(labelled ? [{ id: 'label', label: translations.linkLabel }] : []),
      ...(valued ? [{ id: 'value', label: translations.valueLabel }] : []),
    ],
    rows: links.map(l => ({
      key: `${l.source}→${l.target}#${l.index}`,
      cells: [
        { value: nameOf(l.source), text: nameOf(l.source) },
        { value: nameOf(l.target), text: nameOf(l.target) },
        ...(labelled ? [{ value: l.label, text: l.label ?? translations.missingValue }] : []),
        ...(valued ? [{ value: l.value, text: l.value == null ? translations.missingValue : formats.value(l.value) }] : []),
      ],
    })),
  }
  return { summary: translations.summary({ nodeCount: nodes.length, linkCount: links.length, hub }), table }
}

/* ---------- 管线 ---------- */

export interface GraphPipelineInput {
  readonly nodes: readonly GraphNodeDatum[] | undefined
  readonly links: readonly GraphLinkDatum[] | undefined
  readonly layout: GraphLayout | undefined
  readonly root: string | undefined
  readonly directed: boolean | undefined
  readonly hiddenSeries: readonly string[]
  readonly format: NumberFormatSpec | ((value: number) => string) | undefined
  readonly positions: Readonly<Record<string, { readonly x: number, readonly y: number }>> | null
  readonly view: GraphView
  readonly size: ChartSize | null
  readonly metrics: ChartMetrics
  readonly measurer: TextMeasurer
  readonly measurerVersion: number
  readonly locale: string
  readonly translations: GraphChartTranslations
}

export interface GraphModel {
  readonly spec: GraphSpec
  readonly derived: GraphDerived
  readonly formats: GraphFormats
  readonly layout: GraphLayout
  readonly directed: boolean
  readonly issues: readonly ChartSpecIssue[]
  readonly warnings: readonly ChartSpecIssue[]
  /** 尚未测量或规格不合法时为 null。 */
  readonly base: GraphBase | null
  readonly scene: GraphScene | null
  readonly summary: string
  readonly table: TableModel
}

export type GraphPipeline = (input: GraphPipelineInput) => GraphModel

/** 建一条管线：每个图表实例一条，放在机器的 refs 里。 */
export function createGraphPipeline(): GraphPipeline {
  const normalize = memoizeLast(normalizeGraphSpec)
  const derive = memoizeLast(deriveGraph)
  const formatsOf = memoizeLast(graphFormats)
  const baseOf = memoizeLast(layoutGraphBase)
  const layoutOf = memoizeLast(layoutGraph)
  let version = 0
  const sceneOf = memoizeLast((layout: GraphLayoutResult) => graphScene(layout, ++version))
  const a11yOf = memoizeLast(graphA11y)
  return (input) => {
    const layout = input.layout ?? 'force'
    const directed = input.directed === true
    const spec = normalize(input.nodes, input.links, layout, input.root)
    const derived = derive(spec, input.hiddenSeries)
    const formats = formatsOf(input.locale, input.format)
    const a11y = a11yOf(derived, formats, input.translations)
    const base = input.size == null || spec.issues.length > 0
      ? null
      : baseOf(derived, layout, input.size, input.metrics, input.measurer, input.measurerVersion)
    const scene = base ? sceneOf(layoutOf(base, input.positions, input.view, directed, input.measurer)) : null
    return { spec, derived, formats, layout, directed, issues: spec.issues, warnings: spec.warnings, base, scene, summary: a11y.summary, table: a11y.table }
  }
}
