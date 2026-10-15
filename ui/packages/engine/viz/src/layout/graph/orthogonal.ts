/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 直角连线路由：两端各沿离开方向引出一段，在障碍物外扩边界与引出点构成的稀疏网格上
// 求「长度 + 拐弯代价」最小的路径。先只看两端附近的障碍物，找不到通路再扩到全部障碍物。

import type { Point, Rect } from '../../geometry'
import { invalidArgument } from '../../errors'

/** 连线离开或进入节点的那一边。 */
export type RouteSide = 'top' | 'right' | 'bottom' | 'left'

export interface RouteEnd {
  /** 端点，通常在节点的边上。 */
  readonly point: Point
  /** 起点是离开节点的那一边，终点是进入节点的那一边。 */
  readonly side: RouteSide
}

export interface OrthogonalRouteOptions {
  readonly source: RouteEnd
  readonly target: RouteEnd
  /** 要绕开的矩形，通常含两端所在的节点。 */
  readonly obstacles?: readonly Rect[]
  /** 与障碍物保持的距离，也是两端引出段的长度，缺省 16。 */
  readonly margin?: number
  /** 每个拐弯折合的长度，缺省 margin 的两倍。 */
  readonly bendCost?: number
}

export interface OrthogonalRoute {
  /** 从起点到终点的折线，相邻两点横坐标或纵坐标相同，不含重复点与共线的中间点。 */
  readonly points: readonly Point[]
  /** 是否绕开了全部障碍物；为 false 时 points 是不看障碍物的折线。 */
  readonly clear: boolean
}

interface Box {
  readonly x0: number
  readonly y0: number
  readonly x1: number
  readonly y1: number
}

const SIDES: readonly RouteSide[] = ['right', 'bottom', 'left', 'top']
const STEP: readonly Point[] = [[1, 0], [0, 1], [-1, 0], [0, -1]]

/** 求一条绕开障碍物的直角折线。 */
export function routeOrthogonal(options: OrthogonalRouteOptions): OrthogonalRoute {
  const margin = options.margin ?? 16
  if (!(Number.isFinite(margin) && margin >= 0))
    throw invalidArgument('路由的间距必须是非负有限数', { margin })
  const bendCost = options.bendCost ?? margin * 2
  if (!(Number.isFinite(bendCost) && bendCost >= 0))
    throw invalidArgument('拐弯代价必须是非负有限数', { bendCost })
  const start = checkEnd(options.source, 'source')
  const end = checkEnd(options.target, 'target')
  const obstacles = (options.obstacles ?? []).map((rect, index) => {
    if (![rect.x, rect.y, rect.width, rect.height].every(Number.isFinite) || rect.width < 0 || rect.height < 0)
      throw invalidArgument('障碍物必须是宽高非负的有限矩形', { index, rect })
    return { x0: rect.x - margin, y0: rect.y - margin, x1: rect.x + rect.width + margin, y1: rect.y + rect.height + margin }
  })

  const startDir = SIDES.indexOf(start.side)
  const enterDir = (SIDES.indexOf(end.side) + 2) % 4
  const startStub = offset(start.point, startDir, margin)
  const endStub = offset(end.point, (enterDir + 2) % 4, margin)
  const search = { startStub, endStub, startDir, enterDir, bendCost }

  const near = boundsOf([startStub, endStub])
  const local = obstacles.filter(box => overlaps(box, near))
  const regions = [expand(boundsOf([startStub, endStub], local), margin)]
  if (local.length < obstacles.length)
    regions.push(expand(boundsOf([startStub, endStub], obstacles), margin))
  for (const region of regions) {
    const path = searchGrid(region, obstacles.filter(box => overlaps(box, region)), search)
    if (path)
      return { points: simplify([start.point, ...path, end.point]), clear: true }
  }
  const elbow = startDir % 2 === 0
    ? [[(startStub[0] + endStub[0]) / 2, startStub[1]], [(startStub[0] + endStub[0]) / 2, endStub[1]]] as Point[]
    : [[startStub[0], (startStub[1] + endStub[1]) / 2], [endStub[0], (startStub[1] + endStub[1]) / 2]] as Point[]
  return { points: simplify([start.point, startStub, ...elbow, endStub, end.point]), clear: false }
}

function checkEnd(end: RouteEnd, name: string): RouteEnd {
  if (!SIDES.includes(end.side))
    throw invalidArgument('端点的方向必须是 top、right、bottom 或 left', { [name]: end })
  if (!Number.isFinite(end.point[0]) || !Number.isFinite(end.point[1]))
    throw invalidArgument('端点坐标必须是有限数', { [name]: end })
  return end
}

function offset(point: Point, dir: number, distance: number): Point {
  const [dx, dy] = STEP[dir]!
  return [point[0] + dx * distance, point[1] + dy * distance]
}

function boundsOf(points: readonly Point[], boxes: readonly Box[] = []): Box {
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const [x, y] of points) {
    x0 = Math.min(x0, x)
    y0 = Math.min(y0, y)
    x1 = Math.max(x1, x)
    y1 = Math.max(y1, y)
  }
  for (const box of boxes) {
    x0 = Math.min(x0, box.x0)
    y0 = Math.min(y0, box.y0)
    x1 = Math.max(x1, box.x1)
    y1 = Math.max(y1, box.y1)
  }
  return { x0, y0, x1, y1 }
}

function expand(box: Box, by: number): Box {
  return { x0: box.x0 - by, y0: box.y0 - by, x1: box.x1 + by, y1: box.y1 + by }
}

function overlaps(a: Box, b: Box): boolean {
  return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1
}

function inside(boxes: readonly Box[], x: number, y: number): boolean {
  return boxes.some(box => box.x0 < x && x < box.x1 && box.y0 < y && y < box.y1)
}

