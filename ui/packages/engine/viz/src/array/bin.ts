/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 分箱：按箱数、显式边界或 Sturges / Scott / Freedman–Diaconis 规则把数值分进相邻的箱。

import type { NumericAccessor } from './statistics'
import { invalidArgument } from '../errors'
import { deviation, isPresent, quantileSorted } from './statistics'
import { nice, ticks } from './ticks'

/** 分箱阈值：箱数、显式边界，或按数据推算箱宽的规则。 */
export type BinThresholds = number | readonly number[] | 'sturges' | 'scott' | 'freedman-diaconis'

export interface BinOptions<T> {
  /** 取每项的数值；缺失的项不进任何箱。 */
  readonly value: NumericAccessor<T>
  /** 分箱区间；缺省取数据的最小值与最大值，并按刻度步长向外取整。给定时原样使用，区间外的项被丢弃。 */
  readonly domain?: readonly [number, number]
  /** 缺省 `'sturges'`。 */
  readonly thresholds?: BinThresholds
}

/** 一个箱：箱内的数据项，外加左右边界。箱是左闭右开的，最后一个箱包含右端点。 */
export type Bin<T> = T[] & { x0: number, x1: number }

/** 按规则推算箱数。三条规则都来自数据的分布：Sturges 看个数，Scott 看标准差，Freedman–Diaconis 看四分位距。 */
function binCount(rule: 'sturges' | 'scott' | 'freedman-diaconis', sorted: readonly number[], min: number, max: number): number {
  const n = sorted.length
  if (rule === 'sturges')
    return n === 0 ? 1 : Math.ceil(Math.log2(n)) + 1
  let width: number
  if (rule === 'scott') {
    width = 3.49 * (deviation(sorted) ?? 0) * n ** (-1 / 3)
  }
  else {
    const iqr = (quantileSorted(sorted, 0.75) ?? 0) - (quantileSorted(sorted, 0.25) ?? 0)
    width = 2 * iqr * n ** (-1 / 3)
  }
  return width > 0 ? Math.max(1, Math.ceil((max - min) / width)) : 1
}

/** 返回一个分箱函数：把数据按数值分进相邻的箱，每个箱带着 [x0, x1) 边界。 */
export function bin<T>(options: BinOptions<T>): (data: Iterable<T>) => Bin<T>[] {
  const { value, domain, thresholds = 'sturges' } = options
  if (domain && (!Number.isFinite(domain[0]) || !Number.isFinite(domain[1]) || domain[0] > domain[1]))
    throw invalidArgument('分箱区间必须是有限数且 x0 ≤ x1', { domain })
  if (typeof thresholds === 'number' && !(thresholds >= 0 && Number.isFinite(thresholds)))
    throw invalidArgument('分箱数量必须是非负有限数', { thresholds })

  return (data) => {
    const items: T[] = []
    const values: number[] = []
    let i = 0
    for (const item of data) {
      const v = value(item, i)
      i++
      if (!isPresent(v))
        continue
      items.push(item)
      values.push(v)
    }
    const sorted = values.slice().sort((a, b) => a - b)
    if (!domain && sorted.length === 0)
      return []

    let x0 = domain ? domain[0] : sorted[0] as number
    let x1 = domain ? domain[1] : sorted[sorted.length - 1] as number
    let edges: number[]
    if (typeof thresholds === 'object') {
      edges = thresholds.filter(t => Number.isFinite(t)).slice().sort((a, b) => a - b)
    }
    else {
      const count = typeof thresholds === 'number' ? thresholds : binCount(thresholds, sorted, x0, x1)
      if (!domain && x0 < x1)
        [x0, x1] = nice(x0, x1, count)
      edges = x0 < x1 ? ticks(x0, x1, count) : []
    }

    const inner = edges.filter(t => t > x0 && t < x1)
    const bounds = [x0, ...inner, x1]
    const bins: Bin<T>[] = []
    for (let k = 0; k < bounds.length - 1; k++)
      bins.push(Object.assign([] as T[], { x0: bounds[k] as number, x1: bounds[k + 1] as number }))

    items.forEach((item, k) => {
      const v = values[k] as number
      if (v < x0 || v > x1)
        return
      // 落在第几个箱 = 不大于 v 的内部边界有几条
      let low = 0
      let high = inner.length
      while (low < high) {
        const mid = (low + high) >>> 1
        if ((inner[mid] as number) <= v)
          low = mid + 1
        else
          high = mid
      }
      ;(bins[low] as Bin<T>).push(item)
    })
    return bins
  }
}
