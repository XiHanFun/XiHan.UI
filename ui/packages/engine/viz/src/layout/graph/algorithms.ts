/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 有向图的基础算法：出入度、可达性、断环用的回边、拓扑序与找环。节点用 0 起的下标，连线是 { source, target }。

import { invalidArgument } from '../../errors'

/** 有向连线：两端节点的下标。 */
export interface GraphLink {
  readonly source: number
  readonly target: number
}

/** 各节点的入度与出度，按节点下标排列。 */
export interface NodeDegrees {
  readonly incoming: number[]
  readonly outgoing: number[]
}

/** 检查节点数与连线两端的下标，返回各节点的出边（连线下标）。 */
function outgoingLinks(count: number, links: readonly GraphLink[]): number[][] {
  if (!Number.isInteger(count) || count < 0)
    throw invalidArgument('节点数必须是非负整数', { count })
  const out: number[][] = Array.from({ length: count }, () => [])
  links.forEach((link, index) => {
    if (!isIndex(link.source, count) || !isIndex(link.target, count))
      throw invalidArgument('连线两端必须是已有节点的下标', { index, source: link.source, target: link.target, count })
    out[link.source]!.push(index)
  })
  return out
}

function isIndex(value: number, count: number): boolean {
  return Number.isInteger(value) && value >= 0 && value < count
}

/** 各节点的入度与出度；自环同时算一次入度与一次出度。 */
export function nodeDegrees(count: number, links: readonly GraphLink[]): NodeDegrees {
  outgoingLinks(count, links)
  const incoming = Array.from<number>({ length: count }).fill(0)
  const outgoing = Array.from<number>({ length: count }).fill(0)
  for (const link of links) {
    outgoing[link.source]!++
    incoming[link.target]!++
  }
  return { incoming, outgoing }
}

/** 沿连线方向从 roots 出发能到达的节点，按节点下标排列；roots 自身算可达。 */
export function reachableFrom(count: number, links: readonly GraphLink[], roots: readonly number[]): boolean[] {
  const out = outgoingLinks(count, links)
  const reached = Array.from<boolean>({ length: count }).fill(false)
  const queue: number[] = []
  for (const root of roots) {
    if (!isIndex(root, count))
      throw invalidArgument('起点必须是已有节点的下标', { root, count })
    if (!reached[root]) {
      reached[root] = true
      queue.push(root)
    }
  }
  for (let head = 0; head < queue.length; head++) {
    for (const linkIndex of out[queue[head]!]!) {
      const next = links[linkIndex]!.target
      if (!reached[next]) {
        reached[next] = true
        queue.push(next)
      }
    }
  }
  return reached
}

/**
 * 断环用的回边，按连线下标排列：深度优先，先从没有入线的节点出发，再按下标补其余节点；
 * 指向仍在栈上的节点的连线记为回边，把它们反向后图里不再有环。自环不算回边。
 */
export function findBackLinks(count: number, links: readonly GraphLink[]): boolean[] {
  const all = outgoingLinks(count, links)
  const out = all.map(indices => indices.filter(index => links[index]!.source !== links[index]!.target))
  const indegree = Array.from<number>({ length: count }).fill(0)
  for (const link of links) {
    if (link.source !== link.target)
      indegree[link.target]!++
  }
  const back = links.map(() => false)
  const state = Array.from<number>({ length: count }).fill(0)
  const roots = [
    ...indegree.flatMap((d, v) => (d === 0 ? [v] : [])),
    ...indegree.flatMap((d, v) => (d === 0 ? [] : [v])),
  ]
  for (const root of roots) {
    if (state[root] !== 0)
      continue
    state[root] = 1
    const stack: [number, number][] = [[root, 0]]
    while (stack.length > 0) {
      const top = stack.at(-1)!
      const [v, next] = top
      if (next < out[v]!.length) {
        top[1]++
        const linkIndex = out[v]![next]!
        const w = links[linkIndex]!.target
        if (state[w] === 1) {
          back[linkIndex] = true
        }
        else if (state[w] === 0) {
          state[w] = 1
          stack.push([w, 0])
        }
      }
      else {
        state[v] = 2
        stack.pop()
      }
    }
  }
  return back
}

/** 拓扑序：入度为零的节点按下标先后依次出列；图里有环（含自环）时为 undefined。 */
export function topologicalOrder(count: number, links: readonly GraphLink[]): number[] | undefined {
  const out = outgoingLinks(count, links)
  const remaining = Array.from<number>({ length: count }).fill(0)
  for (const link of links)
    remaining[link.target]!++
  const order = remaining.flatMap((d, v) => (d === 0 ? [v] : []))
  for (let head = 0; head < order.length; head++) {
    for (const linkIndex of out[order[head]!]!) {
      const w = links[linkIndex]!.target
      if (--remaining[w]! === 0)
        order.push(w)
    }
  }
  return order.length === count ? order : undefined
}

/**
 * 找一条环：按下标深度优先，沿连线先后走，回到栈上的节点即成环。
 * 返回环上依次经过的节点，首尾是同一个节点（自环为 [v, v]）；没有环时为 undefined。
 */
export function findCycle(count: number, links: readonly GraphLink[]): number[] | undefined {
  const out = outgoingLinks(count, links)
  const state = Array.from<number>({ length: count }).fill(0)
  for (let root = 0; root < count; root++) {
    if (state[root] !== 0)
      continue
    state[root] = 1
    const path = [root]
    const stack: [number, number][] = [[root, 0]]
    while (stack.length > 0) {
      const top = stack.at(-1)!
      const [v, next] = top
      if (next < out[v]!.length) {
        top[1]++
        const w = links[out[v]![next]!]!.target
        if (state[w] === 1)
          return [...path.slice(path.indexOf(w)), w]
        if (state[w] === 0) {
          state[w] = 1
          path.push(w)
          stack.push([w, 0])
        }
      }
      else {
        state[v] = 2
        path.pop()
        stack.pop()
      }
    }
  }
  return undefined
}
