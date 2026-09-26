/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 图表几何度量：缺省值与令牌同值，挂载后从根的计算样式读取皮肤投影的私有槽。

import type { ChartMetrics } from './types'

/**
 * 缺省度量，逐项与令牌同值（柱厚上限 `--xh-chart-bar-max`、间隙 `--xh-chart-gap`……，
 * 圆角取 `--xh-shape-inset`，字号取 `--xh-text-caption-size`、行高取 `--xh-leading-tight`）。服务端与读不到计算样式时用它；
 * 单测拿令牌生成物逐项核对，令牌改了这里没跟上就判红。
 */
export const CHART_METRICS: ChartMetrics = Object.freeze({
  barMax: 24,
  gap: 2,
  lineWidth: 2,
  pointSize: 8,
  hitMin: 24,
  tickLength: 4,
  labelGap: 4,
  radius: 4,
  font: Object.freeze({ family: 'sans-serif', size: 12, weight: 400, lineHeight: 15 }),
})

/** 皮肤在根上投影的度量私有槽：值由组件槽回落到 `--xh-chart-*` 令牌。 */
export const CHART_METRIC_SLOTS = Object.freeze({
  barMax: '--xh-_chart-metric-bar-max',
  gap: '--xh-_chart-metric-gap',
  lineWidth: '--xh-_chart-metric-line-width',
  pointSize: '--xh-_chart-metric-point-size',
  hitMin: '--xh-_chart-metric-hit-min',
  tickLength: '--xh-_chart-metric-tick-length',
  labelGap: '--xh-_chart-metric-label-gap',
  radius: '--xh-_chart-metric-radius',
  fontSize: '--xh-_chart-metric-font-size',
  leading: '--xh-_chart-metric-leading',
})

type LengthKey = 'barMax' | 'gap' | 'lineWidth' | 'pointSize' | 'hitMin' | 'tickLength' | 'labelGap' | 'radius'

const LENGTH_KEYS: readonly LengthKey[] = ['barMax', 'gap', 'lineWidth', 'pointSize', 'hitMin', 'tickLength', 'labelGap', 'radius']

/**
 * 自定义属性的计算值是代入 var() 之后的原文，单位保持作者写的样子：
 * px 直接取，rem 按根字号、em 按元素字号换算；读不懂的写法（calc、百分比）返回 null，由调用方退回缺省。
 */
function toPx(raw: string, rootSize: number, ownSize: number): number | null {
  const hit = /^(-?(?:\d+(?:\.\d+)?|\.\d+))(px|rem|em)?$/.exec(raw.trim())
  if (!hit)
    return null
  const value = Number(hit[1])
  const unit = hit[2] ?? 'px'
  const px = unit === 'rem' ? value * rootSize : unit === 'em' ? value * ownSize : value
  return Number.isFinite(px) && px >= 0 ? px : null
}

/** CSS 的初始字号 medium。 */
const MEDIUM = 16

/** 计算样式里的字号（px）；读不到时按初始字号，rem 与 em 才换算得对。 */
function fontSizeOf(style: CSSStyleDeclaration | null): number {
  const parsed = Number.parseFloat(style?.fontSize ?? '')
  return Number.isFinite(parsed) && parsed > 0 ? parsed : MEDIUM
}

/**
 * 从元素的计算样式读取度量。元素一般是根：皮肤把私有槽写在根上，缩进它的部件都继承到。
 * 某一项读不到或写法读不懂时取缺省值，不让一处覆盖写错拖垮整张图的布局。
 */
export function readChartMetrics(el: Element): ChartMetrics {
  const view = el.ownerDocument?.defaultView
  if (typeof view?.getComputedStyle !== 'function')
    return CHART_METRICS
  const style = view.getComputedStyle(el)
  const rootEl = el.ownerDocument.documentElement
  const rootSize = fontSizeOf(rootEl ? view.getComputedStyle(rootEl) : null)
  const ownSize = fontSizeOf(style)
  const read = (slot: string): number | null => {
    const raw = style.getPropertyValue(slot)
    return raw ? toPx(raw, rootSize, ownSize) : null
  }
  const lengths = {} as Record<LengthKey, number>
  for (const key of LENGTH_KEYS)
    lengths[key] = read(CHART_METRIC_SLOTS[key]) ?? CHART_METRICS[key]
  const size = read(CHART_METRIC_SLOTS.fontSize) ?? CHART_METRICS.font.size
  const leading = Number.parseFloat(style.getPropertyValue(CHART_METRIC_SLOTS.leading))
  const weight = Number.parseInt(style.fontWeight, 10)
  return {
    ...lengths,
    font: {
      family: style.fontFamily || CHART_METRICS.font.family,
      size,
      weight: Number.isFinite(weight) ? weight : CHART_METRICS.font.weight,
      lineHeight: Number.isFinite(leading) && leading > 0 ? size * leading : CHART_METRICS.font.lineHeight * (size / CHART_METRICS.font.size),
    },
  }
}

/** 两份度量是否逐项相同；相同就不必重排。 */
export function sameChartMetrics(a: ChartMetrics, b: ChartMetrics | undefined): boolean {
  if (!b)
    return false
  return LENGTH_KEYS.every(key => a[key] === b[key])
    && a.font.family === b.font.family
    && a.font.size === b.font.size
    && a.font.weight === b.font.weight
    && a.font.lineHeight === b.font.lineHeight
}
