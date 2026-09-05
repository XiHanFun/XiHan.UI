import type { Direction } from '@xihan-ui/core'
import { clamp } from '../shared/number'

/**
 * 指针坐标 ↔ 区域比例的换算。纯函数：矩形由调用方在事件发生那一刻量好传进来。
 *
 * rtl 下横轴与值的方向相反；竖轴与文字方向无关，恒是屏幕向下比例增大，明度由调用方取补数。
 */

export interface ColorPickerRect {
  x: number
  y: number
  width: number
  height: number
}

export interface ColorPickerPoint {
  clientX: number
  clientY: number
}

/** 两条轴上的比例，都是 0-1。 */
export interface ColorPickerRatio {
  x: number
  y: number
}

/**
 * 指针落点在矩形里的比例。
 * 矩形宽/高为 0 时该轴返回 0，除以 0 会得到 NaN 并写进 aria-valuenow 与定位百分比。
 */
export function colorPickerPointRatio(
  point: ColorPickerPoint,
  rect: ColorPickerRect,
  dir?: Direction,
): ColorPickerRatio {
  const x = rect.width > 0 ? clamp((point.clientX - rect.x) / rect.width, 0, 1) : 0
  const y = rect.height > 0 ? clamp((point.clientY - rect.y) / rect.height, 0, 1) : 0
  return { x: dir === 'rtl' ? 1 - x : x, y }
}

/** 比例 → 百分数串，保留两位小数，避免两个适配器拼出的内联样式串不一致。 */
export function colorPickerPercent(ratio: number): string {
  const safe = Number.isFinite(ratio) ? clamp(ratio, 0, 1) : 0
  return `${Math.round(safe * 10000) / 100}%`
}
