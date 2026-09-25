/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 scale 模块的公共接口。

export { scaleBand, scaleOrdinal, scalePoint } from './band'
export type { BandScaleOptions, OrdinalScaleOptions } from './band'
export { scaleDiverging, scaleLinear, scaleLog, scalePow, scaleSequential, scaleSqrt, scaleSymlog } from './continuous'
export type {
  ContinuousScaleOptions,
  DivergingScaleOptions,
  LogScaleOptions,
  PositionTransform,
  PowScaleOptions,
  SequentialScaleOptions,
  SymlogScaleOptions,
} from './continuous'
export { inferDomain } from './domain'
export type { DomainOptions } from './domain'
export { scaleQuantile, scaleQuantize, scaleThreshold } from './level'
export type { QuantileScaleOptions, QuantizeScaleOptions, ThresholdScaleOptions } from './level'
export { scaleTime, scaleUtc } from './time'
export type { TimeScaleOptions } from './time'
export type {
  BandScale,
  CategoryKey,
  ContinuousScale,
  LevelScale,
  OrdinalScale,
  PositionScale,
  ScaleBase,
  ScaleKind,
  TimeScale,
} from './types'
