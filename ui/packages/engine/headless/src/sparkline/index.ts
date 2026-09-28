/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 sparkline 模块的公共接口。

export { sparklineAnatomy } from './sparkline.anatomy'
export { connectSparkline } from './sparkline.connect'
export { sparklineKeyboard } from './sparkline.keyboard'
export { defaultSparklineSummary, SPARKLINE_TRANSLATIONS } from './sparkline.logic'
export { sparklineMachine } from './sparkline.machine'
export { sparklineMeta } from './sparkline.meta'
export type { SparklineModel } from './sparkline.model'
export type { SparklineApi, SparklineSchema } from './sparkline.schema'
export type {
  SparklineCurve,
  SparklineMarkerKind,
  SparklineMarkers,
  SparklineReference,
  SparklineSummary,
  SparklineTranslations,
  SparklineVariant,
} from './sparkline.types'
