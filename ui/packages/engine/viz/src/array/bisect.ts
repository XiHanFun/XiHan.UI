/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/** 可比较的键：数值、字符串、日期（日期按 valueOf 比较）。 */
export type Comparable = number | string | Date

/** 升序比较；两者不可比（含 NaN）时返回 NaN。 */
export function ascending(a: Comparable, b: Comparable): number {
  const x = a instanceof Date ? a.valueOf() : a
  const y = b instanceof Date ? b.valueOf() : b
  if (x < y)
    return -1
  if (x > y)
    return 1
  return x === y ? 0 : Number.NaN
}

/** 在按键升序排列的数组里二分查找；`lo` / `hi` 限定查找区间 [lo, hi)。 */
export type Bisect<T, K> = (array: readonly T[], target: K, lo?: number, hi?: number) => number

export interface Bisector<T, K> {
  /** 第一个键不小于 target 的位置（插入 target 后它排在相等者之前）。 */
  readonly left: Bisect<T, K>
  /** 第一个键大于 target 的位置（插入 target 后它排在相等者之后）。 */
  readonly right: Bisect<T, K>
  /** 键离 target 最近的位置；距离相等取前一个。只对数值与日期键有意义。 */
  readonly center: Bisect<T, K>
}

/** 按 key 取键的二分查找器。数组必须已按同一个键升序排列。 */
export function bisector<T, K extends Comparable>(key: (d: T) => K): Bisector<T, K> {
  function left(array: readonly T[], target: K, lo = 0, hi = array.length): number {
    let low = lo
    let high = hi
    while (low < high) {
      const mid = (low + high) >>> 1
      if (ascending(key(array[mid] as T), target) < 0)
        low = mid + 1
      else
        high = mid
    }
    return low
  }

  function right(array: readonly T[], target: K, lo = 0, hi = array.length): number {
    let low = lo
    let high = hi
    while (low < high) {
      const mid = (low + high) >>> 1
      if (ascending(key(array[mid] as T), target) <= 0)
        low = mid + 1
      else
        high = mid
    }
    return low
  }

  function center(array: readonly T[], target: K, lo = 0, hi = array.length): number {
    const i = left(array, target, lo, hi)
    if (i <= lo)
      return lo
    if (i >= hi)
      return hi - 1
    const t = Number(target instanceof Date ? target.valueOf() : target)
    const before = Number(key(array[i - 1] as T).valueOf())
    const after = Number(key(array[i] as T).valueOf())
    return t - before <= after - t ? i - 1 : i
  }

  return Object.freeze({ left, right, center })
}
