/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 量的刻画：分段色带、目标刻度、量程刻度与仪表盘的指针。只在 meter 语义下生效。
// 位置一律先换成占满值的比例 0–1：线形据此按百分比落位，环形再换成 100×100 viewBox 里的弧长、角度与坐标。

import type { ProgressRing } from './progress.geometry'
import type { ProgressBand, ProgressScaleOptions, ProgressThreshold, ProgressTick } from './progress.types'
import { DIAGNOSTIC_CODES } from '@xihan-ui/core'
import { scaleLinear } from '@xihan-ui/viz'
import { PROGRESS_VIEW } from './progress.geometry'

/** 刻度数量的缺省提示。 */
const DEFAULT_TICKS = 5

/** 环形的刻度线从弧的内沿往里退这么多再起笔（viewBox 单位），长这么多。 */
const TICK_INSET = 1.5
const TICK_LENGTH = 4

/** 刻度值的中心再往里退这么多：留出刻度值半个字宽的地方。 */
const LABEL_INSET = 7

/** 指针的根部半宽与环心圆点的半径（viewBox 单位）。 */
const NEEDLE_HALF = 1.5
const HUB_RADIUS = 4

export interface ProgressMeterIssue {
  readonly code: string
  readonly level: 'error' | 'warn'
  readonly message: string
  readonly detail?: Readonly<Record<string, unknown>>
}

/** 环形上的一个点：viewBox 坐标。 */
interface ViewPoint {
  readonly x: number
  readonly y: number
}

/** 环形上的一段线：viewBox 坐标。 */
export interface ProgressSegment {
  readonly x1: number
  readonly y1: number
  readonly x2: number
  readonly y2: number
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

/** 弧上占满值比例 f 处的角度（度）：从起笔处顺时针走过弧长的 f。 */
export function ringAngle(ring: ProgressRing, gapDegree: number, f: number): number {
  return ring.rotation + f * (360 - gapDegree)
}

function polar(angle: number, radius: number): ViewPoint {
  const rad = (angle * Math.PI) / 180
  return { x: round(PROGRESS_VIEW / 2 + radius * Math.cos(rad)), y: round(PROGRESS_VIEW / 2 + radius * Math.sin(rad)) }
}

/** 分段：核上界升序、落在 (0, max] 内，换成比例。不合法时整组不画。 */
export function progressBands(
  thresholds: readonly ProgressThreshold[] | undefined,
  max: number,
  issues: ProgressMeterIssue[],
): ProgressBand[] {
  if (!thresholds || thresholds.length === 0)
    return []
  let previous = 0
  for (const [i, t] of thresholds.entries()) {
    if (!Number.isFinite(t.value) || t.value <= previous || t.value > max) {
      issues.push({
        code: DIAGNOSTIC_CODES.chartInvalidRange,
        level: 'error',
        message: '分段的上界要升序排列，且落在 (0, max] 内',
        detail: { index: i, value: t.value, previous, max },
      })
      return []
    }
    previous = t.value
  }
  let from = 0
  return thresholds.map((t, i) => {
    const band: ProgressBand = { key: `band:${i}`, from: from / max, to: t.value / max, tone: t.tone, label: t.label ?? null }
    from = t.value
    return band
  })
}

/** 当前值落在哪一段：第一段含 0，其余每段含上界、不含下界；超出最后一段的上界时不在任何一段里。 */
export function activeBand(bands: readonly ProgressBand[], ratio: number): ProgressBand | null {
  return bands.find((band, i) => (i === 0 ? ratio <= band.to : ratio > band.from && ratio <= band.to)) ?? null
}

/** 目标值：核在 [0, max] 内，换成比例。 */
export function progressTarget(target: number | undefined, max: number, issues: ProgressMeterIssue[]): number | null {
  if (target == null)
    return null
  if (!Number.isFinite(target) || target < 0 || target > max) {
    issues.push({ code: DIAGNOSTIC_CODES.chartInvalidRange, level: 'error', message: '目标值要落在 [0, max] 内', detail: { target, max } })
    return null
  }
  return target / max
}

/** 量程刻度：从 0 到满值取好读的步长，刻度值按 locale 与数字格式写好。 */
export function progressTicks(scale: boolean | ProgressScaleOptions | undefined, max: number, locale: string): ProgressTick[] {
  if (!scale)
    return []
  const options = scale === true ? {} : scale
  const count = options.ticks ?? DEFAULT_TICKS
  const linear = scaleLinear({ domain: [0, max], range: [0, 1] })
  const format = linear.tickFormat(locale, count, options.format)
  return linear.ticks(count).map(value => ({ key: `tick:${value}`, value, at: value / max, label: format(value) }))
}

/** 环形上一段色带的虚线：弧长上从 from 起、长 to − from。 */
export function ringBandDash(ring: ProgressRing, band: ProgressBand): { dasharray: string, dashoffset: string } {
  const start = ring.span * band.from
  const length = ring.span * (band.to - band.from)
  return { dasharray: `${round(length)} ${ring.circumference}`, dashoffset: String(round(-start)) }
}

/** 环形的刻度线：从弧的内沿往里退一点起笔，朝圆心画一小段。 */
export function ringTickLine(ring: ProgressRing, strokeWidth: number, gapDegree: number, at: number): ProgressSegment {
  const angle = ringAngle(ring, gapDegree, at)
  const inner = ring.radius - strokeWidth / 2 - TICK_INSET
  const a = polar(angle, inner)
  const b = polar(angle, inner - TICK_LENGTH)
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y }
}

/** 环形刻度值的中心：再往圆心退半个字宽，按占整个环盒的百分比给出。 */
export function ringLabelPoint(ring: ProgressRing, strokeWidth: number, gapDegree: number, at: number): ViewPoint {
  const angle = ringAngle(ring, gapDegree, at)
  return polar(angle, ring.radius - strokeWidth / 2 - TICK_INSET - TICK_LENGTH - LABEL_INSET)
}

/** 环形的目标刻度：横穿整条弧，内外各探出一点。 */
export function ringTargetLine(ring: ProgressRing, strokeWidth: number, gapDegree: number, at: number): ProgressSegment {
  const angle = ringAngle(ring, gapDegree, at)
  const a = polar(angle, ring.radius - strokeWidth / 2 - TICK_INSET)
  const b = polar(angle, Math.min(PROGRESS_VIEW / 2, ring.radius + strokeWidth / 2))
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y }
}

/**
 * 仪表盘的指针：朝 3 点钟画好，由样式按角度转过去，数值变化时指针转动而不是跳。
 * 形状是一个从环心收尖的三角加一个环心圆点，尖端停在刻度线的内侧。
 */
export function ringNeedlePath(ring: ProgressRing, strokeWidth: number): string {
  const c = PROGRESS_VIEW / 2
  const tip = c + ring.radius - strokeWidth / 2 - TICK_INSET - TICK_LENGTH
  return `M${c} ${c - NEEDLE_HALF}L${round(tip)} ${c}L${c} ${c + NEEDLE_HALF}Z`
    + `M${c - HUB_RADIUS} ${c}a${HUB_RADIUS} ${HUB_RADIUS} 0 1 0 ${HUB_RADIUS * 2} 0a${HUB_RADIUS} ${HUB_RADIUS} 0 1 0 ${-HUB_RADIUS * 2} 0Z`
}

/** 缺省的分段读屏文字：「72%, Warning」。 */
export function defaultSegmentValueText(details: { value: string, label: string }): string {
  return `${details.value}, ${details.label}`
}
