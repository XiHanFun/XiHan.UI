import type { Direction, Orientation } from '@xihan-ui/kernel'
import { clamp, snapDecimals } from '../shared/number'

/**
 * 值 ↔ 轨道坐标的换算，纯函数：矩形由调用方在事件发生那一刻量好传入，不碰 DOM。
 * 竖直轨道屏幕坐标向下增大而值向上增大，RTL 水平轨道同样反向，统一由 isInverted 判定。
 */

export interface TrackRect {
  x: number
  y: number
  width: number
  height: number
}

export interface AxisOptions {
  orientation?: Orientation
  dir?: Direction
}

/** 屏幕坐标增大 = 值减小？竖直轨道恒是（自上而下），水平轨道只在 RTL 下是。 */
function isInverted(o: AxisOptions): boolean {
  return o.orientation === 'vertical' || o.dir === 'rtl'
}

/** 值在区间里的位置，0-1。min === max 时退化为 0，不产生 NaN。 */
export function valueToPercent(value: number, min: number, max: number): number {
  if (max === min)
    return 0
  return clamp((value - min) / (max - min), 0, 1)
}

/** 百分比换回值，并对齐到 step 网格。 */
export function percentToValue(percent: number, min: number, max: number, step: number): number {
  const raw = min + clamp(percent, 0, 1) * (max - min)
  return snapToStep(raw, min, max, step)
}

/**
 * 对齐到以 min 为原点的 step 网格。
 * 以 min 而不是 0 为原点：min=5 step=10 时刻度该是 5/15/25，不是 0/10/20。
 */
export function snapToStep(value: number, min: number, max: number, step: number): number {
  if (step <= 0)
    return clamp(value, min, max)
  const steps = Math.round((value - min) / step)
  return clamp(snapDecimals(min + steps * step, step, min), min, max)
}

/** 指针坐标 → 值。矩形由调用方现量，这里只算。 */
export function pointToValue(
  point: { clientX: number, clientY: number },
  rect: TrackRect,
  o: AxisOptions & { min: number, max: number, step: number },
): number {
  const vertical = o.orientation === 'vertical'
  const size = vertical ? rect.height : rect.width
  // 轨道被压成 0 宽/高时不猜，原样返回下界；除以 0 会得到 NaN 并写进 aria-valuenow
  if (size <= 0)
    return o.min
  const offset = vertical ? point.clientY - rect.y : point.clientX - rect.x
  const raw = offset / size
  const percent = isInverted(o) ? 1 - raw : raw
  return percentToValue(percent, o.min, o.max, o.step)
}

/**
 * 多个滑块时，第 index 个能走到的范围：不许越过左右邻居。
 * minStepsBetweenThumbs 给的是"最少隔几格"，换算成值再让位。
 */
export function thumbBounds(
  values: readonly number[],
  index: number,
  o: { min: number, max: number, step: number, minStepsBetweenThumbs?: number },
): { min: number, max: number } {
  const gap = (o.minStepsBetweenThumbs ?? 0) * o.step
  const lower = index > 0 ? values[index - 1]! + gap : o.min
  const upper = index < values.length - 1 ? values[index + 1]! - gap : o.max
  // 邻居挤在一起时上下界可能反过来；此时这个滑块只剩一个落点，别返回一个空区间
  return upper < lower ? { min: lower, max: lower } : { min: lower, max: upper }
}

/** 刻度值收口：夹进区间、升序去重。 */
export function normalizeMarkValues(marks: ReadonlyArray<{ value: number }>, min: number, max: number): number[] {
  return [...new Set(marks.map(mark => mark.value).filter(v => v >= min && v <= max))].sort((a, b) => a - b)
}

/** 吸到最近刻度；刻度表为空原样返回，并列取先遇到的那档。 */
export function snapToMarkValues(value: number, markValues: readonly number[]): number {
  let best = value
  let bestDist = Number.POSITIVE_INFINITY
  for (const v of markValues) {
    const dist = Math.abs(v - value)
    if (dist < bestDist) {
      bestDist = dist
      best = v
    }
  }
  return markValues.length > 0 ? best : value
}

/** 沿方向取下一档刻度；已在尽头原地不动。 */
export function stepMarkValue(current: number, direction: 1 | -1, markValues: readonly number[]): number {
  if (markValues.length === 0)
    return current
  if (direction === 1) {
    for (const v of markValues) {
      if (v > current)
        return v
    }
    return current
  }
  for (let i = markValues.length - 1; i >= 0; i--) {
    if (markValues[i]! < current)
      return markValues[i]!
  }
  return current
}

/** 把第 index 个滑块挪到 next，夹在邻居之间；返回新的整组值（原数组不动）。 */
export function setThumbValue(
  values: readonly number[],
  index: number,
  next: number,
  o: { min: number, max: number, step: number, minStepsBetweenThumbs?: number, markValues?: readonly number[] },
): number[] {
  const bounds = thumbBounds(values, index, o)
  // 先吸 step 网格，再吸刻度（只认刻度落点的形态），最后让位给邻居
  const stepped = snapToStep(next, o.min, o.max, o.step)
  const marked = o.markValues?.length ? snapToMarkValues(stepped, o.markValues) : stepped
  const snapped = clamp(marked, bounds.min, bounds.max)
  const out = [...values]
  out[index] = snapped
  return out
}

/** 指针落点离哪个滑块最近；并列时取靠后的那个，好让用户能把重叠的两个拉开。 */
export function closestThumb(values: readonly number[], target: number): number {
  let best = 0
  let bestDist = Number.POSITIVE_INFINITY
  for (let i = 0; i < values.length; i++) {
    const dist = Math.abs(values[i]! - target)
    if (dist <= bestDist) {
      bestDist = dist
      best = i
    }
  }
  return best
}

/** 已选区间在轨道上的起止百分比。单滑块时从 origin（默认 min）画到当前值。 */
export function rangeExtent(
  values: readonly number[],
  o: { min: number, max: number },
): { start: number, end: number } {
  if (values.length === 0)
    return { start: 0, end: 0 }
  if (values.length === 1)
    return { start: 0, end: valueToPercent(values[0]!, o.min, o.max) }
  const sorted = [...values].sort((a, b) => a - b)
  return {
    start: valueToPercent(sorted[0]!, o.min, o.max),
    end: valueToPercent(sorted[sorted.length - 1]!, o.min, o.max),
  }
}
