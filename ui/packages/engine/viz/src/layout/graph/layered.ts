/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 分层有向图布局：深度优先断环、最长路径分层并拉紧源点、跨层连线插入途经点、
// 中位数上下扫描减少交叉（保留交叉最少的一轮）、四种对齐方向的块压缩取中位平衡给出交叉轴坐标。

import type { Point } from '../../geometry'
import type { GraphLink } from './algorithms'
import { invalidArgument } from '../../errors'
import { findBackLinks, topologicalOrder } from './algorithms'

/** 布局方向：TB 自上而下、BT 自下而上、LR 自左而右、RL 自右而左。 */
export type LayeredDirection = 'TB' | 'BT' | 'LR' | 'RL'

export interface LayeredSize {
  readonly width: number
  readonly height: number
}

export interface LayeredLink {
  /** 两端节点的下标。 */
  readonly source: number
  readonly target: number
}

export interface LayeredOptions {
  /** 缺省 TB。 */
  readonly direction?: LayeredDirection
  /** 同层相邻两节点之间的空隙，缺省 24。 */
  readonly nodeGap?: number
  /** 同层里与连线途经点相邻时的空隙，缺省 nodeGap 的一半。 */
  readonly linkGap?: number
  /** 相邻两层之间的空隙，缺省 48。 */
  readonly layerGap?: number
  /** 减少交叉的扫描轮数（上下交替），缺省 12。 */
  readonly sweeps?: number
}

export interface LayeredNode {
  readonly index: number
  /** 节点中心。 */
  readonly x: number
  readonly y: number
  /** 所在层，从 0 起。 */
  readonly layer: number
  /** 在层内的次序，从 0 起。 */
  readonly order: number
}

export interface LayeredRoute {
  /** 连线的下标。 */
  readonly index: number
  readonly source: number
  readonly target: number
  /** 断环时被反向处理过。 */
  readonly reversed: boolean
  /** 跨层连线依次经过的点，自 source 一侧排到 target 一侧；相邻层的连线与自环为空。 */
  readonly bends: readonly Point[]
}

export interface LayeredLayout {
  /** 按节点下标排列。 */
  readonly nodes: readonly LayeredNode[]
  /** 按连线下标排列。 */
  readonly links: readonly LayeredRoute[]
  /** 包住全部节点与途经点的宽高，左上角在 (0, 0)。 */
  readonly width: number
  readonly height: number
  readonly layerCount: number
  /** 最终次序下相邻层之间的连线交叉数。 */
  readonly crossings: number
}

const DIRECTIONS: readonly string[] = ['TB', 'BT', 'LR', 'RL']

/** 排出分层有向图：sizes 是各节点的宽高，links 用节点下标表达连线。 */
export function layered(sizes: readonly LayeredSize[], links: readonly LayeredLink[], options: LayeredOptions = {}): LayeredLayout {
  const direction = options.direction ?? 'TB'
  if (!DIRECTIONS.includes(direction))
    throw invalidArgument('分层布局的方向必须是 TB、BT、LR 或 RL', { direction })
  const nodeGap = gapOption('nodeGap', options.nodeGap, 24)
  const linkGap = gapOption('linkGap', options.linkGap, nodeGap / 2)
  const layerGap = gapOption('layerGap', options.layerGap, 48)
  const sweeps = options.sweeps ?? 12
  if (!Number.isInteger(sweeps) || sweeps < 0)
    throw invalidArgument('扫描轮数必须是非负整数', { sweeps })
  const n = sizes.length
  sizes.forEach((size, index) => {
    if (!(Number.isFinite(size.width) && size.width >= 0 && Number.isFinite(size.height) && size.height >= 0))
      throw invalidArgument('节点的宽高必须是非负有限数', { index, size })
  })
  links.forEach((link, index) => {
    if (!isIndex(link.source, n) || !isIndex(link.target, n))
      throw invalidArgument('连线两端必须是节点下标', { index, link })
  })

  const vertical = direction === 'TB' || direction === 'BT'
  const graph = buildGraph(sizes, links, vertical)
  const layers = initialOrder(graph)
  const crossings = minimizeCrossings(graph, layers, sweeps)
  const cross = assignCross(graph, layers, nodeGap, linkGap)
  const main = assignMain(graph, layers, layerGap)
  return project(graph, layers, cross, main, links, direction, crossings)
}

