/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// Canvas 文字度量器：用 2D 上下文的 measureText 量出真实字宽，结果按字体与文字缓存。

import type { FontSpec, TextMeasurer, TextSize } from './index'

/** 缓存上限：满了整表清空重来。 */
const CACHE_LIMIT = 2000

/** 拼成 Canvas 的 font 串：斜体、字重、字号（px）与字体族。 */
function fontString(font: FontSpec): string {
  return `${font.style === 'italic' ? 'italic ' : ''}${font.weight} ${font.size}px ${font.family}`
}

/** Canvas 度量器：在 TextMeasurer 之外多一个 refresh，字体换档或加载完成后调用。 */
export interface CanvasMeasurer extends TextMeasurer {
  /** 清掉缓存并把 version 加一，依赖度量的布局据此重算。 */
  readonly refresh: () => void
}

/**
 * 在给定文档里建一块离屏 Canvas 作度量器。拿不到 2D 上下文（jsdom、受限环境）时返回 null，
 * 调用方继续用 createEstimatingMeasurer 的估算器。只在调用时触碰 DOM。
 */
export function createCanvasMeasurer(doc: Document): CanvasMeasurer | null {
  let ctx: CanvasRenderingContext2D | null = null
  try {
    ctx = doc.createElement('canvas').getContext('2d')
  }
  catch {
    ctx = null
  }
  if (!ctx || typeof ctx.measureText !== 'function')
    return null
  const context = ctx
  let version = 1
  const cache = new Map<string, TextSize>()
  return {
    get version() {
      return version
    },
    measure(text: string, font: FontSpec): TextSize {
      // 字体串里不会出现竖线，按首个竖线切得开，两段拼起来不会撞键
      const key = `${fontString(font)}|${text}`
      const hit = cache.get(key)
      if (hit)
        return hit
      context.font = fontString(font)
      const metrics = context.measureText(text)
      const size: TextSize = {
        width: metrics.width,
        // 旧引擎没有字面上下伸时按字号的 0.8 / 0.2 估，与估算器同一口径
        ascent: metrics.actualBoundingBoxAscent || font.size * 0.8,
        descent: metrics.actualBoundingBoxDescent || font.size * 0.2,
      }
      if (cache.size >= CACHE_LIMIT)
        cache.clear()
      cache.set(key, size)
      return size
    },
    refresh() {
      cache.clear()
      version += 1
    },
  }
}
