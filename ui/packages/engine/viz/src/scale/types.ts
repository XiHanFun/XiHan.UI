/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 比例尺的公共契约：全部不可变，「修改」返回新的比例尺。

import type { NumberFormatSpec } from '../format/number'
import type { TimeInterval, TimeIntervalName } from '../time/interval'

export type ScaleKind
  = | 'linear'
    | 'pow'
    | 'sqrt'
    | 'log'
    | 'symlog'
    | 'time'
    | 'utc'
    | 'sequential'
    | 'diverging'
    | 'quantize'
    | 'quantile'
    | 'threshold'
    | 'ordinal'
    | 'band'
    | 'point'

export interface ScaleBase<D, R> {
  readonly kind: ScaleKind
  readonly domain: readonly D[]
  readonly range: readonly R[]
  /** 定义域外且未钳制时按两端的线段外推；缺失值或未知的键返回 undefined。 */
  readonly map: (value: D) => R | undefined
}

/** 数值 → 数值的连续比例尺。定义域与值域可以分段（`[0, 50, 100] → [a, b, c]`）。 */
export interface ContinuousScale extends ScaleBase<number, number> {
  readonly kind: 'linear' | 'pow' | 'sqrt' | 'log' | 'symlog' | 'sequential' | 'diverging'
  readonly clamp: boolean
  /** 像素 → 定义域值；钳制时先把像素钳到值域内。值域不单调时无法反查，抛错。 */
  readonly invert: (pixel: number) => number
  /** 约 count 个刻度，缺省 10。 */
  readonly ticks: (count?: number) => number[]
  /** 与 ticks(count) 配套的标签格式。 */
  readonly tickFormat: (locale: string, count?: number, spec?: NumberFormatSpec) => (value: number) => string
  /** 两端取整到刻度上的新比例尺；原比例尺不变。 */
  readonly nice: (count?: number) => ContinuousScale
}

/** 颜色编码用的位置比例尺：输出色阶位置 t ∈ [0, 1]（发散以 0.5 为中点），始终钳制；颜色由样式在令牌之间插值。 */
export interface PositionScale extends ContinuousScale {
  readonly kind: 'sequential' | 'diverging'
}

/** 日期 → 数值的时间比例尺；刻度与取整按日历推进。 */
export interface TimeScale extends ScaleBase<Date, number> {
  readonly kind: 'time' | 'utc'
  readonly clamp: boolean
  readonly invert: (pixel: number) => Date
  /** 约 count 个刻度（缺省 10），或给定间隔上的全部边界。 */
  readonly ticks: (countOrInterval?: number | TimeInterval) => Date[]
  /** 多尺度刻度标签：日期落在更粗一级的边界上时显示那一级。给间隔名时按该粒度格式化。 */
  readonly tickFormat: (locale: string, countOrName?: number | TimeIntervalName) => (value: Date) => string
  readonly nice: (countOrInterval?: number | TimeInterval) => TimeScale
}

/** 分档比例尺：输出档位序号 0…n−1。 */
export interface LevelScale extends ScaleBase<number, number> {
  readonly kind: 'quantize' | 'quantile' | 'threshold'
  /** 档位之间的分界值，共 n − 1 个。 */
  readonly thresholds: () => number[]
  /** 第 level 档覆盖的取值区间 [下界, 上界)。 */
  readonly invertExtent: (level: number) => [number, number]
}

/** 类目键。 */
export type CategoryKey = string | number

/** 类目 → 带的起点。每个类目占一条带，带与带之间按内外边距留白。 */
export interface BandScale<K extends CategoryKey = string> extends ScaleBase<K, number> {
  readonly kind: 'band' | 'point'
  /** 带宽；point 为 0。 */
  readonly bandwidth: number
  /** 相邻两带起点之间的距离。 */
  readonly step: number
  /** 键在定义域里的位置；未知的键为 −1。 */
  readonly index: (key: K) => number
  /** 像素落在哪个类目的格子里（格子以带中心为中点、宽一个 step）；落在所有格子之外为 undefined。 */
  readonly invert: (pixel: number) => K | undefined
}

/** 类目 → 离散值（色槽、符号）。 */
export interface OrdinalScale<K extends CategoryKey, R> extends ScaleBase<K, R> {
  readonly kind: 'ordinal'
}