function gapOption(name: string, value: number | undefined, fallback: number): number {
  const resolved = value ?? fallback
  if (!(Number.isFinite(resolved) && resolved >= 0))
    throw invalidArgument('间距必须是非负有限数', { [name]: value })
  return resolved
}

function isIndex(value: number, count: number): boolean {
  return Number.isInteger(value) && value >= 0 && value < count
}

/** 分好层、插好途经点的图：下标 0..n-1 是真实节点，其后是途经点。 */
interface Graph {
  readonly n: number
  readonly layerOf: number[]
  readonly crossSize: number[]
  readonly mainSize: number[]
  readonly upper: number[][]
  readonly lower: number[][]
  readonly layerCount: number
  /** 每条连线的途经点，按处理方向（断环后）排列；自环为 null。 */
  readonly chains: (number[] | null)[]
  readonly reversed: boolean[]
}

function buildGraph(sizes: readonly LayeredSize[], links: readonly LayeredLink[], vertical: boolean): Graph {
  const n = sizes.length
  const reversed = findBackLinks(n, links)
  const from = links.map((link, i) => (reversed[i] ? link.target : link.source))
  const to = links.map((link, i) => (reversed[i] ? link.source : link.target))
  const usable = links.map(link => link.source !== link.target)
  const layer = assignLayers(n, from, to, usable)

  const layerOf = layer.slice()
  const crossSize = sizes.map(size => (vertical ? size.width : size.height))
  const mainSize = sizes.map(size => (vertical ? size.height : size.width))
  const upper: number[][] = sizes.map(() => [])
  const lower: number[][] = sizes.map(() => [])
  const connect = (a: number, b: number): void => {
    lower[a]!.push(b)
    upper[b]!.push(a)
  }
  const chains: (number[] | null)[] = links.map((_, i) => {
    if (!usable[i])
      return null
    const a = from[i]!
    const b = to[i]!
    const chain: number[] = []
    let previous = a
    for (let l = layer[a]! + 1; l < layer[b]!; l++) {
      const dummy = layerOf.length
      layerOf.push(l)
      crossSize.push(0)
      mainSize.push(0)
      upper.push([])
      lower.push([])
      connect(previous, dummy)
      chain.push(dummy)
      previous = dummy
    }
    connect(previous, b)
    return chain
  })
  const layerCount = n === 0 ? 0 : Math.max(...layer) + 1
  return { n, layerOf, crossSize, mainSize, upper, lower, layerCount, chains, reversed }
}

/** 最长路径分层，再把有出线的源点拉到其后继最上一层的上一层。 */
function assignLayers(n: number, from: number[], to: number[], usable: boolean[]): number[] {
  const successors: number[][] = Array.from({ length: n }, () => [])
  const indegree = Array.from<number>({ length: n }).fill(0)
  const forward: GraphLink[] = []
  from.forEach((source, i) => {
    if (usable[i]) {
      successors[source]!.push(to[i]!)
      indegree[to[i]!]!++
      forward.push({ source, target: to[i]! })
    }
  })
  const layer = Array.from<number>({ length: n }).fill(0)
  for (const v of topologicalOrder(n, forward)!) {
    for (const w of successors[v]!)
      layer[w] = Math.max(layer[w]!, layer[v]! + 1)
  }
  for (let v = 0; v < n; v++) {
    if (indegree[v] === 0 && successors[v]!.length > 0)
      layer[v] = Math.min(...successors[v]!.map(w => layer[w]!)) - 1
  }
  const min = n === 0 ? 0 : Math.min(...layer)
  return layer.map(l => l - min)
}

/** 从第 0 层的节点起深度优先，按访问先后排进各层。 */
function initialOrder(graph: Graph): number[][] {
  const layers: number[][] = Array.from({ length: graph.layerCount }, () => [])
  const count = graph.layerOf.length
  const visited = Array.from<boolean>({ length: count }).fill(false)
  const roots = Array.from({ length: count }, (_, v) => v)
    .sort((a, b) => graph.layerOf[a]! - graph.layerOf[b]! || a - b)
  for (const root of roots) {
    if (visited[root])
      continue
    const stack = [root]
    while (stack.length > 0) {
      const v = stack.pop()!
      if (visited[v])
        continue
      visited[v] = true
      layers[graph.layerOf[v]!]!.push(v)
      const next = graph.lower[v]!
      for (let i = next.length - 1; i >= 0; i--) {
        if (!visited[next[i]!])
          stack.push(next[i]!)
      }
    }
  }
  return layers
}

