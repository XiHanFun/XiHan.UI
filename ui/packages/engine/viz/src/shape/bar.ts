/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 圆角柱：只在远离基线的一端做圆角，基线端保持直角；负值柱的圆角在下端（横向柱在左端）。

import type { Rect } from '../geometry'
import type { PathSink } from '../path'
import { invalidArgument } from '../errors'
import { createSvgPath } from '../path'

export interface RoundedBarOptions {
  /** 期望的圆角半径；夹到 min(radius, 厚度 / 2, 长度)。 */
  readonly radius: number
  /** vertical 柱沿 y 生长，horizontal 柱沿 x 生长。 */
  readonly orientation: 'vertical' | 'horizontal'
  /**
   * 基线在矩形的哪一端。start：y 小的一端（纵向，负值柱从基线向下）或 x 小的一端（横向，正值柱从左向右）；
   * end：y 大的一端（纵向正值柱）或 x 大的一端（横向负值柱）。圆角落在另一端。
   */
  readonly baseline: 'start' | 'end'
}

function drawBar(rect: Rect, options: RoundedBarOptions, sink: PathSink): void {
  for (const [name, value] of Object.entries(rect)) {
    if (!Number.isFinite(value))
      throw invalidArgument(`柱的 ${name} 必须是有限数`, { [name]: value })
  }
  if (!(options.radius >= 0))
    throw invalidArgument('圆角半径不能为负', { radius: options.radius })
  // 宽高为负时换成正的等价矩形
  const x = Math.min(rect.x, rect.x + rect.width)
  const y = Math.min(rect.y, rect.y + rect.height)
  const w = Math.abs(rect.width)
  const h = Math.abs(rect.height)
  if (w === 0 || h === 0)
    return
  const vertical = options.orientation === 'vertical'
  const thickness = vertical ? w : h
  const length = vertical ? h : w
  const r = Math.min(options.radius, thickness / 2, length)
  const right = x + w
  const bottom = y + h

  if (r === 0) {
    sink.rect(x, y, w, h)
    return
  }
  // 顺时针从左上起；圆角所在的两个角用 arcTo
  const round = vertical
    ? (options.baseline === 'end' ? 'top' : 'bottom')
    : (options.baseline === 'start' ? 'right' : 'left')
  sink.moveTo(x + (round === 'top' || round === 'left' ? r : 0), y)
  if (round === 'top' || round === 'right') {
    sink.arcTo(right, y, right, y + r, r)
  }
  else {
    sink.lineTo(right, y)
  }
  if (round === 'bottom' || round === 'right') {
    sink.arcTo(right, bottom, right - r, bottom, r)
  }
  else {
    sink.lineTo(right, bottom)
  }
  if (round === 'bottom' || round === 'left') {
    sink.arcTo(x, bottom, x, bottom - r, r)
  }
  else {
    sink.lineTo(x, bottom)
  }
  if (round === 'top' || round === 'left')
    sink.arcTo(x, y, x + r, y, r)
  sink.closePath()
}

/** 圆角柱路径。长度或厚度为 0 时不画。不传 sink 返回 SVG 路径字符串，传入 sink 时直接写入。 */
export function roundedBar(rect: Rect, options: RoundedBarOptions): string
export function roundedBar(rect: Rect, options: RoundedBarOptions, sink: PathSink): void
export function roundedBar(rect: Rect, options: RoundedBarOptions, sink?: PathSink): string | void {
  if (sink) {
    drawBar(rect, options, sink)
    return
  }
  const path = createSvgPath()
  drawBar(rect, options, path)
  return path.toString()
}
