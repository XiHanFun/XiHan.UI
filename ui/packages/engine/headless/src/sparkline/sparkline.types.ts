/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 sparkline 类型契约。

/** 形态：line 折线（缺省），area 折线下铺一层淡洗，bar 柱，win-loss 盈亏（只看正负，柱等高）。 */
export type SparklineVariant = 'line' | 'area' | 'bar' | 'win-loss'

/** 插值：linear 折线（缺省），monotone 平滑且不越过数据点。 */
export type SparklineCurve = 'linear' | 'monotone'

/** 标记点：last 末点（缺省），extremes 末点之外再标最高与最低点，none 不标。 */
export type SparklineMarkers = 'none' | 'last' | 'extremes'

/** 标记指的是哪个数据：末点、最高点、最低点。 */
export type SparklineMarkerKind = 'last' | 'max' | 'min'

/** 参考线：一个固定值（目标、阈值），或按数据算出的均值 / 中位数。 */
export type SparklineReference = number | 'mean' | 'median'

/** 摘要模型：摘要模板拿到的全部事实，数字已按 locale 写好。 */
export interface SparklineSummary {
  readonly variant: SparklineVariant
  /** 有值的点数；缺失不计。 */
  readonly count: number
  readonly min: string | null
  readonly max: string | null
  readonly first: string | null
  readonly last: string | null
  /** 首末变化率的大小（百分数，不带正负号）；首值为 0 或不足两个值时为 null。 */
  readonly change: string | null
  /** 末值相对首值的走向；不足两个值时为 null。 */
  readonly direction: 'up' | 'down' | 'flat' | null
  /** 正值、负值与 0 的个数：盈亏形态按它们汇报。 */
  readonly wins: number
  readonly losses: number
  readonly ties: number
  /** 参考线的值；没有参考线时为 null。 */
  readonly reference: string | null
}

export interface SparklineTranslations {
  /** 摘要：根的 aria-describedby 指向它。 */
  summary: (model: SparklineSummary) => string
}
