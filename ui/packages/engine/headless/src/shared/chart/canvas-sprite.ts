/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 符号的精灵图：同一种形状、大小、填充、描边环的点先画成一小块画布，逐点 drawImage 贴上去。
// 逐点先填后描、按数据次序叠放，与 SVG 一个点一个元素的叠法一致；比逐点建路径快一个数量级。
// 贴的位置对齐到设备像素，图块不被双线性插值抹糊。

import type { PathSink, SymbolName } from '@xihan-ui/viz'
import { symbol } from '@xihan-ui/viz'

interface Sprite {
  readonly canvas: HTMLCanvasElement
  /** 图块左上角相对符号中心的偏移（CSS px）。 */
  readonly left: number
  readonly top: number
  /** 图块的 CSS 尺寸。 */
  readonly width: number
  readonly height: number
}

export interface ChartSprites {
  /**
   * 在 (x, y) 贴一个符号：size 是面积（px²），fill 与 stroke 是画布认得的颜色串（null 为不画），
   * strokeWidth 是描边环宽。
   */
  readonly draw: (ctx: CanvasRenderingContext2D, shape: SymbolName, size: number, fill: string | null, stroke: string | null, strokeWidth: number, x: number, y: number, dpr: number) => void
}

/** 缓存上限：色阶按值着色的点最多有几百种颜色，满了整表清空重来。 */
const LIMIT = 1024

/** 记下路径的外接矩形：弧按圆心加减半径、曲线按控制点，宁大勿小。 */
function bounds(shape: SymbolName, size: number): { x0: number, y0: number, x1: number, y1: number } {
  let x0 = Number.POSITIVE_INFINITY
  let y0 = Number.POSITIVE_INFINITY
  let x1 = Number.NEGATIVE_INFINITY
  let y1 = Number.NEGATIVE_INFINITY
  const add = (x: number, y: number): void => {
    x0 = Math.min(x0, x)
    y0 = Math.min(y0, y)
    x1 = Math.max(x1, x)
    y1 = Math.max(y1, y)
  }
  const sink: PathSink = {
    moveTo: add,
    lineTo: add,
    bezierCurveTo: (a, b, c, d, x, y) => {
      add(a, b)
      add(c, d)
      add(x, y)
    },
    quadraticCurveTo: (a, b, x, y) => {
      add(a, b)
      add(x, y)
    },
    arc: (x, y, r) => {
      add(x - r, y - r)
      add(x + r, y + r)
    },
    arcTo: (a, b, x, y) => {
      add(a, b)
      add(x, y)
    },
    rect: (x, y, w, h) => {
      add(x, y)
      add(x + w, y + h)
    },
    closePath: () => {},
  }
  symbol(shape, size, sink)
  return Number.isFinite(x0) ? { x0, y0, x1, y1 } : { x0: 0, y0: 0, x1: 0, y1: 0 }
}

/** 建一份精灵图缓存；doc 用来建离屏画布。 */
export function createChartSprites(doc: Document): ChartSprites {
  const cache = new Map<string, Sprite | null>()

  const make = (shape: SymbolName, size: number, fill: string | null, stroke: string | null, strokeWidth: number, dpr: number): Sprite | null => {
    const box = bounds(shape, size)
    const pad = (stroke ? strokeWidth / 2 : 0) + 1
    const left = box.x0 - pad
    const top = box.y0 - pad
    const width = box.x1 - box.x0 + pad * 2
    const height = box.y1 - box.y0 + pad * 2
    const canvas = doc.createElement('canvas')
    canvas.width = Math.max(1, Math.ceil(width * dpr))
    canvas.height = Math.max(1, Math.ceil(height * dpr))
    const g = canvas.getContext('2d')
    if (!g)
      return null
    g.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr)
    g.beginPath()
    symbol(shape, size, g)
    if (fill) {
      g.fillStyle = fill
      g.fill()
    }
    if (stroke && strokeWidth > 0) {
      g.strokeStyle = stroke
      g.lineWidth = strokeWidth
      g.stroke()
    }
    return { canvas, left, top, width: canvas.width / dpr, height: canvas.height / dpr }
  }

  return {
    draw(ctx, shape, size, fill, stroke, strokeWidth, x, y, dpr) {
      if (!(size > 0) || !Number.isFinite(x) || !Number.isFinite(y))
        return
      const key = `${shape}|${size}|${fill}|${stroke}|${strokeWidth}|${dpr}`
      let sprite = cache.get(key)
      if (sprite === undefined) {
        if (cache.size >= LIMIT)
          cache.clear()
        sprite = make(shape, size, fill, stroke, strokeWidth, dpr)
        cache.set(key, sprite)
      }
      if (!sprite)
        return
      // 左上角对齐到设备像素：图块与画布的像素格一一对应，不被插值抹糊
      const left = Math.round((x + sprite.left) * dpr) / dpr
      const top = Math.round((y + sprite.top) * dpr) / dpr
      ctx.drawImage(sprite.canvas, left, top, sprite.width, sprite.height)
    },
  }
}
