/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 shared/chart 模块的公共接口：各图表组件共用的内核。

export { labelBox, placeWithoutOverlap, settleColumn } from './labels'
export type { ChartLabelBox } from './labels'
export {
  chartActiveSource,
  chartBaseActions,
  chartBaseContext,
  chartBaseRefs,
  chartBaseTransitions,
  notifyChartActive,
  sameChartDatum,
  sameChartKey,
  trackChartViewport,
} from './machine-base'
export type { ChartBaseAction, ChartBaseComputed, ChartBaseContext, ChartBaseEvent, ChartBaseProps, ChartBaseRefs, ChartBaseSchema, ChartBaseTransition, ChartOffset } from './machine-base'
export { CHART_ESTIMATING_MEASURER, createCanvasMeasurer } from './measure'
export { memoizeLast } from './memo'
export { CHART_METRIC_SLOTS, CHART_METRICS, readChartMetrics, sameChartMetrics } from './metrics'
export { chartNavIntentFromKey, chartPageSize } from './nav'
export type { ChartNavIntent, ChartNavKeyEventLike, ChartNavLayout } from './nav'
export { assignChartSeries, CHART_SLOT_COUNT } from './series'
export type { ChartSeriesAssignment, ChartSeriesIdentity, ChartSeriesIdentityInput, ChartSpecIssue } from './series'
export { buildChartSummary } from './summary'
export type { ChartSummaryFormat } from './summary'
export { placeChartTooltip } from './tooltip'
export type { ChartTipPlacement } from './tooltip'
export { CHART_ANIMATION_MARK_LIMIT } from './transition'
export type { ChartFrame, ChartNumbers, ChartTransitionOptions } from './transition'
export { CHART_TRANSLATIONS, defaultChartDatumLabel, defaultChartSummary, resolveChartTranslations } from './translations'
export type {
  ChartA11yModel,
  ChartActiveKeyChangeDetails,
  ChartActiveSource,
  ChartCommonProps,
  ChartDatumDetails,
  ChartDatumRef,
  ChartHiddenSeriesChangeDetails,
  ChartHover,
  ChartKey,
  ChartMark,
  ChartMetrics,
  ChartRow,
  ChartSize,
  ChartSummary,
  ChartSummaryPoint,
  ChartSummarySeries,
  ChartTranslations,
} from './types'
