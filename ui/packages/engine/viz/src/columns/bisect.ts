/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 有序数值列上的二分：拾取、按窗口取可见区间都靠它，一次 O(log n)。

/** 升序列在 [lo, hi) 里第一个不小于 value 的下标；都小于时为 hi。 */
export function bisectLeft(column: ArrayLike<number>, value: number, lo = 0, hi = column.length): number {
  let a = Math.max(0, lo)
  let b = Math.min(column.length, hi)
  while (a < b) {
    const mid = (a + b) >>> 1
    if ((column[mid] as number) < value)
      a = mid + 1
    else
      b = mid
  }
  return a
}

/** 升序列在 [lo, hi) 里第一个大于 value 的下标；都不大于时为 hi。 */
export function bisectRight(column: ArrayLike<number>, value: number, lo = 0, hi = column.length): number {
  let a = Math.max(0, lo)
  let b = Math.min(column.length, hi)
  while (a < b) {
    const mid = (a + b) >>> 1
    if ((column[mid] as number) <= value)
      a = mid + 1
    else
      b = mid
  }
  return a
}

/** 升序列在 [lo, hi) 里离 value 最近的下标；距离相同取靠前的；区间为空时为 −1。 */
export function nearestIndex(column: ArrayLike<number>, value: number, lo = 0, hi = column.length): number {
  const a = Math.max(0, lo)
  const b = Math.min(column.length, hi)
  if (a >= b || Number.isNaN(value))
    return -1
  const i = bisectLeft(column, value, a, b)
  if (i <= a)
    return a
  if (i >= b)
    return b - 1
  return value - (column[i - 1] as number) <= (column[i] as number) - value ? i - 1 : i
}

/** [from, to) 是否不减；遇到 NaN 算不是。 */
export function isAscending(column: ArrayLike<number>, from = 0, to = column.length): boolean {
  const a = Math.max(0, from)
  const b = Math.min(column.length, to)
  for (let i = a; i < b; i++) {
    const v = column[i] as number
    if (Number.isNaN(v) || (i > a && v < (column[i - 1] as number)))
      return false
  }
  return true
}
