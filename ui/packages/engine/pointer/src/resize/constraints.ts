// 尺寸约束：夹取、宽高比、吸附步进。
import type { ResizeConstraints } from './types'

export interface Size {
  width: number
  height: number
}

/**
 * 把尺寸夹进上下限。
 *
 * 先夹上限、后夹下限：上限写得比下限还小时以下限为准——尺寸不能是负的，
 * 而「至少多大」比「至多多大」更硬。
 */
export function clampSize(size: Size, c?: ResizeConstraints): Size {
  const minW = Math.max(0, finite(c?.minWidth ?? 0))
  const minH = Math.max(0, finite(c?.minHeight ?? 0))
  const maxW = upper(c?.maxWidth)
  const maxH = upper(c?.maxHeight)
  return {
    width: Math.max(minW, Math.min(maxW, finite(size.width))),
    height: Math.max(minH, Math.min(maxH, finite(size.height))),
  }
}

/**
 * 按宽高比补齐另一轴。
 *
 * `axis` 说的是哪一轴是主导：`width` 时由宽算高，`height` 时由高算宽。
 * 比例不是正数就原样返回——0 与负数算出来的另一轴没有意义。
 */
export function applyAspectRatio(size: Size, ratio: number | undefined, axis: 'width' | 'height'): Size {
  if (ratio == null || !Number.isFinite(ratio) || ratio <= 0)
    return size
  return axis === 'width'
    ? { width: size.width, height: size.width / ratio }
    : { width: size.height * ratio, height: size.height }
}

/** 宽高各自吸附到 step 的整数倍。step 不是正数就原样返回。 */
export function snapSize(size: Size, step: number | undefined): Size {
  if (step == null || !Number.isFinite(step) || step <= 0)
    return size
  return {
    width: Math.round(finite(size.width) / step) * step,
    height: Math.round(finite(size.height) / step) * step,
  }
}

function upper(value: number | undefined): number {
  return value != null && Number.isFinite(value) ? value : Number.POSITIVE_INFINITY
}

function finite(value: number): number {
  return Number.isFinite(value) ? value : 0
}
