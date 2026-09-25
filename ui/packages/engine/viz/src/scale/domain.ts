/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 数值定义域推断：数据极值 + 作者给定的边界 + 是否含 0 + 外扩与取整。

import { extent } from '../array/statistics'
import { nice as niceExtent } from '../array/ticks'
import { invalidArgument, VizError } from '../errors'

export interface DomainOptions {
  /** 作者固定的下界；给了就不再外扩、不再取整这一端。 */
  readonly min?: number
  /** 作者固定的上界。 */
  readonly max?: number
  /** 定义域包含 0（未被作者固定的那一端向 0 延伸）。 */
  readonly zero?: boolean
  /**
   * 这根轴上有柱系列：必须包含 0。作者把下界固定在 0 以上、或把上界固定在 0 以下时
   * 抛 `XH_VIZ_BAR_BASELINE`——截断的柱长会误导比较。
   */
  readonly bars?: boolean
  /** 额外必须包含的值（参考线、目标值）。 */
  readonly include?: readonly number[]
  /** 两端各外扩跨度的多少倍（散点留边），只作用于未被固定、且不是 0 基线的一端。 */
  readonly padding?: number
  /** 取整到刻度上：true 按 10 个刻度，数字按该刻度数。只取整未被固定的一端。 */
  readonly nice?: boolean | number
}

/**
 * 推断数值轴的定义域 [下界, 上界]。数据为空且没有任何边界时为 [0, 1]；
 * 全部数据相等时向两侧各展开该值的一半（该值为 0 时取 [0, 1]），避免零跨度。
 */
export function inferDomain(values: Iterable<number | null | undefined>, options: DomainOptions = {}): [number, number] {
  const { min, max, zero = false, bars = false, include = [], padding = 0, nice = false } = options
  for (const [name, value] of [['min', min], ['max', max]] as const) {
    if (value !== undefined && !Number.isFinite(value))
      throw invalidArgument(`${name} 必须是有限数`, { [name]: value })
  }
  if (min !== undefined && max !== undefined && min > max)
    throw invalidArgument('min 不能大于 max', { min, max })
  if (!(padding >= 0) || !Number.isFinite(padding))
    throw invalidArgument('padding 必须是非负有限数', { padding })
  if (bars && ((min !== undefined && min > 0) || (max !== undefined && max < 0)))
    throw new VizError('XH_VIZ_BAR_BASELINE', '柱系列所在的值轴必须包含 0', { min, max })

  const data = extent([...values, ...include])
  let low = min ?? data?.[0]
  let high = max ?? data?.[1]
  if (zero || bars) {
    if (min === undefined)
      low = Math.min(low ?? 0, 0)
    if (max === undefined)
      high = Math.max(high ?? 0, 0)
  }
  if (low === undefined || high === undefined) {
    // 只固定了一端而没有数据：另一端按 [0, 1] 的跨度补齐
    if (low === undefined && high === undefined)
      return [0, 1]
    low ??= (high as number) - 1
    high ??= low + 1
  }
  if (low > high)
    [low, high] = min !== undefined ? [low, low] : [high, high]

  if (low === high) {
    const half = low === 0 ? 0.5 : Math.abs(low) / 2
    if (min === undefined && !(low === 0 && (zero || bars)))
      low -= half
    if (max === undefined)
      high += low === high ? 2 * half : half
  }

  const span = high - low
  const anchoredLow = (zero || bars) && low === 0
  const anchoredHigh = (zero || bars) && high === 0
  if (padding > 0) {
    if (min === undefined && !anchoredLow)
      low -= span * padding
    if (max === undefined && !anchoredHigh)
      high += span * padding
  }

  if (nice !== false) {
    const count = nice === true ? 10 : nice
    const [a, b] = niceExtent(low, high, count)
    if (min === undefined)
      low = a
    if (max === undefined)
      high = b
  }
  return [low, high]
}