/** 上下交替按邻层中位数重排各层，保留交叉最少的次序；原地改写 layers，返回交叉数。 */
function minimizeCrossings(graph: Graph, layers: number[][], sweeps: number): number {
  const position = Array.from<number>({ length: graph.layerOf.length }).fill(0)
  const refresh = (layer: readonly number[]): void => {
    layer.forEach((v, i) => {
      position[v] = i
    })
  }
  layers.forEach(refresh)
  let best = layers.map(layer => layer.slice())
  let bestCrossings = countAll(graph, layers, position)
  for (let sweep = 0; sweep < sweeps && bestCrossings > 0; sweep++) {
    const down = sweep % 2 === 0
    if (down) {
      for (let l = 1; l < layers.length; l++) {
        reorder(layers[l]!, graph.upper, position)
        refresh(layers[l]!)
      }
    }
    else {
      for (let l = layers.length - 2; l >= 0; l--) {
        reorder(layers[l]!, graph.lower, position)
        refresh(layers[l]!)
      }
    }
    const crossings = countAll(graph, layers, position)
    if (crossings < bestCrossings) {
      bestCrossings = crossings
      best = layers.map(layer => layer.slice())
    }
  }
  best.forEach((layer, l) => {
    layers[l] = layer
  })
  return bestCrossings
}

/** 按邻层邻居位置的中位数排序；没有邻居的节点留在原位。 */
function reorder(layer: number[], neighbors: readonly number[][], position: readonly number[]): void {
  const keyed: { v: number, key: number, at: number }[] = []
  const fixed = layer.map(() => false)
  layer.forEach((v, at) => {
    const around = neighbors[v]!.map(u => position[u]!).sort((a, b) => a - b)
    if (around.length === 0) {
      fixed[at] = true
      return
    }
    const mid = around.length >> 1
    const key = around.length % 2 === 1 ? around[mid]! : (around[mid - 1]! + around[mid]!) / 2
    keyed.push({ v, key, at })
  })
  keyed.sort((a, b) => a.key - b.key || a.at - b.at)
  let next = 0
  layer.forEach((_, at) => {
    if (!fixed[at])
      layer[at] = keyed[next++]!.v
  })
}

function countAll(graph: Graph, layers: readonly number[][], position: readonly number[]): number {
  let total = 0
  for (let l = 0; l + 1 < layers.length; l++)
    total += countBetween(graph, layers[l]!, layers[l + 1]!.length, position)
  return total
}

/** 两层之间的交叉数：连线按上端、下端排序后数下端的逆序对。 */
function countBetween(graph: Graph, upperLayer: readonly number[], lowerCount: number, position: readonly number[]): number {
  const ends: [number, number][] = []
  for (const u of upperLayer) {
    for (const w of graph.lower[u]!)
      ends.push([position[u]!, position[w]!])
  }
  ends.sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const tree = Array.from<number>({ length: lowerCount + 1 }).fill(0)
  let crossings = 0
  let inserted = 0
  for (const [, lowerAt] of ends) {
    let atMost = 0
    for (let i = lowerAt + 1; i > 0; i -= i & -i)
      atMost += tree[i]!
    crossings += inserted - atMost
    for (let i = lowerAt + 1; i <= lowerCount; i += i & -i)
      tree[i]!++
    inserted++
  }
  return crossings
}

