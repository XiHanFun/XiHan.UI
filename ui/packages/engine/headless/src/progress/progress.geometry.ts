import type { ProgressGapPosition } from './progress.types'

// 环形进度的几何：全部在一个 100×100 的 viewBox 里算，作者改直径只改 CSS 尺寸，数不用重算。

/** viewBox 的边长。半径、周长、缺口长度都以它为单位。 */
export const PROGRESS_VIEW = 100

/** 线宽的合法区间：细到画不出、粗到把圆心吃掉都不成立。 */
const STROKE_MIN = 0.5
const STROKE_MAX = 45

/** 缺口角的合法区间。留 65 度给弧本身，缺口再大就不是仪表盘了。 */
const GAP_MIN = 0
const GAP_MAX = 295

/** 起笔角：<circle> 从 3 点钟起笔顺时针走，各朝向要转过去多少度。 */
const START_ANGLE: Record<ProgressGapPosition, number> = {
  top: -90,
  right: 0,
  bottom: 90,
  left: 180,
}

export interface ProgressRing {
  /** 圆心到描边中线的半径。线宽越粗，环越往里收，外沿始终贴着 viewBox。 */
  radius: number
  /** 整个圆的周长。 */
  circumference: number
  /** 弧的长度（整周减去缺口）。dasharray 的第一段就是它。 */
  span: number
  /** 进度弧要往回缩多少：满值为 0，零值等于整段弧。 */
  offset: number
  /** 整个环要转多少度，缺口才落在 gapPosition 那一侧。 */
  rotation: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max))
}

/** 统一到 3 位小数：两个适配器产出的属性要逐字相同，浮点尾差会让快照对不上。 */
function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

/**
 * 算出一个环该怎么画。
 *
 * ratio 是 [0,1] 的进度比例；strokeWidth 走 viewBox 单位；
 * gapDegree 是缺口角（0 即整环）；gapPosition 决定缺口朝哪一侧。
 */
export function progressRing(
  ratio: number,
  strokeWidth: number,
  gapDegree: number,
  gapPosition: ProgressGapPosition,
): ProgressRing {
  const width = clamp(Number.isFinite(strokeWidth) ? strokeWidth : 6, STROKE_MIN, STROKE_MAX)
  const gap = clamp(Number.isFinite(gapDegree) ? gapDegree : 0, GAP_MIN, GAP_MAX)
  // 描边沿中线两侧各铺半个线宽，半径减掉半个才不会溢出 viewBox
  const radius = PROGRESS_VIEW / 2 - width / 2
  const circumference = 2 * Math.PI * radius
  const span = circumference * (360 - gap) / 360
  const progress = clamp(Number.isFinite(ratio) ? ratio : 0, 0, 1)
  return {
    radius: round(radius),
    circumference: round(circumference),
    span: round(span),
    offset: round(span * (1 - progress)),
    // 先转到起笔那一侧，再把缺口的一半让回去，缺口才以该侧为中心
    rotation: round(START_ANGLE[gapPosition] + gap / 2),
  }
}

/** 满值上限：非有限或不为正一律回落 100，免得算出满环或除零。 */
export function resolveMax(max: number | undefined): number {
  return Number.isFinite(max) && (max as number) > 0 ? (max as number) : 100
}

/** 当前值：非有限回落 0，再夹进 [0, max]。 */
export function resolveValue(value: number | undefined, max: number): number {
  return clamp(Number.isFinite(value) ? (value as number) : 0, 0, max)
}
