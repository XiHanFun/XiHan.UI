/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 桑基布局：节点分列排开，流带的宽度与流量成正比，从源节点的右边流进目标节点的左边。
// 步骤：连起节点与流带 → 节点值取流入与流出里较大的 → 按拓扑序求深度，成环报 XH_VIZ_SANKEY_CYCLE 并列出环路 →
// 按 nodeAlign 分列 → 纵向比例取最挤那一列的 → 几轮松弛把节点移向相连节点的流量加权中心、每轮后解开重叠 →
// 流带在节点两端按对端的位置排序、算出两端的中线。走 @xihan-ui/viz/sankey 子路径。

import { invalidArgument, VizError } from '../../errors'

export interface SankeyNodeInput {
  readonly id: string
}

export interface SankeyLinkInput {
  readonly source: string
  readonly target: string
  readonly value: number
}

/** 节点分到哪一列：justify 两端对齐（缺省，没有出边的节点贴到最后一列）、start 按深度、end 按到汇点的距离、center 居中。 */
export type SankeyNodeAlign = 'justify' | 'start' | 'end' | 'center'

export interface SankeyOptions {
  /** 布局占的宽高：流向沿宽度，列沿高度排开。 */
  readonly size: readonly [number, number]
  /** 节点的宽（沿流向的厚度），缺省 12。 */
  readonly nodeWidth?: number
  /** 同一列相邻节点之间的间隙，缺省 8。 */
  readonly nodePadding?: number
  readonly nodeAlign?: SankeyNodeAlign
  /** 列内次序：auto 由松弛决定（缺省），input 保持输入的次序。 */
  readonly nodeSort?: 'auto' | 'input'
  /** 松弛的轮数，缺省 6。 */
  readonly iterations?: number
}

export interface SankeyNode<N extends SankeyNodeInput = SankeyNodeInput> {
  readonly data: N
  readonly id: string
  readonly index: number
  /** 流入与流出里较大的那个。 */
  value: number
  /** 从源点出发的最长路径。 */
  depth: number
  /** 到汇点的最长路径。 */
  height: number
  /** 所在的列。 */
  layer: number
  x0: number
  x1: number
  y0: number
  y1: number
  readonly sourceLinks: SankeyLink<N>[]
  readonly targetLinks: SankeyLink<N>[]
}

export interface SankeyLink<N extends SankeyNodeInput = SankeyNodeInput> {
  readonly source: SankeyNode<N>
  readonly target: SankeyNode<N>
  readonly value: number
  readonly index: number
  /** 流带的宽：流量乘纵向比例。 */
  width: number
  /** 在源节点那一端的中线。 */
  y0: number
  /** 在目标节点那一端的中线。 */
  y1: number
}

export interface SankeyGraph<N extends SankeyNodeInput = SankeyNodeInput> {
  readonly nodes: SankeyNode<N>[]
  readonly links: SankeyLink<N>[]
  /** 流量换成像素的纵向比例。 */
  readonly ky: number
}

/** 找一条环路：深度优先，回到栈里的节点就是环。 */
function findCycle<N extends SankeyNodeInput>(nodes: readonly SankeyNode<N>[]): string[] | null {
  const state = new Map<SankeyNode<N>, 0 | 1 | 2>()
  const stack: SankeyNode<N>[] = []
  const visit = (node: SankeyNode<N>): string[] | null => {
    state.set(node, 1)
    stack.push(node)
    for (const link of node.sourceLinks) {
      const next = link.target
      if (state.get(next) === 1)
        return [...stack.slice(stack.indexOf(next)).map(n => n.id), next.id]
      if (!state.get(next)) {
        const hit = visit(next)
        if (hit)
          return hit
      }
    }
    stack.pop()
    state.set(node, 2)
    return null
  }
  for (const node of nodes) {
    if (!state.get(node)) {
      const hit = visit(node)
      if (hit)
        return hit
    }
  }
  return null
}

