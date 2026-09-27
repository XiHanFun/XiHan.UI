/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 矩形树图：每个节点一块矩形，面积与聚合值成正比，子节点铺满父节点（扣掉内外边距与顶部标题）。
// 铺法：squarify 让每块尽量接近目标宽高比（Bruls 等，2000，缺省黄金比 φ）；binary 按值二分成近似平衡的树；
// slice 竖切、dice 横切、sliceDice 按深度交替。调用前先 sum / count 算出聚合值。

import type { HierarchyNode } from './node'
import { invalidArgument } from '../../errors'

/** 把一个节点的子节点铺进 [x0, x1] × [y0, y1]。 */
export type TreemapTile = <T>(parent: HierarchyNode<T>, x0: number, y0: number, x1: number, y1: number) => void

export type TreemapTileName = 'squarify' | 'binary' | 'slice' | 'dice' | 'slice-dice'

/** 黄金比：squarify 的缺省目标宽高比。 */
export const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2

/** 横切：子节点从左到右排开，宽度与值成正比。 */
export function treemapDice<T>(parent: HierarchyNode<T>, x0: number, y0: number, x1: number, y1: number): void {
  const nodes = parent.children ?? []
  const k = parent.value ? (x1 - x0) / parent.value : 0
  let x = x0
  for (const node of nodes) {
    node.y0 = y0
    node.y1 = y1
    node.x0 = x
    x += (node.value ?? 0) * k
    node.x1 = x
  }
}

/** 竖切：子节点从上到下排开，高度与值成正比。 */
export function treemapSlice<T>(parent: HierarchyNode<T>, x0: number, y0: number, x1: number, y1: number): void {
  const nodes = parent.children ?? []
  const k = parent.value ? (y1 - y0) / parent.value : 0
  let y = y0
  for (const node of nodes) {
    node.x0 = x0
    node.x1 = x1
    node.y0 = y
    y += (node.value ?? 0) * k
    node.y1 = y
  }
}

/** 按深度交替：奇数层竖切、偶数层横切。 */
export function treemapSliceDice<T>(parent: HierarchyNode<T>, x0: number, y0: number, x1: number, y1: number): void {
  ;(parent.depth & 1 ? treemapSlice : treemapDice)(parent, x0, y0, x1, y1)
}

/** 一行子节点：铺成一条横带或竖带。 */
function layRow<T>(nodes: readonly HierarchyNode<T>[], value: number, dice: boolean, x0: number, y0: number, x1: number, y1: number): void {
  const row = { value, depth: 0, children: nodes } as unknown as HierarchyNode<T>
  ;(dice ? treemapDice : treemapSlice)(row, x0, y0, x1, y1)
}

/** squarify：逐行往里加子节点，加一个会让这一行最差的宽高比变坏就换下一行。ratio 是目标宽高比。 */
export function treemapSquarify(ratio = GOLDEN_RATIO): TreemapTile {
  if (!(ratio >= 1))
    throw invalidArgument('squarify 的目标宽高比不能小于 1', { ratio })
  return <T>(parent: HierarchyNode<T>, x0: number, y0: number, x1: number, y1: number): void => {
    const nodes = parent.children ?? []
    let value = parent.value ?? 0
    let i0 = 0
    let i1 = 0
    const n = nodes.length
    while (i0 < n) {
      const dx = x1 - x0
      const dy = y1 - y0
      // 找下一个非空的节点
      let sumValue = 0
      do sumValue = nodes[i1++]!.value ?? 0
      while (!sumValue && i1 < n)
      let minValue = sumValue
      let maxValue = sumValue
      const alpha = Math.max(dy / dx, dx / dy) / (value * ratio)
      let beta = sumValue * sumValue * alpha
      let minRatio = Math.max(maxValue / beta, beta / minValue)
      // 宽高比保持或变好就继续往这一行里加
      for (; i1 < n; ++i1) {
        const nodeValue = nodes[i1]!.value ?? 0
        sumValue += nodeValue
        if (nodeValue < minValue)
          minValue = nodeValue
        if (nodeValue > maxValue)
          maxValue = nodeValue
        beta = sumValue * sumValue * alpha
        const newRatio = Math.max(maxValue / beta, beta / minValue)
        if (newRatio > minRatio) {
          sumValue -= nodeValue
          break
        }
        minRatio = newRatio
      }
      // 这一行沿短边铺开，剩下的空间留给下一行
      const row = nodes.slice(i0, i1)
      if (dx < dy) {
        const y = value ? y0 + (dy * sumValue) / value : y1
        layRow(row, sumValue, true, x0, y0, x1, y)
        y0 = y
      }
      else {
        const x = value ? x0 + (dx * sumValue) / value : x1
        layRow(row, sumValue, false, x0, y0, x, y1)
        x0 = x
      }
      value -= sumValue
      i0 = i1
    }
  }
}

