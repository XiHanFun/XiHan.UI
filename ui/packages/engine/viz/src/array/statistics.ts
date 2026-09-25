/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 数组统计：极值、补偿求和、均值、R-7 分位数、Welford 方差、累计和与等差数列。缺失值一律跳过。

import { invalidArgument } from '../errors'

/** 从数据项取数值；返回 null、undefined 或 NaN 表示该项缺失。 */
export type NumericAccessor<T> = (d: T, i: number) => number | null | undefined

/** 缺失值（null、undefined、NaN）不参与统计；Infinity 是合法数值。 */
export function isPresent(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

/** 逐项取出存在的数值。没有取值函数时数据项本身就是数值。 */
export function presentValues<T>(values: Iterable<T>, accessor?: NumericAccessor<T>): number[] {
  const out: number[] = []
  let i = 0
  for (const item of values) {
    const value = accessor ? accessor(item, i) : item
    i++
    if (isPresent(value))
      out.push(value)
  }
  return out
}

/** 最小值与最大值；没有存在的数值时为 undefined。 */
export function extent(values: Iterable<number | null | undefined>): [number, number] | undefined
export function extent<T>(values: Iterable<T>, accessor: NumericAccessor<T>): [number, number] | undefined
export function extent<T>(values: Iterable<T>, accessor?: NumericAccessor<T>): [number, number] | undefined {
  let min = Number.NaN
  let max = Number.NaN
  let i = 0
  for (const item of values) {
    const value = accessor ? accessor(item, i) : item
    i++
    if (!isPresent(value))
      continue
    if (Number.isNaN(min)) {
      min = value
      max = value
      continue
    }
    if (value < min)
      min = value
    if (value > max)
      max = value
  }
  return Number.isNaN(min) ? undefined : [min, max]
}

/**
 * Neumaier 补偿求和的累加器：大数与小数交替相加时不丢低位，`0.1` 加十次得到 `1`。
 * 出现 Infinity 时补偿项会变成 NaN，此时退回朴素和。
 */
export class CompensatedSum {
  private total = 0
  private compensation = 0
  private naive = 0

  add(value: number): void {
    this.naive += value
    const next = this.total + value
    if (Math.abs(this.total) >= Math.abs(value))
      this.compensation += (this.total - next) + value
    else
      this.compensation += (value - next) + this.total
    this.total = next
  }

  valueOf(): number {
    return Number.isFinite(this.naive) ? this.total + this.compensation : this.naive
  }
}

/** 存在数值之和（Neumaier 补偿）；没有存在的数值时为 0。 */
export function sum(values: Iterable<number | null | undefined>): number
export function sum<T>(values: Iterable<T>, accessor: NumericAccessor<T>): number
export function sum<T>(values: Iterable<T>, accessor?: NumericAccessor<T>): number {
  const adder = new CompensatedSum()
  let i = 0
  for (const item of values) {
    const value = accessor ? accessor(item, i) : item
    i++
    if (isPresent(value))
      adder.add(value)
  }
  return adder.valueOf()
}

/** 算术平均；没有存在的数值时为 undefined。 */
export function mean(values: Iterable<number | null | undefined>): number | undefined
export function mean<T>(values: Iterable<T>, accessor: NumericAccessor<T>): number | undefined
export function mean<T>(values: Iterable<T>, accessor?: NumericAccessor<T>): number | undefined {
  const adder = new CompensatedSum()
  let count = 0
  let i = 0
  for (const item of values) {
    const value = accessor ? accessor(item, i) : item
    i++
    if (!isPresent(value))
      continue
    adder.add(value)
    count++
  }
  return count === 0 ? undefined : adder.valueOf() / count
}

/** 在已升序的数组上按 R-7 取分位数（与 Excel QUANTILE.INC、NumPy 缺省一致）。 */
export function quantileSorted(sorted: readonly number[], p: number): number | undefined {
  if (!(p >= 0 && p <= 1))
    throw invalidArgument('分位数的 p 必须在 [0, 1] 内', { p })
  const n = sorted.length
  if (n === 0)
    return undefined
  const h = (n - 1) * p
  const lo = Math.floor(h)
  const low = sorted[lo] as number
  if (lo >= n - 1)
    return low
  const high = sorted[lo + 1] as number
  return low + (high - low) * (h - lo)
}

/** 第 p 分位数（R-7）；没有存在的数值时为 undefined。 */
export function quantile(values: Iterable<number | null | undefined>, p: number): number | undefined
export function quantile<T>(values: Iterable<T>, p: number, accessor: NumericAccessor<T>): number | undefined
export function quantile<T>(values: Iterable<T>, p: number, accessor?: NumericAccessor<T>): number | undefined {
  const sorted = presentValues(values, accessor).sort((a, b) => a - b)
  return quantileSorted(sorted, p)
}

/** 中位数，即 0.5 分位数。 */
export function median(values: Iterable<number | null | undefined>): number | undefined
export function median<T>(values: Iterable<T>, accessor: NumericAccessor<T>): number | undefined
export function median<T>(values: Iterable<T>, accessor?: NumericAccessor<T>): number | undefined {
  const sorted = presentValues(values, accessor).sort((a, b) => a - b)
  return quantileSorted(sorted, 0.5)
}

/** 样本方差（分母 n − 1，Welford 单遍）；存在的数值少于 2 个时为 undefined。 */
export function variance(values: Iterable<number | null | undefined>): number | undefined
export function variance<T>(values: Iterable<T>, accessor: NumericAccessor<T>): number | undefined
export function variance<T>(values: Iterable<T>, accessor?: NumericAccessor<T>): number | undefined {
  let count = 0
  let runningMean = 0
  let squares = 0
  let i = 0
  for (const item of values) {
    const value = accessor ? accessor(item, i) : item
    i++
    if (!isPresent(value))
      continue
    count++
    const delta = value - runningMean
    runningMean += delta / count
    squares += delta * (value - runningMean)
  }
  return count > 1 ? squares / (count - 1) : undefined
}

/** 样本标准差，即样本方差的平方根。 */
export function deviation(values: Iterable<number | null | undefined>): number | undefined
export function deviation<T>(values: Iterable<T>, accessor: NumericAccessor<T>): number | undefined
export function deviation<T>(values: Iterable<T>, accessor?: NumericAccessor<T>): number | undefined {
  const v = accessor ? variance(values, accessor) : variance(values as Iterable<number | null | undefined>)
  return v === undefined ? undefined : Math.sqrt(v)
}

/** 逐项累计和；缺失项不增加累计值，位置上沿用前一项的累计。 */
export function cumsum(values: Iterable<number | null | undefined>): Float64Array
export function cumsum<T>(values: Iterable<T>, accessor: NumericAccessor<T>): Float64Array
export function cumsum<T>(values: Iterable<T>, accessor?: NumericAccessor<T>): Float64Array {
  const items = Array.from(values)
  const out = new Float64Array(items.length)
  const adder = new CompensatedSum()
  items.forEach((item, i) => {
    const value = accessor ? accessor(item, i) : item
    if (isPresent(value))
      adder.add(value)
    out[i] = adder.valueOf()
  })
  return out
}

/** 等差数列 [start, stop)：`range(stop)` 或 `range(start, stop, step)`，按整数下标生成，不做浮点累加。 */
export function range(stop: number): number[]
export function range(start: number, stop: number, step?: number): number[]
export function range(a: number, b?: number, step = 1): number[] {
  const [start, stop] = b === undefined ? [0, a] : [a, b]
  if (!Number.isFinite(start) || !Number.isFinite(stop) || !Number.isFinite(step) || step === 0)
    throw invalidArgument('range 的起止与步长必须是有限数，步长不能为 0', { start, stop, step })
  const n = Math.max(0, Math.ceil((stop - start) / step))
  const out: number[] = Array.from({ length: n })
  for (let i = 0; i < n; i++)
    out[i] = start + i * step
  return out
}
