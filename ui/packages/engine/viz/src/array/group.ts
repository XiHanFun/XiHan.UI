/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 分组、归约与唯一索引；Date 键按时间值归并。

import { VizError } from '../errors'

/** 分组用的归一键：Date 按 valueOf 归并，其余原样比较。 */
function internKey(key: unknown): unknown {
  return key instanceof Date ? key.valueOf() : key
}

/**
 * 按键分组，组的次序是键首次出现的次序。
 * 值相等的 Date 键归入同一组，结果里的键是首次出现的那个实例。
 */
export function group<T, K>(values: Iterable<T>, key: (d: T, i: number) => K): Map<K, T[]> {
  const buckets = new Map<unknown, { key: K, items: T[] }>()
  let i = 0
  for (const item of values) {
    const k = key(item, i)
    i++
    const interned = internKey(k)
    const bucket = buckets.get(interned)
    if (bucket)
      bucket.items.push(item)
    else
      buckets.set(interned, { key: k, items: [item] })
  }
  const out = new Map<K, T[]>()
  for (const bucket of buckets.values())
    out.set(bucket.key, bucket.items)
  return out
}

/** 先按键分组，再把每组归约成一个值。 */
export function rollup<T, K, R>(values: Iterable<T>, reduce: (items: T[]) => R, key: (d: T, i: number) => K): Map<K, R> {
  const out = new Map<K, R>()
  for (const [k, items] of group(values, key))
    out.set(k, reduce(items))
  return out
}

/** 按唯一键建索引；两项键相同时抛 `XH_VIZ_DUPLICATE_KEY`。 */
export function index<T, K>(values: Iterable<T>, key: (d: T, i: number) => K): Map<K, T> {
  const out = new Map<K, T>()
  const seen = new Map<unknown, number>()
  let i = 0
  for (const item of values) {
    const k = key(item, i)
    const interned = internKey(k)
    const first = seen.get(interned)
    if (first !== undefined)
      throw new VizError('XH_VIZ_DUPLICATE_KEY', '索引键重复', { key: k, first, duplicate: i })
    seen.set(interned, i)
    out.set(k, item)
    i++
  }
  return out
}
