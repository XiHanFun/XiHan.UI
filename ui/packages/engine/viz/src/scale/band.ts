/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 类目比例尺：band 把每个类目映射到一条带的起点；point 用同一套步长，把类目映射到带中心，柱线组合时点正落在柱中间。

import type { BandScale, CategoryKey, OrdinalScale } from './types'
import { invalidArgument, VizError } from '../errors'

export interface BandScaleOptions<K extends CategoryKey> {
  readonly domain?: readonly K[]
  /** [起点, 终点]，缺省 [0, 1]；终点小于起点时第一个类目靠近起点。 */
  readonly range?: readonly [number, number]
  /** 带与带之间的留白占步长的比例，[0, 1]，缺省 0。 */
  readonly paddingInner?: number
  /** 首尾两侧的留白，以步长为单位，≥ 0，缺省 0。 */
  readonly paddingOuter?: number
  /** 多余空间的分配：0 全推到末端，1 全推到始端，缺省 0.5 居中。 */
  readonly align?: number
  /** 步长、起点与带宽取整到整像素。缺省 false。 */
  readonly round?: boolean
}

/** 键到位置的索引；重复的键抛 `XH_VIZ_DUPLICATE_KEY`。 */
function indexKeys<K extends CategoryKey>(domain: readonly K[]): Map<K, number> {
  const index = new Map<K, number>()
  domain.forEach((key, i) => {
    const first = index.get(key)
    if (first !== undefined)
      throw new VizError('XH_VIZ_DUPLICATE_KEY', '类目定义域里有重复的键', { key, first, duplicate: i })
    index.set(key, i)
  })
  return index
}

function unit(name: string, value: number, max: number): number {
  if (!(value >= 0 && value <= max))
    throw invalidArgument(`${name} 必须在 [0, ${max}] 内`, { [name]: value })
  return value
}

function createBand<K extends CategoryKey>(kind: 'band' | 'point', options: BandScaleOptions<K>): BandScale<K> {
  const domain = Object.freeze((options.domain ?? []).slice())
  const range = Object.freeze((options.range ?? [0, 1]).slice()) as readonly [number, number]
  const [r0, r1] = range
  if (range.length !== 2 || !Number.isFinite(r0) || !Number.isFinite(r1))
    throw invalidArgument('类目比例尺的值域必须是 [起点, 终点] 两个有限数', { range })
  const paddingInner = unit('paddingInner', options.paddingInner ?? 0, 1)
  const paddingOuter = unit('paddingOuter', options.paddingOuter ?? 0, Number.POSITIVE_INFINITY)
  const align = unit('align', options.align ?? 0.5, 1)
  const round = options.round ?? false
  const index = indexKeys(domain)

  const n = domain.length
  const reverse = r1 < r0
  let start = reverse ? r1 : r0
  const stop = reverse ? r0 : r1
  let step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2)
  if (round)
    step = Math.floor(step)
  start += (stop - start - step * (n - paddingInner)) * align
  let bandwidth = step * (1 - paddingInner)
  if (round) {
    start = Math.round(start)
    bandwidth = Math.round(bandwidth)
  }
  // 第 i 个类目在升序像素上的位置；值域反向时第一个类目靠近起点
  const slotOf = (i: number): number => (reverse ? n - 1 - i : i)
  const offset = kind === 'point' ? bandwidth / 2 : 0

  const scale: BandScale<K> = {
    kind,
    domain,
    range,
    bandwidth: kind === 'point' ? 0 : bandwidth,
    step,
    index: key => index.get(key) ?? -1,
    map(key: K): number | undefined {
      const i = index.get(key)
      return i === undefined ? undefined : start + step * slotOf(i) + offset
    },
    invert(pixel: number): K | undefined {
      if (n === 0 || !(step > 0) || !Number.isFinite(pixel))
        return undefined
      // 格子以带中心为中点、宽一个 step
      const firstCenter = start + bandwidth / 2
      const slot = Math.floor((pixel - (firstCenter - step / 2)) / step)
      if (slot < 0 || slot >= n)
        return undefined
      return domain[slotOf(slot)]
    },
  }
  return Object.freeze(scale)
}

/** 带状类目比例尺：map 返回带的起点，bandwidth 是带宽。 */
export function scaleBand<K extends CategoryKey = string>(options: BandScaleOptions<K> = {}): BandScale<K> {
  return createBand('band', options)
}

/**
 * 点状类目比例尺：与同参数的 band 共用步长，map 返回带中心，bandwidth 为 0。
 * 柱与折线共用一根类目轴时两者传同样的参数，折线的点正落在柱的中线上。
 */
export function scalePoint<K extends CategoryKey = string>(options: BandScaleOptions<K> = {}): BandScale<K> {
  return createBand('point', options)
}

export interface OrdinalScaleOptions<K extends CategoryKey, R> {
  /** 必须显式给出；map 不会把没见过的键追加进来。 */
  readonly domain: readonly K[]
  /** 与定义域逐项对应；比定义域短时报错，不循环复用。 */
  readonly range: readonly R[]
}

/**
 * 序数比例尺：第 i 个键映射到第 i 个值（系列 → 色槽、符号）。
 * 定义域必须显式给出，没见过的键返回 undefined，颜色不会随数据出现的先后漂移。
 */
export function scaleOrdinal<K extends CategoryKey, R>(options: OrdinalScaleOptions<K, R>): OrdinalScale<K, R> {
  const domain = Object.freeze(options.domain.slice())
  const range = Object.freeze(options.range.slice())
  if (range.length < domain.length)
    throw invalidArgument('序数比例尺的值域比定义域短；不循环复用值', { domain, range })
  const index = indexKeys(domain)
  const scale: OrdinalScale<K, R> = {
    kind: 'ordinal',
    domain,
    range,
    map(key: K): R | undefined {
      const i = index.get(key)
      return i === undefined ? undefined : range[i]
    },
  }
  return Object.freeze(scale)
}
