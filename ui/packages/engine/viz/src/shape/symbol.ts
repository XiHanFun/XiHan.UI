/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 符号：以面积为尺寸，不同形状视觉等重；符号次序与色槽对齐，作为区分系列的非颜色通道。圆心在原点。

import type { Point } from '../geometry'
import type { PathSink } from '../path'
import { invalidArgument } from '../errors'
import { createSvgPath } from '../path'

/** 第 N 个色槽对应第 N 个符号。 */
export const SYMBOL_NAMES = Object.freeze(['circle', 'square', 'diamond', 'triangle', 'triangleDown', 'cross', 'star', 'wye'] as const)

export type SymbolName = typeof SYMBOL_NAMES[number]

function polygon(sink: PathSink, points: readonly Point[]): void {
  points.forEach(([x, y], i) => {
    if (i === 0)
      sink.moveTo(x, y)
    else
      sink.lineTo(x, y)
  })
  sink.closePath()
}

/** 五角星：内外顶点半径之比取正五角星的比例；面积 = 5 · R² · ratio · sin(π/5)。 */
const STAR_RATIO = Math.sin(Math.PI / 10) / Math.sin((7 * Math.PI) / 10)
/** Y 形：中心是边长 w 的正三角形，三条臂是 w × w 的方块；面积 = w² · (3 + √3/4)。 */
const WYE_AREA = 3 + Math.sqrt(3) / 4

function drawSymbol(type: SymbolName, size: number, sink: PathSink): void {
  switch (type) {
    case 'circle': {
      const r = Math.sqrt(size / Math.PI)
      sink.moveTo(r, 0)
      sink.arc(0, 0, r, 0, 2 * Math.PI)
      sink.closePath()
      return
    }
    case 'square': {
      const h = Math.sqrt(size) / 2
      polygon(sink, [[-h, -h], [h, -h], [h, h], [-h, h]])
      return
    }
    case 'diamond': {
      // 高是宽的 √3 倍的菱形：面积 = 2 · x · y
      const y = Math.sqrt(size / (2 / Math.sqrt(3)))
      const x = y / Math.sqrt(3)
      polygon(sink, [[0, -y], [x, 0], [0, y], [-x, 0]])
      return
    }
    case 'triangle':
    case 'triangleDown': {
      // 等边三角形，重心在原点
      const side = Math.sqrt((4 * size) / Math.sqrt(3))
      const height = (Math.sqrt(3) / 2) * side
      const k = type === 'triangle' ? 1 : -1
      polygon(sink, [[0, (-2 * height * k) / 3], [side / 2, (height * k) / 3], [-side / 2, (height * k) / 3]])
      return
    }
    case 'cross': {
      // 五个边长 2a 的方块拼成的十字
      const a = Math.sqrt(size / 5) / 2
      polygon(sink, [
        [-3 * a, -a],
        [-a, -a],
        [-a, -3 * a],
        [a, -3 * a],
        [a, -a],
        [3 * a, -a],
        [3 * a, a],
        [a, a],
        [a, 3 * a],
        [-a, 3 * a],
        [-a, a],
        [-3 * a, a],
      ])
      return
    }
    case 'star': {
      const outer = Math.sqrt(size / (5 * STAR_RATIO * Math.sin(Math.PI / 5)))
      const inner = outer * STAR_RATIO
      const points: Point[] = []
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outer : inner
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        points.push([r * Math.cos(angle), r * Math.sin(angle)])
      }
      polygon(sink, points)
      return
    }
    case 'wye': {
      const w = Math.sqrt(size / WYE_AREA)
      const hub = w / (2 * Math.sqrt(3))
      const points: Point[] = []
      // 三条臂朝下、左上、右上
      for (const angle of [Math.PI / 2, (7 * Math.PI) / 6, (11 * Math.PI) / 6]) {
        const ax = Math.cos(angle)
        const ay = Math.sin(angle)
        const px = -ay
        const py = ax
        points.push(
          [hub * ax - (w / 2) * px, hub * ay - (w / 2) * py],
          [(hub + w) * ax - (w / 2) * px, (hub + w) * ay - (w / 2) * py],
          [(hub + w) * ax + (w / 2) * px, (hub + w) * ay + (w / 2) * py],
        )
      }
      polygon(sink, points)
      return
    }
    default:
      throw invalidArgument('未知的符号', { type })
  }
}

/** 符号路径：size 为面积（px²）。不传 sink 返回 SVG 路径字符串，传入 sink 时直接写入。 */
export function symbol(type: SymbolName, size: number): string
export function symbol(type: SymbolName, size: number, sink: PathSink): void
export function symbol(type: SymbolName, size: number, sink?: PathSink): string | void {
  if (!(size >= 0) || !Number.isFinite(size))
    throw invalidArgument('符号面积必须是非负有限数', { size })
  if (sink) {
    drawSymbol(type, size, sink)
    return
  }
  const path = createSvgPath()
  drawSymbol(type, size, path)
  return path.toString()
}
