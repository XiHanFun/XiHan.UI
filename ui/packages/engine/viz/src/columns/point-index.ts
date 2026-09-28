/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 像素网格拾取：把一批已在像素里的点按 cell 装进网格（计数排序，两个数组），查最近点只看附近几格。
// 视图变了就重建；只在指针进入后第一次拾取时建，悬停的每一帧都是常数时间。

import { invalidArgument } from '../errors'

/** 网格格数的上限。 */
const GRID_LIMIT = 1 << 22

export interface PointIndex {
  /** 离 (px, py) 最近、距离不超过 radius 的点在输入里的位置；距离相同取靠后的（后画、在上面的那个）；没有时为 −1。 */
  readonly nearest: (px: number, py: number, radius: number) => number
}

/** 由 count 个像素点建网格索引；cell 取命中半径最合适（查询看 3 × 3 格）。 */
export function createPointIndex(xs: ArrayLike<number>, ys: ArrayLike<number>, count: number, cell: number): PointIndex {
  if (!(cell > 0))
    throw invalidArgument('格子边长必须为正', { cell })
  const n = Math.max(0, Math.min(count, xs.length, ys.length))
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (let i = 0; i < n; i++) {
    const x = xs[i] as number
    const y = ys[i] as number
    if (x < minX)
      minX = x
    if (x > maxX)
      maxX = x
    if (y < minY)
      minY = y
    if (y > maxY)
      maxY = y
  }
  if (n === 0 || !Number.isFinite(minX) || !Number.isFinite(minY)) {
    return Object.freeze({ nearest: () => -1 })
  }
  // 点散得太开（越出视图很远）时格子放大，网格总数封顶，不为几个远点铺一张巨大的表
  const size = Math.max(cell, Math.sqrt(((maxX - minX + cell) * (maxY - minY + cell)) / GRID_LIMIT))
  const columns = Math.floor((maxX - minX) / size) + 1
  const rows = Math.floor((maxY - minY) / size) + 1
  const cellOf = (x: number, y: number): number => Math.floor((y - minY) / size) * columns + Math.floor((x - minX) / size)
  // 计数排序：offsets[k] 是第 k 格在 items 里的起点
  const offsets = new Int32Array(columns * rows + 1)
  for (let i = 0; i < n; i++)
    offsets[cellOf(xs[i] as number, ys[i] as number) + 1]! += 1
  for (let k = 1; k < offsets.length; k++)
    offsets[k]! += offsets[k - 1] as number
  const cursor = offsets.slice(0, columns * rows)
  const items = new Int32Array(n)
  for (let i = 0; i < n; i++) {
    const k = cellOf(xs[i] as number, ys[i] as number)
    items[cursor[k]!++] = i
  }

  return Object.freeze({
    nearest(px: number, py: number, radius: number): number {
      if (!Number.isFinite(px) || !Number.isFinite(py) || !(radius >= 0))
        return -1
      const reach = Math.ceil(radius / size)
      const cx = Math.floor((px - minX) / size)
      const cy = Math.floor((py - minY) / size)
      let best = -1
      let bestDistance = radius * radius
      for (let gy = Math.max(0, cy - reach); gy <= Math.min(rows - 1, cy + reach); gy++) {
        for (let gx = Math.max(0, cx - reach); gx <= Math.min(columns - 1, cx + reach); gx++) {
          const k = gy * columns + gx
          for (let s = offsets[k] as number; s < (offsets[k + 1] as number); s++) {
            const i = items[s] as number
            const dx = (xs[i] as number) - px
            const dy = (ys[i] as number) - py
            const d = dx * dx + dy * dy
            if (d < bestDistance || (d === bestDistance && i > best)) {
              bestDistance = d
              best = i
            }
          }
        }
      }
      return best
    },
  })
}