/** binary：按值把子节点分成两半，递归切开，切的方向取较长的一边；结果近似平衡、次序保留。 */
export function treemapBinary<T>(parent: HierarchyNode<T>, x0: number, y0: number, x1: number, y1: number): void {
  const nodes = parent.children ?? []
  const n = nodes.length
  if (n === 0)
    return
  const sums: number[] = [0]
  for (let i = 0; i < n; i++)
    sums.push(sums[i]! + (nodes[i]!.value ?? 0))
  const partition = (i: number, j: number, value: number, a0: number, b0: number, a1: number, b1: number): void => {
    if (i >= j - 1) {
      const node = nodes[i]!
      node.x0 = a0
      node.y0 = b0
      node.x1 = a1
      node.y1 = b1
      return
    }
    const valueOffset = sums[i]!
    const valueTarget = value / 2 + valueOffset
    let k = i + 1
    let hi = j - 1
    while (k < hi) {
      const mid = (k + hi) >>> 1
      if (sums[mid]! < valueTarget)
        k = mid + 1
      else hi = mid
    }
    if (valueTarget - sums[k - 1]! < sums[k]! - valueTarget && i + 1 < k)
      --k
    const valueLeft = sums[k]! - valueOffset
    const valueRight = value - valueLeft
    if (a1 - a0 > b1 - b0) {
      const ak = value ? (a0 * valueRight + a1 * valueLeft) / value : a1
      partition(i, k, valueLeft, a0, b0, ak, b1)
      partition(k, j, valueRight, ak, b0, a1, b1)
    }
    else {
      const bk = value ? (b0 * valueRight + b1 * valueLeft) / value : b1
      partition(i, k, valueLeft, a0, b0, a1, bk)
      partition(k, j, valueRight, a0, bk, a1, b1)
    }
  }
  partition(0, n, parent.value ?? 0, x0, y0, x1, y1)
}

/** 铺法的名字换成铺法。 */
export function treemapTile(name: TreemapTileName): TreemapTile {
  switch (name) {
    case 'squarify':
      return treemapSquarify()
    case 'binary':
      return treemapBinary
    case 'slice':
      return treemapSlice
    case 'dice':
      return treemapDice
    case 'slice-dice':
      return treemapSliceDice
  }
}

/** 边距：常数，或按节点给（顶部标题只给有子节点的节点留）。 */
export type TreemapPadding<T = unknown> = number | ((node: HierarchyNode<T>) => number)

export interface TreemapOptions<T = unknown> {
  readonly size: readonly [number, number]
  readonly tile?: TreemapTileName | TreemapTile
  /** 兄弟之间的间隙。 */
  readonly paddingInner?: TreemapPadding<T>
  /** 父节点四边向里缩的量。 */
  readonly paddingOuter?: TreemapPadding<T>
  /** 父节点顶边单独向里缩的量（留给分组标题），缺省同 paddingOuter。 */
  readonly paddingTop?: TreemapPadding<T>
  /** 四边取整到像素。 */
  readonly round?: boolean
}

function paddingOf<T>(padding: TreemapPadding<T> | undefined): (node: HierarchyNode<T>) => number {
  if (typeof padding === 'function')
    return node => Math.max(0, padding(node) || 0)
  const value = Math.max(0, padding ?? 0)
  return () => value
}

/** 铺矩形树图：把 [0, w] × [0, h] 分给各节点，四边写回节点的 x0 / y0 / x1 / y1。 */
export function treemap<T>(root: HierarchyNode<T>, options: TreemapOptions<T>): HierarchyNode<T> {
  const [dx, dy] = options.size
  if (!(dx >= 0) || !(dy >= 0))
    throw invalidArgument('矩形树图的尺寸必须是非负数', { size: options.size })
  if (root.value == null)
    throw invalidArgument('铺矩形树图之前先 sum() 或 count() 算出聚合值', {})
  const tile = typeof options.tile === 'function' ? options.tile : treemapTile(options.tile ?? 'squarify')
  const inner = paddingOf(options.paddingInner)
  const outer = paddingOf(options.paddingOuter)
  const top = options.paddingTop == null ? outer : paddingOf(options.paddingTop)
  const paddingStack: number[] = [0]
  root.x0 = 0
  root.y0 = 0
  root.x1 = dx
  root.y1 = dy
  root.eachBefore((node) => {
    let p = paddingStack[node.depth] ?? 0
    let x0 = node.x0 + p
    let y0 = node.y0 + p
    let x1 = node.x1 - p
    let y1 = node.y1 - p
    if (x1 < x0)
      x0 = x1 = (x0 + x1) / 2
    if (y1 < y0)
      y0 = y1 = (y0 + y1) / 2
    node.x0 = x0
    node.y0 = y0
    node.x1 = x1
    node.y1 = y1
    if (node.children) {
      // 兄弟间隙的一半写在子节点四边上：相邻两块各让一半，合起来正好是一道间隙
      p = paddingStack[node.depth + 1] = inner(node) / 2
      x0 += outer(node) - p
      y0 += top(node) - p
      x1 -= outer(node) - p
      y1 -= outer(node) - p
      if (x1 < x0)
        x0 = x1 = (x0 + x1) / 2
      if (y1 < y0)
        y0 = y1 = (y0 + y1) / 2
      tile(node, x0, y0, x1, y1)
    }
  })
  if (options.round) {
    root.eachBefore((node) => {
      node.x0 = Math.round(node.x0)
      node.y0 = Math.round(node.y0)
      node.x1 = Math.round(node.x1)
      node.y1 = Math.round(node.y1)
    })
  }
  return root
}
