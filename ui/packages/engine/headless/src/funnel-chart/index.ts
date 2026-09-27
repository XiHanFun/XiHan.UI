/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 funnel-chart 模块的公共接口。

export { funnelChartAnatomy } from './funnel-chart.anatomy'
export { connectFunnelChart, funnelMarkTag } from './funnel-chart.connect'
export { funnelChartKeyboard } from './funnel-chart.keyboard'
export { defaultFunnelDatumLabel, defaultFunnelSummary, FUNNEL_TRANSLATIONS } from './funnel-chart.logic'
export type { FunnelActive } from './funnel-chart.logic'
export { funnelChartMachine } from './funnel-chart.machine'
export { funnelChartMeta } from './funnel-chart.meta'
export type { FunnelModel } from './funnel-chart.model'
export type { FunnelChartApi, FunnelChartSchema, FunnelOverlay } from './funnel-chart.schema'
export type {
  FunnelAlign,
  FunnelChartTranslations,
  FunnelConversion,
  FunnelDirection,
  FunnelLabels,
  FunnelMarkTag,
  FunnelShape,
  FunnelSummary,
  FunnelTooltipModel,
  FunnelTooltipRow,
} from './funnel-chart.types'
