/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 多键稳定排序：每个键各有方向与缺失值位置。

import type { CollateOptions } from './mixed'
import { compareMixed, isMissing } from './mixed'

/** 排序方向。 */
export type SortDirection = 'asc' | 'desc'

/** 缺失值排在最前还是最后，与方向无关。 */
export type NullsPosition = 'first' | 'last'

/** 一个排序键。 */
export interface SortKey<T> {
  /** 从项上取用来比较的值。 */
  readonly value: (item: T) => unknown
  /** 缺省 asc。 */
  readonly direction?: SortDirection
  /** 缺省 last。 */
  readonly nulls?: NullsPosition
}

function compareByKey(a: unknown, b: unknown, direction: SortDirection | undefined, nulls: NullsPosition | undefined, options: CollateOptions): number {
  const am = isMissing(a)
  const bm = isMissing(b)
  if (am || bm) {
    if (am === bm)
      return 0
    return (am ? 1 : -1) * (nulls === 'first' ? -1 : 1)
  }
  const order = compareMixed(a, b, options)
  return direction === 'desc' ? -order : order
}

/**
 * 按多个键排序，返回新数组，不改原数组。比较用 `compareMixed`；
 * 缺失值按 nulls 排在最前或最后，与方向无关；全部键都相等的项保持原有次序。
 * 每项的键值只取一次。
 */
export function sortBy<T>(items: Iterable<T>, keys: readonly SortKey<T>[], options: CollateOptions = {}): T[] {
  const list = Array.from(items)
  if (keys.length === 0)
    return list
  const decorated = list.map((item, index) => ({ item, index, values: keys.map(key => key.value(item)) }))
  decorated.sort((a, b) => {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]!
      const order = compareByKey(a.values[i], b.values[i], key.direction, key.nulls, options)
      if (order !== 0)
        return order
    }
    return a.index - b.index
  })
  return decorated.map(entry => entry.item)
}
