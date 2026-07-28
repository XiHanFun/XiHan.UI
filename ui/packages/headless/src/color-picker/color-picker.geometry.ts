import type { Direction } from '@xihan-ui/core'
import { clamp } from '../shared/number'

/**
 * 指针坐标 ↔ 区域比例的换算。整块是纯函数：矩形由调用方在事件发生的那一刻量好传进来，
 * 这里不碰 DOM、不认识状态机。
 *
 * 只有一个方向上的坑：rtl 下横轴与值的方向是反的（取色区的饱和度、通道滑杆的值都跟着掉头）。
 * 竖轴与文字方向无关，恒是"屏幕向下 = 比例增大"，明度由调用方自己取补数。
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
 * 矩形被压成 0 宽/高（还没布局、或整个浮层还带着 hidden）时该轴返回 0：
 * 除以 0 会得到 NaN，一路写进 aria-valuenow 与定位百分比。
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

/**
 * 比例 → 百分数串。留两位小数：拖动时比例是连续的，
 * 不截断会拼出 33.33333333333333% 这种尾巴，两个适配器的内联样式串也就对不上了。
 */
export function colorPickerPercent(ratio: number): string {
  const safe = Number.isFinite(ratio) ? clamp(ratio, 0, 1) : 0
  return `${Math.round(safe * 10000) / 100}%`
}