interface Search {
  readonly startStub: Point
  readonly endStub: Point
  readonly startDir: number
  readonly enterDir: number
  readonly bendCost: number
}

/** 在区域内的网格上做 Dijkstra，状态是（格点, 到达方向）；返回两个引出点之间的格点序列。 */
function searchGrid(region: Box, boxes: readonly Box[], search: Search): Point[] | undefined {
  const { startStub, endStub, startDir, enterDir, bendCost } = search
  const xs = coordinates([region.x0, region.x1, startStub[0], endStub[0], (startStub[0] + endStub[0]) / 2], boxes, 'x', region)
  const ys = coordinates([region.y0, region.y1, startStub[1], endStub[1], (startStub[1] + endStub[1]) / 2], boxes, 'y', region)
  const nx = xs.length
  const cells = nx * ys.length
  const startCell = ys.indexOf(startStub[1]) * nx + xs.indexOf(startStub[0])
  const endCell = ys.indexOf(endStub[1]) * nx + xs.indexOf(endStub[0])
  const open = (cell: number): boolean =>
    cell === startCell || cell === endCell || !inside(boxes, xs[cell % nx]!, ys[Math.floor(cell / nx)]!)

  const cost = new Float64Array(cells * 4).fill(Infinity)
  const previous = new Int32Array(cells * 4).fill(-1)
  const heap = new StateHeap()
  const first = startCell * 4 + startDir
  cost[first] = 0
  heap.push(0, first)
  let goal = -1
  let goalCost = Infinity
  while (heap.size > 0) {
    const [current, state] = heap.pop()
    if (current > cost[state]! || current >= goalCost)
      continue
    const cell = state >> 2
    const dir = state & 3
    if (cell === endCell) {
      if (dir === (enterDir + 2) % 4)
        continue
      const total = current + (dir === enterDir ? 0 : bendCost)
      if (total < goalCost) {
        goalCost = total
        goal = state
      }
      continue
    }
    const i = cell % nx
    const j = Math.floor(cell / nx)
    for (let next = 0; next < 4; next++) {
      if (next === (dir + 2) % 4)
        continue
      const ni = i + STEP[next]![0]
      const nj = j + STEP[next]![1]
      if (ni < 0 || nj < 0 || ni >= nx || nj >= ys.length)
        continue
      const neighbor = nj * nx + ni
      if (!open(neighbor) || inside(boxes, (xs[i]! + xs[ni]!) / 2, (ys[j]! + ys[nj]!) / 2))
        continue
      const step = Math.abs(xs[ni]! - xs[i]!) + Math.abs(ys[nj]! - ys[j]!) + (next === dir ? 0 : bendCost)
      const target = neighbor * 4 + next
      if (current + step < cost[target]!) {
        cost[target] = current + step
        previous[target] = state
        heap.push(current + step, target)
      }
    }
  }
  if (goal < 0)
    return undefined
  const cellsOnPath: Point[] = []
  for (let state = goal; state >= 0; state = previous[state]!) {
    const cell = state >> 2
    cellsOnPath.push([xs[cell % nx]!, ys[Math.floor(cell / nx)]!])
  }
  return cellsOnPath.reverse()
}

/** 网格线坐标：给定的坐标加上落在区域内的障碍物边界，去重升序。 */
function coordinates(seed: readonly number[], boxes: readonly Box[], axis: 'x' | 'y', region: Box): number[] {
  const low = axis === 'x' ? region.x0 : region.y0
  const high = axis === 'x' ? region.x1 : region.y1
  const values = new Set(seed)
  for (const box of boxes) {
    for (const value of axis === 'x' ? [box.x0, box.x1] : [box.y0, box.y1]) {
      if (value >= low && value <= high)
        values.add(value)
    }
  }
  return [...values].sort((a, b) => a - b)
}

/** 去掉重复点与共线的中间点。 */
function simplify(points: readonly Point[]): Point[] {
  const out: Point[] = []
  for (const point of points) {
    const last = out[out.length - 1]
    if (last && last[0] === point[0] && last[1] === point[1])
      continue
    const before = out[out.length - 2]
    if (before && last && ((before[0] === last[0] && last[0] === point[0]) || (before[1] === last[1] && last[1] === point[1])))
      out[out.length - 1] = point
    else
      out.push(point)
  }
  return out
}

/** 以代价为键的小顶堆；代价相同时先入先出。 */
class StateHeap {
  private readonly costs: number[] = []
  private readonly states: number[] = []
  private readonly order: number[] = []
  private counter = 0

  get size(): number {
    return this.states.length
  }

  push(cost: number, state: number): void {
    this.costs.push(cost)
    this.states.push(state)
    this.order.push(this.counter++)
    let i = this.states.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (!this.less(i, parent))
        break
      this.swap(i, parent)
      i = parent
    }
  }

  pop(): [number, number] {
    const top: [number, number] = [this.costs[0]!, this.states[0]!]
    const last = this.states.length - 1
    this.swap(0, last)
    this.costs.pop()
    this.states.pop()
    this.order.pop()
    let i = 0
    for (;;) {
      const left = i * 2 + 1
      const right = left + 1
      let smallest = i
      if (left < this.states.length && this.less(left, smallest))
        smallest = left
      if (right < this.states.length && this.less(right, smallest))
        smallest = right
      if (smallest === i)
        break
      this.swap(i, smallest)
      i = smallest
    }
    return top
  }

  private less(a: number, b: number): boolean {
    return this.costs[a]! < this.costs[b]! || (this.costs[a] === this.costs[b] && this.order[a]! < this.order[b]!)
  }

  private swap(a: number, b: number): void {
    for (const list of [this.costs, this.states, this.order]) {
      const value = list[a]!
      list[a] = list[b]!
      list[b] = value
    }
  }
}