export function sankey<N extends SankeyNodeInput>(nodeInputs: readonly N[], linkInputs: readonly SankeyLinkInput[], options: SankeyOptions): SankeyGraph<N> {
  const [width, height] = options.size
  if (!(width >= 0) || !(height >= 0))
    throw invalidArgument('桑基图的尺寸必须是非负数', { size: options.size })
  const dx = Math.max(0, options.nodeWidth ?? 12)
  let py = Math.max(0, options.nodePadding ?? 8)
  const align = options.nodeAlign ?? 'justify'
  const iterations = Math.max(0, Math.floor(options.iterations ?? 6))
  const inputOrder = options.nodeSort === 'input'

  // 连起节点与流带
  const nodes: SankeyNode<N>[] = []
  const byId = new Map<string, SankeyNode<N>>()
  nodeInputs.forEach((data, index) => {
    if (byId.has(data.id))
      throw new VizError('XH_VIZ_DUPLICATE_KEY', `节点 ${data.id} 重复`, { id: data.id })
    const node: SankeyNode<N> = { data, id: data.id, index, value: 0, depth: 0, height: 0, layer: 0, x0: 0, x1: 0, y0: 0, y1: 0, sourceLinks: [], targetLinks: [] }
    nodes.push(node)
    byId.set(data.id, node)
  })
  const links: SankeyLink<N>[] = linkInputs.map((input, index) => {
    const source = byId.get(input.source)
    const target = byId.get(input.target)
    if (!source || !target)
      throw invalidArgument(`流带 ${input.source} → ${input.target} 指向不存在的节点`, { index, source: input.source, target: input.target })
    if (source === target)
      throw invalidArgument(`流带 ${input.source} → ${input.target} 是自环`, { index, node: input.source })
    if (!Number.isFinite(input.value) || input.value < 0)
      throw invalidArgument(`流带 ${input.source} → ${input.target} 的流量必须是非负数`, { index, value: input.value })
    const link: SankeyLink<N> = { source, target, value: input.value, index, width: 0, y0: 0, y1: 0 }
    source.sourceLinks.push(link)
    target.targetLinks.push(link)
    return link
  })
  const cycle = findCycle(nodes)
  if (cycle)
    throw new VizError('XH_VIZ_SANKEY_CYCLE', `流带成环：${cycle.join(' → ')}`, { cycle })

  // 节点值：流入与流出里较大的
  for (const node of nodes) {
    const out = node.sourceLinks.reduce((sum, link) => sum + link.value, 0)
    const into = node.targetLinks.reduce((sum, link) => sum + link.value, 0)
    node.value = Math.max(out, into)
  }

  // 深度与高度：拓扑序上的最长路径（已排除成环，逐层推进必然停下）
  let frontier = new Set(nodes)
  for (let x = 0; frontier.size > 0; x++) {
    const next = new Set<SankeyNode<N>>()
    for (const node of frontier) {
      node.depth = x
      for (const link of node.sourceLinks)
        next.add(link.target)
    }
    frontier = next
  }
  frontier = new Set(nodes)
  for (let x = 0; frontier.size > 0; x++) {
    const next = new Set<SankeyNode<N>>()
    for (const node of frontier) {
      node.height = x
      for (const link of node.targetLinks)
        next.add(link.source)
    }
    frontier = next
  }

  // 分列
  const columnCount = Math.max(0, ...nodes.map(node => node.depth)) + 1
  const layerOf = (node: SankeyNode<N>): number => {
    switch (align) {
      case 'start':
        return node.depth
      case 'end':
        return columnCount - 1 - node.height
      case 'center':
        return node.targetLinks.length ? node.depth : node.sourceLinks.length ? Math.min(...node.sourceLinks.map(link => link.target.depth)) - 1 : 0
      default:
        return node.sourceLinks.length ? node.depth : columnCount - 1
    }
  }
  const kx = columnCount > 1 ? (width - dx) / (columnCount - 1) : 0
  const columns: SankeyNode<N>[][] = Array.from({ length: columnCount }, () => [])
  for (const node of nodes) {
    const layer = Math.max(0, Math.min(columnCount - 1, Math.floor(layerOf(node))))
    node.layer = layer
    node.x0 = layer * kx
    node.x1 = node.x0 + dx
    columns[layer]!.push(node)
  }

  // 节点多到间隙放不下时收窄间隙；纵向比例由最挤的那一列决定
  const longest = Math.max(0, ...columns.map(column => column.length))
  if (longest > 1)
    py = Math.min(py, height / (longest - 1))
  const ky = Math.min(...columns.map((column) => {
    const total = column.reduce((sum, node) => sum + node.value, 0)
    return total > 0 ? (height - (column.length - 1) * py) / total : Number.POSITIVE_INFINITY
  }))
  const scale = Number.isFinite(ky) ? Math.max(0, ky) : 0
  for (const column of columns) {
    let y = 0
    for (const node of column) {
      node.y0 = y
      node.y1 = y + node.value * scale
      y = node.y1 + py
      for (const link of node.sourceLinks)
        link.width = link.value * scale
    }
    // 剩下的空白均分到节点之间
    const extra = (height - y + py) / (column.length + 1)
    column.forEach((node, i) => {
      node.y0 += extra * (i + 1)
      node.y1 += extra * (i + 1)
    })
  }

  const byBreadth = (a: SankeyNode<N>, b: SankeyNode<N>): number => a.y0 - b.y0
  const reorderLinks = (node: SankeyNode<N>): void => {
    node.sourceLinks.sort((a, b) => byBreadth(a.target, b.target) || a.index - b.index)
    node.targetLinks.sort((a, b) => byBreadth(a.source, b.source) || a.index - b.index)
  }
  nodes.forEach(reorderLinks)
  /** 节点挪过以后，相邻节点上的流带次序跟着它重排。 */
  const reorderNeighbourLinks = (node: SankeyNode<N>): void => {
    for (const link of node.targetLinks)
      link.source.sourceLinks.sort((a, b) => byBreadth(a.target, b.target) || a.index - b.index)
    for (const link of node.sourceLinks)
      link.target.targetLinks.sort((a, b) => byBreadth(a.source, b.source) || a.index - b.index)
  }

  /** 流带在目标节点上方的起点：从源节点这一端的次序推到目标节点那一端。 */
  const targetTop = (source: SankeyNode<N>, target: SankeyNode<N>): number => {
    let y = source.y0 - ((source.sourceLinks.length - 1) * py) / 2
    for (const link of source.sourceLinks) {
      if (link.target === target)
        break
      y += link.width + py
    }
    for (const link of target.targetLinks) {
      if (link.source === source)
        break
      y -= link.width
    }
    return y
  }
  const sourceTop = (source: SankeyNode<N>, target: SankeyNode<N>): number => {
    let y = target.y0 - ((target.targetLinks.length - 1) * py) / 2
    for (const link of target.targetLinks) {
      if (link.source === source)
        break
      y += link.width + py
    }
    for (const link of source.sourceLinks) {
      if (link.target === target)
        break
      y -= link.width
    }
    return y
  }

  const pushDown = (column: SankeyNode<N>[], y: number, from: number, alpha: number): void => {
    for (let i = from; i < column.length; ++i) {
      const node = column[i]!
      const dy = (y - node.y0) * alpha
      if (dy > 1e-6) {
        node.y0 += dy
        node.y1 += dy
      }
      y = node.y1 + py
    }
  }
  const pushUp = (column: SankeyNode<N>[], y: number, from: number, alpha: number): void => {
    for (let i = from; i >= 0; --i) {
      const node = column[i]!
      const dy = (node.y1 - y) * alpha
      if (dy > 1e-6) {
        node.y0 -= dy
        node.y1 -= dy
      }
      y = node.y0 - py
    }
  }
  /** 解开重叠：从中间的节点往两边推开，再从两端往回收进范围里。 */
  const resolveCollisions = (column: SankeyNode<N>[], alpha: number): void => {
    const i = column.length >> 1
    const subject = column[i]
    if (!subject)
      return
    pushUp(column, subject.y0 - py, i - 1, alpha)
    pushDown(column, subject.y1 + py, i + 1, alpha)
    pushUp(column, height, column.length - 1, alpha)
    pushDown(column, 0, 0, alpha)
  }

  for (let i = 0; i < iterations; ++i) {
    const alpha = 0.99 ** i
    const beta = Math.max(1 - alpha, (i + 1) / iterations)
    // 从右往左：节点移向下游相连节点的流量加权中心
    for (let c = columns.length - 2; c >= 0; --c) {
      const column = columns[c]!
      for (const source of column) {
        let y = 0
        let w = 0
        for (const link of source.sourceLinks) {
          const v = link.value * (link.target.layer - source.layer)
          y += sourceTop(source, link.target) * v
          w += v
        }
        if (!(w > 0))
          continue
        const dy = (y / w - source.y0) * alpha
        source.y0 += dy
        source.y1 += dy
        reorderNeighbourLinks(source)
      }
      if (!inputOrder)
        column.sort(byBreadth)
      resolveCollisions(column, beta)
    }
    // 从左往右：节点移向上游相连节点的流量加权中心
    for (let c = 1; c < columns.length; ++c) {
      const column = columns[c]!
      for (const target of column) {
        let y = 0
        let w = 0
        for (const link of target.targetLinks) {
          const v = link.value * (target.layer - link.source.layer)
          y += targetTop(link.source, target) * v
          w += v
        }
        if (!(w > 0))
          continue
        const dy = (y / w - target.y0) * alpha
        target.y0 += dy
        target.y1 += dy
        reorderNeighbourLinks(target)
      }
      if (!inputOrder)
        column.sort(byBreadth)
      resolveCollisions(column, beta)
    }
  }

  // 流带两端的中线：在节点上按对端的位置自上而下排开
  nodes.forEach(reorderLinks)
  for (const node of nodes) {
    let y0 = node.y0
    let y1 = node.y0
    for (const link of node.sourceLinks) {
      link.y0 = y0 + link.width / 2
      y0 += link.width
    }
    for (const link of node.targetLinks) {
      link.y1 = y1 + link.width / 2
      y1 += link.width
    }
  }
  return { nodes, links, ky: scale }
}

/**
 * 流带的中线：从源节点的右边到目标节点的左边，两端水平进出（bumpX）；以 width 为线宽描出来就是流带。
 * vertical 时流向朝下：横纵对调。
 */
export function sankeyLinkPath<N extends SankeyNodeInput>(link: SankeyLink<N>, orientation: 'horizontal' | 'vertical' = 'horizontal'): string {
  const x0 = link.source.x1
  const x1 = link.target.x0
  const mid = (x0 + x1) / 2
  const pts = [[x0, link.y0], [mid, link.y0], [mid, link.y1], [x1, link.y1]] as const
  const [p0, c0, c1, p1] = orientation === 'vertical' ? pts.map(([a, b]) => [b, a] as const) : pts
  return `M${p0![0]},${p0![1]}C${c0![0]},${c0![1]},${c1![0]},${c1![1]},${p1![0]},${p1![1]}`
}
