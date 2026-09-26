/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 文字度量：服务端与首帧用确定性估算器，挂载后换成 Canvas 的 measureText。

import type { FontSpec, TextMeasurer, TextSize } from '@xihan-ui/viz'
import { createEstimatingMeasurer } from '@xihan-ui/viz'

/** 估算器：服务端与挂载前的布局都用它，结果确定，首屏输出稳定。 */
export const CHART_ESTIMATING_MEASURER: TextMeasurer = createEstimatingMeasurer()

/** 缓存上限：轴标签与图例的文字总数有限，满了整表清空重来。 */
const CACHE_LIMIT = 2000

function fontString(font: FontSpec): string {
  return `${font.weight} ${font.size}px ${font.family}`
}

/**
 * Canvas 度量器。拿不到 2D 上下文（jsdom、受限环境）时返回 null，调用方继续用估算器。
 * 字体换档或加载完成后度量结果会变：调用 refresh 清掉缓存并把 version 加一，依赖度量的布局据此重算。
 */
export function createCanvasMeasurer(doc: Document): (TextMeasurer & { refresh: () => void }) | null {
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