/** 交叉轴坐标：四种对齐各做一次块压缩，对齐到最窄的一种后取每个点四个值的中间两值平均。 */
function assignCross(graph: Graph, layers: readonly number[][], nodeGap: number, linkGap: number): number[] {
  const count = graph.layerOf.length
  const dummy = (v: number): boolean => v >= graph.n
  const separation = (a: number, b: number): number =>
    (graph.crossSize[a]! + graph.crossSize[b]!) / 2 + (dummy(a) || dummy(b) ? linkGap : nodeGap)
  const position = Array.from<number>({ length: count }).fill(0)
  layers.forEach(layer => layer.forEach((v, i) => {
    position[v] = i
  }))
  const conflicts = markInnerConflicts(graph, layers, position, dummy)

  const results: number[][] = []
  for (const downward of [true, false]) {
    for (const leftward of [true, false]) {
      const ordered = (downward ? layers : layers.slice().reverse()).map(layer => (leftward ? layer : layer.slice().reverse()))
      const at = Array.from<number>({ length: count }).fill(0)
      ordered.forEach(layer => layer.forEach((v, i) => {
        at[v] = i
      }))
      const root = alignVertical(ordered, downward ? graph.upper : graph.lower, at, conflicts, count)
      const xs = compact(ordered, root, separation, count)
      results.push(leftward ? xs : xs.map(x => -x))
    }
  }

  const extents = results.map((xs) => {
    let min = Infinity
    let max = -Infinity
    xs.forEach((x, v) => {
      min = Math.min(min, x - graph.crossSize[v]! / 2)
      max = Math.max(max, x + graph.crossSize[v]! / 2)
    })
    return { min, max, width: max - min }
  })
  let reference = 0
  extents.forEach((extent, i) => {
    if (extent.width < extents[reference]!.width)
      reference = i
  })
  const aligned = results.map((xs, i) => {
    const leftward = i % 2 === 0
    const delta = leftward ? extents[reference]!.min - extents[i]!.min : extents[reference]!.max - extents[i]!.max
    return xs.map(x => x + delta)
  })
  return Array.from({ length: count }, (_, v) => {
    const values = aligned.map(xs => xs[v]!).sort((a, b) => a - b)
    return (values[1]! + values[2]!) / 2
  })
}

/** 标记与途经点之间的内段交叉的连线，它们不参与对齐。 */
function markInnerConflicts(graph: Graph, layers: readonly number[][], position: readonly number[], dummy: (v: number) => boolean): Set<number> {
  const count = graph.layerOf.length
  const conflicts = new Set<number>()
  for (let l = 1; l < layers.length; l++) {
    const lowerLayer = layers[l]!
    const upperLast = layers[l - 1]!.length - 1
    let k0 = 0
    let scan = 0
    lowerLayer.forEach((v, i) => {
      const inner = dummy(v) ? graph.upper[v]!.find(dummy) : undefined
      if (inner === undefined && i !== lowerLayer.length - 1)
        return
      const k1 = inner === undefined ? upperLast : position[inner]!
      for (let j = scan; j <= i; j++) {
        const w = lowerLayer[j]!
        for (const u of graph.upper[w]!) {
          if ((position[u]! < k0 || position[u]! > k1) && !(dummy(u) && dummy(w)))
            conflicts.add(pairKey(u, w, count))
        }
      }
      scan = i + 1
      k0 = k1
    })
  }
  return conflicts
}

function pairKey(a: number, b: number, count: number): number {
  return Math.min(a, b) * count + Math.max(a, b)
}

/** 每个点与邻层中位邻居之一对齐成块，返回各点所在块的根。 */
function alignVertical(
  ordered: readonly number[][],
  neighbors: readonly number[][],
  at: readonly number[],
  conflicts: Set<number>,
  count: number,
): number[] {
  const root = Array.from({ length: count }, (_, v) => v)
  const align = Array.from({ length: count }, (_, v) => v)
  for (let l = 1; l < ordered.length; l++) {
    let reach = -1
    for (const v of ordered[l]!) {
      const around = neighbors[v]!.slice().sort((a, b) => at[a]! - at[b]!)
      if (around.length === 0)
        continue
      const lo = (around.length - 1) >> 1
      const hi = around.length >> 1
      for (const m of lo === hi ? [lo] : [lo, hi]) {
        if (align[v] !== v)
          break
        const u = around[m]!
        if (!conflicts.has(pairKey(u, v, count)) && reach < at[u]!) {
          align[u] = v
          root[v] = root[u]!
          align[v] = root[v]!
          reach = at[u]!
        }
      }
    }
  }
  return root
}

