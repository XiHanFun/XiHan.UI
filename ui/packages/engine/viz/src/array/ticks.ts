/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 刻度：步长取 1、2、5 × 10 的幂，刻度值由整数下标算出；nice 把区间两端取整到刻度上。

import { invalidArgument } from '../errors'

const E10 = Math.sqrt(50)
const E5 = Math.sqrt(10)
const E2 = Math.sqrt(2)

/**
 * 刻度的整数表示：第 i 个刻度是 `i × inc`（inc > 0），或 `i / −inc`（inc < 0，即步长小于 1 时用倒数）。
 * 刻度值由整数下标一次算出，不做浮点累加，不会出现 0.30000000000000004。
 */
interface TickSpec {
  readonly i1: number
  readonly i2: number
  readonly inc: number
}

/** 要求 start < stop 且 count > 0。 */
function tickSpec(start: number, stop: number, count: number): TickSpec {
  const step0 = (stop - start) / count
  const power = Math.floor(Math.log10(step0))
  const error = step0 / 10 ** power
  const factor = error >= E10 ? 10 : error >= E5 ? 5 : error >= E2 ? 2 : 1
  let i1: number
  let i2: number
  let inc: number
  if (power < 0) {
    const inverse = 10 ** -power / factor
    i1 = Math.round(start * inverse)
    i2 = Math.round(stop * inverse)
    if (i1 / inverse < start)
      i1++
    if (i2 / inverse > stop)
      i2--
    inc = -inverse
  }
  else {
    inc = 10 ** power * factor
    i1 = Math.round(start / inc)
    i2 = Math.round(stop / inc)
    if (i1 * inc < start)
      i1++
    if (i2 * inc > stop)
      i2--
  }
  // 区间窄到一个刻度都落不进来、而调用方只要一两个刻度时，把步长减半再试一次
  if (i2 < i1 && count >= 0.5 && count < 2)
    return tickSpec(start, stop, count * 2)
  return { i1, i2, inc }
}

/** 第 i 个刻度的值（整数表示见 TickSpec）；-0 归一成 0，刻度与取整后的端点可以直接比较。 */
function tickAt(i: number, inc: number): number {
  const value = inc < 0 ? i / -inc : i * inc
  return value === 0 ? 0 : value
}

function assertFinite(start: number, stop: number, count: number): void {
  if (!Number.isFinite(start) || !Number.isFinite(stop))
    throw invalidArgument('刻度区间的两端必须是有限数', { start, stop })
  if (Number.isNaN(count) || count === Number.POSITIVE_INFINITY)
    throw invalidArgument('刻度数量必须是有限数', { count })
}

/**
 * 在 [start, stop] 内取约 count 个「好看」的刻度（步长为 1、2、5 × 10 的幂）。
 * start > stop 时刻度按降序返回；count ≤ 0 时没有刻度。
 */
export function ticks(start: number, stop: number, count: number): number[] {
  assertFinite(start, stop, count)
  if (!(count > 0))
    return []
  if (start === stop)
    return [start]
  const reverse = stop < start
  const { i1, i2, inc } = reverse ? tickSpec(stop, start, count) : tickSpec(start, stop, count)
  if (!(i2 >= i1))
    return []
  const n = i2 - i1 + 1
  const out: number[] = Array.from({ length: n })
  for (let k = 0; k < n; k++) {
    out[k] = tickAt(reverse ? i2 - k : i1 + k, inc)
  }
  return out
}

/**
 * 刻度步长的整数表示：正数就是步长；负数 −n 表示步长为 1/n。
 * 两端相等或 count ≤ 0 时为 0。
 */
export function tickIncrement(start: number, stop: number, count: number): number {
  assertFinite(start, stop, count)
  if (!(count > 0) || start === stop)
    return 0
  const [low, high] = start < stop ? [start, stop] : [stop, start]
  return tickSpec(low, high, count).inc
}

/** 刻度步长（带符号：start > stop 时为负）；两端相等或 count ≤ 0 时为 0。 */
export function tickStep(start: number, stop: number, count: number): number {
  const inc = tickIncrement(start, stop, count)
  if (inc === 0)
    return 0
  const step = inc < 0 ? 1 / -inc : inc
  return stop < start ? -step : step
}

/**
 * 不大于 x 的最大刻度。先取最近的整数下标再按真实刻度值校正：
 * 直接 floor(x × 200) 会因 0.07 × 200 = 14.000000000000002 而多跨一格。
 */
function tickFloor(x: number, inc: number): number {
  const i = Math.round(inc < 0 ? x * -inc : x / inc)
  const at = tickAt(i, inc)
  return at <= x ? at : tickAt(i - 1, inc)
}

/** 不小于 x 的最小刻度，校正方式同 tickFloor。 */
function tickCeil(x: number, inc: number): number {
  const i = Math.round(inc < 0 ? x * -inc : x / inc)
  const at = tickAt(i, inc)
  return at >= x ? at : tickAt(i + 1, inc)
}

/**
 * 把区间两端向外取整到刻度步长上，使两端本身就是刻度。
 * 取整会改变跨度、跨度又会改变步长，所以重复到步长不再变化（至多 10 轮）。
 * 只要一两个刻度又跨过 0 的区间不会收敛：每轮取整都让跨度翻倍、步长随之变大。
 * 10 轮仍未收敛时退回第一轮的结果，两端是原步长上的刻度，区间不会被越推越大。
 * 结果区间总是包含原区间；start > stop 时按原方向返回。
 */
export function nice(start: number, stop: number, count: number): [number, number] {
  assertFinite(start, stop, count)
  const reverse = stop < start
  let low = reverse ? stop : start
  let high = reverse ? start : stop
  let previous: number | undefined
  let first: [number, number] | undefined
  let converged = false
  for (let round = 0; round < 10; round++) {
    const inc = tickIncrement(low, high, count)
    if (inc === 0 || inc === previous) {
      converged = true
      break
    }
    low = tickFloor(low, inc)
    high = tickCeil(high, inc)
    first ??= [low, high]
    previous = inc
  }
  if (!converged && first)
    [low, high] = first
  return reverse ? [high, low] : [low, high]
}
