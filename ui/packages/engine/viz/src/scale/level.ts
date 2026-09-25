/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 分档比例尺：quantize 等宽分档、quantile 等量分档、threshold 按给定分界分档；输出档位序号。

import type { LevelScale } from './types'
import { isPresent, quantileSorted } from '../array/statistics'
import { invalidArgument } from '../errors'

/** 不大于 value 的分界有几个，即 value 落在第几档。 */
function levelOf(thresholds: readonly number[], value: number): number {
  let low = 0
  let high = thresholds.length
  while (low < high) {
    const mid = (low + high) >>> 1
    if ((thresholds[mid] as number) <= value)
      low = mid + 1
    else
      high = mid
  }
  return low
}

function checkLevels(levels: number): void {
  if (!Number.isInteger(levels) || levels < 1)
    throw invalidArgument('档位数必须是正整数', { levels })
}

function createLevel(kind: LevelScale['kind'], domain: readonly number[], thresholds: readonly number[], low: number, high: number): LevelScale {
  const levels = thresholds.length + 1
  const frozenThresholds = Object.freeze(thresholds.slice())
  const scale: LevelScale = {
    kind,
    domain: Object.freeze(domain.slice()),
    range: Object.freeze(Array.from({ length: levels }, (_, i) => i)),
    map: value => (isPresent(value) ? levelOf(frozenThresholds, value) : undefined),
    thresholds: () => frozenThresholds.slice(),
    invertExtent(level: number): [number, number] {
      if (!Number.isInteger(level) || level < 0 || level >= levels)
        throw invalidArgument('档位序号越界', { level, levels })
      return [level === 0 ? low : frozenThresholds[level - 1] as number, level === levels - 1 ? high : frozenThresholds[level] as number]
    },
  }
  return Object.freeze(scale)
}

export interface QuantizeScaleOptions {
  /** [小, 大]，缺省 [0, 1]。 */
  readonly domain?: readonly number[]
  /** 档位数，缺省 2。 */
  readonly levels?: number
}

/** 等宽分档：把 [小, 大] 均分成 levels 档。 */
export function scaleQuantize(options: QuantizeScaleOptions = {}): LevelScale {
  const domain = options.domain ?? [0, 1]
  const levels = options.levels ?? 2
  checkLevels(levels)
  const [a, b] = domain
  if (domain.length !== 2 || !Number.isFinite(a) || !Number.isFinite(b) || (a as number) > (b as number))
    throw invalidArgument('等宽分档的定义域必须是 [小, 大] 两个有限数', { domain })
  const thresholds = Array.from({ length: levels - 1 }, (_, i) => (a as number) + (((b as number) - (a as number)) * (i + 1)) / levels)
  return createLevel('quantize', domain, thresholds, a as number, b as number)
}

export interface QuantileScaleOptions {
  /** 样本值；缺失值被跳过。 */
  readonly domain: readonly (number | null | undefined)[]
  /** 档位数，缺省 4（四分位）。 */
  readonly levels?: number
}

/** 等量分档：按样本的分位数（R-7）分界，每档的样本数大致相等。 */
export function scaleQuantile(options: QuantileScaleOptions): LevelScale {
  const levels = options.levels ?? 4
  checkLevels(levels)
  const sorted = options.domain.filter(isPresent).sort((x, y) => x - y)
  if (sorted.length === 0)
    throw invalidArgument('等量分档至少需要一个样本值', { domain: options.domain })
  const thresholds = Array.from({ length: levels - 1 }, (_, i) => quantileSorted(sorted, (i + 1) / levels) as number)
  return createLevel('quantile', sorted, thresholds, sorted[0] as number, sorted[sorted.length - 1] as number)
}

export interface ThresholdScaleOptions {
  /** 严格递增的分界值；n 个分界得到 n + 1 档。 */
  readonly thresholds: readonly number[]
}

/** 按给定分界分档：小于第一个分界为第 0 档，不小于最后一个分界为最后一档。 */
export function scaleThreshold(options: ThresholdScaleOptions): LevelScale {
  const { thresholds } = options
  for (let i = 0; i < thresholds.length; i++) {
    const t = thresholds[i] as number
    if (!Number.isFinite(t) || (i > 0 && t <= (thresholds[i - 1] as number)))
      throw invalidArgument('分界值必须是严格递增的有限数', { thresholds })
  }
  return createLevel('threshold', thresholds, thresholds, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
}