/** 块压缩：先按块间最小间距从左排到最小坐标，再把每块向右推到不越过右邻为止。 */
function compact(
  ordered: readonly number[][],
  root: readonly number[],
  separation: (a: number, b: number) => number,
  count: number,
): number[] {
  const edges = new Map<number, Map<number, number>>()
  const predecessors: number[][] = Array.from({ length: count }, () => [])
  const successors: number[][] = Array.from({ length: count }, () => [])
  for (const layer of ordered) {
    for (let i = 1; i < layer.length; i++) {
      const a = root[layer[i - 1]!]!
      const b = root[layer[i]!]!
      const weight = separation(layer[i - 1]!, layer[i]!)
      const out = edges.get(a) ?? new Map<number, number>()
      if (!out.has(b)) {
        predecessors[b]!.push(a)
        successors[a]!.push(b)
      }
      out.set(b, Math.max(out.get(b) ?? 0, weight))
      edges.set(a, out)
    }
  }
  const blocks = Array.from({ length: count }, (_, v) => v).filter(v => root[v] === v)
  const indegree = Array.from<number>({ length: count }).fill(0)
  for (const b of blocks)
    indegree[b] = predecessors[b]!.length
  const order = blocks.filter(b => indegree[b] === 0)
  for (let head = 0; head < order.length; head++) {
    for (const c of successors[order[head]!]!) {
      if (--indegree[c]! === 0)
        order.push(c)
    }
  }
  const xs = Array.from<number>({ length: count }).fill(0)
  for (const b of order) {
    let x = 0
    for (const a of predecessors[b]!)
      x = Math.max(x, xs[a]! + edges.get(a)!.get(b)!)
    xs[b] = x
  }
  for (let i = order.length - 1; i >= 0; i--) {
    const b = order[i]!
    if (successors[b]!.length === 0)
      continue
    let limit = Infinity
    for (const c of successors[b]!)
      limit = Math.min(limit, xs[c]! - edges.get(b)!.get(c)!)
    xs[b] = Math.max(xs[b]!, limit)
  }
  return Array.from({ length: count }, (_, v) => xs[root[v]!]!)
}

/** 主轴坐标：每层厚度取层内节点主轴尺寸的最大值，层与层之间隔 layerGap。 */
function assignMain(graph: Graph, layers: readonly number[][], layerGap: number): number[] {
  const thickness = layers.map(layer => Math.max(0, ...layer.map(v => graph.mainSize[v]!)))
  const centers: number[] = []
  let cursor = 0
  thickness.forEach((t, l) => {
    centers.push(cursor + t / 2)
    cursor += t + (l + 1 < thickness.length ? layerGap : 0)
  })
  return graph.layerOf.map(l => centers[l]!)
}

function project(
  graph: Graph,
  layers: readonly number[][],
  cross: readonly number[],
  main: readonly number[],
  links: readonly LayeredLink[],
  direction: LayeredDirection,
  crossings: number,
): LayeredLayout {
  const count = graph.layerOf.length
  const flip = direction === 'BT' || direction === 'RL' ? -1 : 1
  const vertical = direction === 'TB' || direction === 'BT'
  let minCross = Infinity
  let maxCross = -Infinity
  let minMain = Infinity
  let maxMain = -Infinity
  for (let v = 0; v < count; v++) {
    const c = cross[v]!
    const m = main[v]! * flip
    minCross = Math.min(minCross, c - graph.crossSize[v]! / 2)
    maxCross = Math.max(maxCross, c + graph.crossSize[v]! / 2)
    minMain = Math.min(minMain, m - graph.mainSize[v]! / 2)
    maxMain = Math.max(maxMain, m + graph.mainSize[v]! / 2)
  }
  if (count === 0) {
    minCross = maxCross = minMain = maxMain = 0
  }
  const place = (v: number): Point => {
    const c = cross[v]! - minCross
    const m = main[v]! * flip - minMain
    return vertical ? [c, m] : [m, c]
  }
  const order = Array.from<number>({ length: count }).fill(0)
  layers.forEach(layer => layer.forEach((v, i) => {
    order[v] = i
  }))
  const nodes: LayeredNode[] = Array.from({ length: graph.n }, (_, v) => {
    const [x, y] = place(v)
    return { index: v, x, y, layer: graph.layerOf[v]!, order: order[v]! }
  })
  const routes: LayeredRoute[] = links.map((link, i) => {
    const chain = graph.chains[i]
    const points = (chain ?? []).map(place)
    return {
      index: i,
      source: link.source,
      target: link.target,
      reversed: graph.reversed[i]!,
      bends: graph.reversed[i] ? points.reverse() : points,
    }
  })
  const crossExtent = maxCross - minCross
  const mainExtent = maxMain - minMain
  return {
    nodes,
    links: routes,
    width: vertical ? crossExtent : mainExtent,
    height: vertical ? mainExtent : crossExtent,
    layerCount: graph.layerCount,
    crossings,
  }
}
