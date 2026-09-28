/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 散点稀疏：把点换到像素，按 cell × cell 的格子去重，每格只留最上面的那个点（数据次序靠后、后画的那个）。
// 格子远小于点径时，被去掉的点本来就被盖在留下的点下面，画出来看不出差别；数量却从百万降到像素格数。

import type { Rect } from '../geometry'
import { invalidArgument } from '../errors'

/** 稀疏后的点：下标按原次序，xs / ys 是对应的像素坐标。 */
export interface ThinnedPoints {
  readonly indices: Int32Array
  readonly xs: Float32Array
  readonly ys: Float32Array
  readonly count: number
}

export interface ThinOptions {
  /** 格子边长（px），缺省 2。 */
  readonly cell?: number
  /** 矩形外再多收多宽（px）：点只露出一部分时也画；缺省 0。 */
  readonly margin?: number
  /** 复用的输出缓冲。 */
  readonly out?: ThinnedPoints
}

/**
 * 按像素格稀疏 [from, to) 里的点。mapX、mapY 把数值换成像素；换不出有限数或落在 rect（外扩 margin）之外的点不要。
 * 每格留数据次序最靠后的那个点，输出仍按数据次序排，照这个次序画与全量的叠放一致。
 */
export function thinPoints(
  x: ArrayLike<number>,
  y: ArrayLike<number>,
  from: number,
  to: number,
  mapX: (value: number) => number,
  mapY: (value: number) => number,
  rect: Rect,
  options: ThinOptions = {},
): ThinnedPoints {
  if (x.length !== y.length)
    throw invalidArgument('x 列与 y 列必须等长', { x: x.length, y: y.length })
  const cell = options.cell ?? 2
  if (!(cell > 0))
    throw invalidArgument('格子边长必须为正', { cell })
  const margin = Math.max(0, options.margin ?? 0)
  const left = rect.x - margin
  const top = rect.y - margin
  const right = rect.x + rect.width + margin
  const bottom = rect.y + rect.height + margin
  const columns = Math.max(1, Math.ceil((right - left) / cell) + 1)
  const rows = Math.max(1, Math.ceil((bottom - top) / cell) + 1)
  const taken = new Uint8Array(columns * rows)
  const a = Math.max(0, Math.floor(from))
  const b = Math.min(x.length, Math.ceil(to))
  const capacity = Math.min(b - a, columns * rows)
  let indices = options.out && options.out.indices.length >= capacity ? options.out.indices : new Int32Array(Math.max(1, capacity))
  let xs = options.out && options.out.xs.length >= capacity ? options.out.xs : new Float32Array(Math.max(1, capacity))
  let ys = options.out && options.out.ys.length >= capacity ? options.out.ys : new Float32Array(Math.max(1, capacity))
  // 从后往前走：每格先遇到的就是数据次序最靠后的点；写在缓冲的尾部，最后整段挪到开头，次序即数据次序
  let slot = capacity
  for (let i = b - 1; i >= a; i--) {
    const px = mapX(x[i] as number)
    const py = mapY(y[i] as number)
    if (!(px >= left && px <= right && py >= top && py <= bottom))
      continue
    const k = Math.floor((py - top) / cell) * columns + Math.floor((px - left) / cell)
    if (taken[k] === 1)
      continue
    taken[k] = 1
    slot--
    indices[slot] = i
    xs[slot] = px
    ys[slot] = py
  }
  const count = capacity - slot
  if (slot > 0) {
    indices.copyWithin(0, slot, capacity)
    xs.copyWithin(0, slot, capacity)
    ys.copyWithin(0, slot, capacity)
  }
  // 缓冲若是新建且远大于用量，收成刚好的长度，不把大块内存留给调用方
  if (!options.out && count < capacity / 4) {
    indices = indices.slice(0, Math.max(1, count))
    xs = xs.slice(0, Math.max(1, count))
    ys = ys.slice(0, Math.max(1, count))
  }
  return { indices, xs, ys, count }
}
