/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 饼布局：按值分配角度，间隙角计入每个扇区自己的角度范围；负值立即报错，尾部小扇区可以并成「其他」。

import { isPresent } from '../array/statistics'
import { invalidArgument, VizError } from '../errors'

export interface PieSlice<T> {
  readonly data: T
  /** 在输入里的位置。 */
  readonly index: number
  /** 缺失值记为 0。 */
  readonly value: number
  readonly startAngle: number
  readonly endAngle: number
  /** 交给 arc 的间隙角；扇区的角度范围已经包含它。 */
  readonly padAngle: number
}

export interface PieOptions<T> {
  readonly value: (d: T, i: number) => number | null | undefined
  /** none 按输入顺序排角度；descending 大的在前，值相同时按输入顺序。结果数组始终按输入顺序。 */
  readonly sort?: 'none' | 'descending'
  /** 缺省 0（12 点方向）。 */
  readonly startAngle?: number
  /** 缺省 2π；与 startAngle 之差超过一圈时按一圈算。 */
  readonly endAngle?: number
  /** 每个扇区的间隙角，缺省 0；超过平均角度时收到平均角度。 */
  readonly padAngle?: number
}

const TAU = 2 * Math.PI

/** 饼布局。值为负时抛 `XH_VIZ_NEGATIVE_SHARE`：占比类图形不能表达负数。 */
export function pie<T>(values: readonly T[], options: PieOptions<T>): PieSlice<T>[] {
  const { sort = 'none', startAngle = 0, endAngle = TAU, padAngle = 0 } = options
  if (!Number.isFinite(startAngle) || !Number.isFinite(endAngle) || !(padAngle >= 0))
    throw invalidArgument('饼的起止角必须是有限数，间隙角不能为负', { startAngle, endAngle, padAngle })
  const amounts = values.map((d, i) => {
    const v = options.value(d, i)
    if (!isPresent(v))
      return 0
    if (v < 0)
      throw new VizError('XH_VIZ_NEGATIVE_SHARE', '饼图的值不能为负', { index: i, value: v })
    if (!Number.isFinite(v))
      throw invalidArgument('饼图的值必须是有限数', { index: i, value: v })
    return v
  })
  const n = values.length
  const span = Math.max(-TAU, Math.min(TAU, endAngle - startAngle))
  const pad = n === 0 ? 0 : Math.min(Math.abs(span) / n, padAngle)
  const signedPad = span < 0 ? -pad : pad
  const total = amounts.reduce((a, b) => a + b, 0)
  const k = total > 0 ? (span - n * signedPad) / total : 0

  const order = amounts.map((_, i) => i)
  if (sort === 'descending')
    order.sort((a, b) => (amounts[b] as number) - (amounts[a] as number) || a - b)

  const slices: PieSlice<T>[] = Array.from({ length: n })
  let angle = startAngle
  order.forEach((i, rank) => {
    const value = amounts[i] as number
    // 最后一个扇区直接收到终止角，累加误差不会让一圈差一点闭不上
    const next = rank === n - 1 ? startAngle + span : angle + value * k + signedPad
    slices[i] = { data: values[i] as T, index: i, value, startAngle: angle, endAngle: next, padAngle: pad }
    angle = next
  })
  return slices
}

export interface FoldOptions<T> {
  readonly value: (d: T, i: number) => number | null | undefined
  /** 最多保留几个扇区（含「其他」）；超出时从小到大并入「其他」。 */
  readonly maxSlices?: number
  /** 占比低于它（0–1）的扇区并入「其他」。 */
  readonly minShare?: number
}

export interface FoldResult<T> {
  /** 保留的条目，保持输入顺序。 */
  readonly kept: T[]
  /** 并入「其他」的条目，保持输入顺序，供提示框列出。 */
  readonly folded: T[]
  /** 「其他」的合计；没有并入任何条目时为 0。 */
  readonly otherValue: number
}

/** 把尾部的小扇区并成「其他」：并入的条目原样保留，调用方据此生成「其他」扇区与提示框内容。 */
export function foldSmall<T>(values: readonly T[], options: FoldOptions<T>): FoldResult<T> {
  const { maxSlices = Number.POSITIVE_INFINITY, minShare = 0 } = options
  if (!(maxSlices >= 2))
    throw invalidArgument('maxSlices 至少为 2（一个保留扇区加「其他」）', { maxSlices })
  if (!(minShare >= 0 && minShare < 1))
    throw invalidArgument('minShare 必须在 [0, 1) 内', { minShare })
  const amounts = values.map((d, i) => {
    const v = options.value(d, i)
    if (isPresent(v) && v < 0)
      throw new VizError('XH_VIZ_NEGATIVE_SHARE', '饼图的值不能为负', { index: i, value: v })
    return isPresent(v) ? v : 0
  })
  const total = amounts.reduce((a, b) => a + b, 0)
  const fold = new Set<number>()
  amounts.forEach((v, i) => {
    if (total > 0 && v / total < minShare)
      fold.add(i)
  })
  const ranked = amounts.map((_, i) => i).filter(i => !fold.has(i)).sort((a, b) => (amounts[b] as number) - (amounts[a] as number) || a - b)
  if (ranked.length + (fold.size > 0 ? 1 : 0) > maxSlices) {
    for (const i of ranked.slice(maxSlices - 1))
      fold.add(i)
  }
  // 只并入一个条目没有意义：「其他」只有一项时保留它本身
  if (fold.size === 1)
    fold.clear()
  const kept: T[] = []
  const folded: T[] = []
  let otherValue = 0
  values.forEach((d, i) => {
    if (fold.has(i)) {
      folded.push(d)
      otherValue += amounts[i] as number
    }
    else {
      kept.push(d)
    }
  })
  return { kept, folded, otherValue }
}
