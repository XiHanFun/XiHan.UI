/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 力导用的平铺四叉树：每轮都要重建，格子不建对象，各字段放在类型化数组里、按分配的先后编号。
// 逐层分配：一格的子格连号，编号总比父格大，倒着扫一遍就是后序；节点下标放在一块共用缓冲里原地划分，
// 每格只记它在缓冲里的区间。叶子是只剩一个点的格，或到了最深一层（重合的点再分也分不开）。

const MAX_DEPTH = 32

export interface FlatQuadtree {
  /** 用到的格数。 */
  size: number
  x0: Float64Array
  y0: Float64Array
  /** 边长：格子是正方形。 */
  side: Float64Array
  /** 子格的编号区间 [first, last)；叶子的 first 为 −1。 */
  first: Int32Array
  last: Int32Array
  /** 格里的节点在 order 里的区间 [start, end)。 */
  start: Int32Array
  end: Int32Array
  depth: Int32Array
  /** 电荷之和、按强度绝对值加权的重心、格里最大的碰撞半径：由调用方按需累计。 */
  charge: Float64Array
  cx: Float64Array
  cy: Float64Array
  radius: Float64Array
  order: Int32Array
}

function allocate(capacity: number, nodes: number): FlatQuadtree {
  return {
    size: 0,
    x0: new Float64Array(capacity),
    y0: new Float64Array(capacity),
    side: new Float64Array(capacity),
    first: new Int32Array(capacity),
    last: new Int32Array(capacity),
    start: new Int32Array(capacity),
    end: new Int32Array(capacity),
    depth: new Int32Array(capacity),
    charge: new Float64Array(capacity),
    cx: new Float64Array(capacity),
    cy: new Float64Array(capacity),
    radius: new Float64Array(capacity),
    order: new Int32Array(nodes),
  }
}

/** 格数不够时翻倍：旧的内容原样搬过去。 */
function grow(tree: FlatQuadtree): FlatQuadtree {
  const next = allocate(tree.x0.length * 2, tree.order.length)
  for (const key of ['x0', 'y0', 'side', 'first', 'last', 'start', 'end', 'depth', 'charge', 'cx', 'cy', 'radius'] as const)
    (next[key] as Float64Array | Int32Array).set(tree[key] as Float64Array & Int32Array)
  next.order.set(tree.order)
  next.size = tree.size
  return next
}

/** 把 order[start, end) 里坐标小于 pivot 的下标挪到前面，返回分界。 */
function partition(order: Int32Array, start: number, end: number, values: Float64Array, pivot: number): number {
  let i = start
  let j = end - 1
  while (i <= j) {
    while (i <= j && values[order[i]!]! < pivot) i++
    while (i <= j && values[order[j]!]! >= pivot) j--
    if (i < j) {
      const t = order[i]!
      order[i] = order[j]!
      order[j] = t
      i++
      j--
    }
  }
  return i
}

/** 按这一轮的坐标重建四叉树；传入上一轮的树就复用它的缓冲。 */
export function buildFlatQuadtree(previous: FlatQuadtree | null, xs: Float64Array, ys: Float64Array, count: number): FlatQuadtree {
  let tree = previous && previous.order.length >= count ? previous : allocate(Math.max(16, count * 4), count)
  tree.size = 0
  if (count === 0)
    return tree
  let x0 = Number.POSITIVE_INFINITY
  let y0 = Number.POSITIVE_INFINITY
  let x1 = Number.NEGATIVE_INFINITY
  let y1 = Number.NEGATIVE_INFINITY
  for (let i = 0; i < count; i++) {
    tree.order[i] = i
    x0 = Math.min(x0, xs[i]!)
    y0 = Math.min(y0, ys[i]!)
    x1 = Math.max(x1, xs[i]!)
    y1 = Math.max(y1, ys[i]!)
  }
  const push = (qx: number, qy: number, side: number, start: number, end: number, depth: number): void => {
    if (tree.size >= tree.x0.length)
      tree = grow(tree)
    const q = tree.size++
    tree.x0[q] = qx
    tree.y0[q] = qy
    tree.side[q] = side
    tree.start[q] = start
    tree.end[q] = end
    tree.depth[q] = depth
    tree.first[q] = -1
    tree.last[q] = -1
  }
  push(x0, y0, Math.max(x1 - x0, y1 - y0, 1e-9), 0, count, 0)
  for (let q = 0; q < tree.size; q++) {
    const start = tree.start[q]!
    const end = tree.end[q]!
    if (end - start <= 1 || tree.depth[q]! >= MAX_DEPTH)
      continue
    const half = tree.side[q]! / 2
    const qx = tree.x0[q]!
    const qy = tree.y0[q]!
    const order = tree.order
    // 先按 y 分上下两半，再各按 x 分左右
    const mid = partition(order, start, end, ys, qy + half)
    const top = partition(order, start, mid, xs, qx + half)
    const bottom = partition(order, mid, end, xs, qx + half)
    const depth = tree.depth[q]! + 1
    const firstChild = tree.size
    if (top > start)
      push(qx, qy, half, start, top, depth)
    if (mid > top)
      push(qx + half, qy, half, top, mid, depth)
    if (bottom > mid)
      push(qx, qy + half, half, mid, bottom, depth)
    if (end > bottom)
      push(qx + half, qy + half, half, bottom, end, depth)
    tree.first[q] = firstChild
    tree.last[q] = tree.size
  }
  return tree
}
