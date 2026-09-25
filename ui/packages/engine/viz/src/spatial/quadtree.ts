/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 四叉树：一次建好、不可变；最近点查询按离节点矩形的距离剪枝，用于散点拾取与避让。

import { invalidArgument } from '../errors'

export interface QuadtreeNode<T> {
  readonly x0: number
  readonly y0: number
  readonly x1: number
  readonly y1: number
  /** 叶子里的数据；内部节点为 undefined。 */
  readonly items?: readonly T[]
}

export interface QuadtreeHit<T> {
  readonly item: T
  readonly index: number
  readonly x: number
  readonly y: number
  readonly distance: number
}

export interface Quadtree<T> {
  readonly size: number
  /** 离 (x, y) 最近、且距离不超过 radius 的数据（缺省不限距离）；距离相同取输入里靠前的。 */
  readonly find: (x: number, y: number, radius?: number) => QuadtreeHit<T> | undefined
  /** 距离不超过 radius 的全部数据，按距离升序。 */
  readonly findAll: (x: number, y: number, radius: number) => QuadtreeHit<T>[]
  /** 先序遍历；回调返回 true 时不再进入该节点的子节点。 */
  readonly visit: (callback: (node: QuadtreeNode<T>) => boolean | void) => void
}

interface Entry<T> {
  readonly item: T
  readonly index: number
  readonly x: number
  readonly y: number
}

interface Node<T> {
  readonly x0: number
  readonly y0: number
  readonly x1: number
  readonly y1: number
  readonly entries?: Entry<T>[]
  readonly children?: Node<T>[]
}

const LEAF_SIZE = 8
const MAX_DEPTH = 24

function build<T>(entries: Entry<T>[], x0: number, y0: number, x1: number, y1: number, depth: number): Node<T> {
  if (entries.length <= LEAF_SIZE || depth >= MAX_DEPTH)
    return { x0, y0, x1, y1, entries }
  const xm = (x0 + x1) / 2
  const ym = (y0 + y1) / 2
  const quadrants: Entry<T>[][] = [[], [], [], []]
  for (const entry of entries)
    (quadrants[(entry.x >= xm ? 1 : 0) + (entry.y >= ym ? 2 : 0)] as Entry<T>[]).push(entry)
  const bounds: Array<[number, number, number, number]> = [[x0, y0, xm, ym], [xm, y0, x1, ym], [x0, ym, xm, y1], [xm, ym, x1, y1]]
  return {
    x0,
    y0,
    x1,
    y1,
    children: quadrants.map((group, i) => {
      const [a, b, c, d] = bounds[i] as [number, number, number, number]
      return build(group, a, b, c, d, depth + 1)
    }),
  }
}

/** 点到矩形的距离（在矩形内为 0）。 */
function rectDistance(node: Node<unknown>, x: number, y: number): number {
  const dx = Math.max(node.x0 - x, 0, x - node.x1)
  const dy = Math.max(node.y0 - y, 0, y - node.y1)
  return Math.hypot(dx, dy)
}

/** 由数据点建四叉树；坐标不是有限数的点不进树。 */
export function createQuadtree<T>(points: readonly T[], x: (d: T, i: number) => number, y: (d: T, i: number) => number): Quadtree<T> {
  const entries: Entry<T>[] = []
  points.forEach((item, index) => {
    const px = x(item, index)
    const py = y(item, index)
    if (Number.isFinite(px) && Number.isFinite(py))
      entries.push({ item, index, x: px, y: py })
  })
  let x0 = Number.POSITIVE_INFINITY
  let y0 = Number.POSITIVE_INFINITY
  let x1 = Number.NEGATIVE_INFINITY
  let y1 = Number.NEGATIVE_INFINITY
  for (const e of entries) {
    x0 = Math.min(x0, e.x)
    y0 = Math.min(y0, e.y)
    x1 = Math.max(x1, e.x)
    y1 = Math.max(y1, e.y)
  }
  // 正方形外框，四个象限等大
  const side = entries.length > 0 ? Math.max(x1 - x0, y1 - y0, 1e-9) : 0
  const root = entries.length > 0 ? build(entries, x0, y0, x0 + side, y0 + side, 0) : { x0: 0, y0: 0, x1: 0, y1: 0, entries: [] }

  const collect = (px: number, py: number, radius: number, limit: number): QuadtreeHit<T>[] => {
    if (!Number.isFinite(px) || !Number.isFinite(py))
      throw invalidArgument('查询点必须是有限数', { x: px, y: py })
    if (!(radius >= 0))
      throw invalidArgument('查询半径不能为负', { radius })
    const hits: QuadtreeHit<T>[] = []
    let bound = radius
    const better = (a: QuadtreeHit<T>, b: QuadtreeHit<T>): number => a.distance - b.distance || a.index - b.index
    const walk = (node: Node<T>): void => {
      if (rectDistance(node, px, py) > bound)
        return
      if (node.entries) {
        for (const e of node.entries) {
          const distance = Math.hypot(e.x - px, e.y - py)
          if (distance <= bound)
            hits.push({ item: e.item, index: e.index, x: e.x, y: e.y, distance })
        }
        if (limit === 1 && hits.length > 0) {
          hits.sort(better)
          hits.length = 1
          bound = (hits[0] as QuadtreeHit<T>).distance
        }
        return
      }
      // 先走离查询点近的象限，越早收紧剪枝半径
      const children = (node.children as Node<T>[]).slice().sort((a, b) => rectDistance(a, px, py) - rectDistance(b, px, py))
      for (const child of children)
        walk(child)
    }
    walk(root)
    return hits.sort(better)
  }

  return Object.freeze({
    size: entries.length,
    find(px: number, py: number, radius = Number.POSITIVE_INFINITY): QuadtreeHit<T> | undefined {
      return collect(px, py, radius, 1)[0]
    },
    findAll: (px: number, py: number, radius: number) => collect(px, py, radius, Number.POSITIVE_INFINITY),
    visit(callback: (node: QuadtreeNode<T>) => boolean | void): void {
      const walk = (node: Node<T>): void => {
        const view: QuadtreeNode<T> = node.entries
          ? { x0: node.x0, y0: node.y0, x1: node.x1, y1: node.y1, items: node.entries.map(e => e.item) }
          : { x0: node.x0, y0: node.y0, x1: node.x1, y1: node.y1 }
        if (callback(view) === true || !node.children)
          return
        for (const child of node.children)
          walk(child)
      }
      walk(root)
    },
  })
}
