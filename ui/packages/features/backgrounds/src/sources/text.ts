// 文字 → 点云。先把文字画到离屏画布，再走与图片同一条采样路径。

import type { PointCloud } from '../types'
import type { SampleOptions } from './sampler'
import { MAX_RASTER_SIZE, rasterize } from './raster'
import { sampleImageData } from './sampler'

export interface TextCloudOptions extends SampleOptions {
  /** 字号（像素）。 */
  readonly fontSize?: number
  readonly fontFamily?: string
  readonly fontWeight?: string | number
  /** 直接给 CSS font 简写，给了就忽略上面三项。 */
  readonly font?: string
  /** 行高倍数。 */
  readonly lineHeight?: number
  /** 四周留白（像素）。 */
  readonly padding?: number
  readonly letterSpacing?: string
}

/**
 * 文字 → 点云。多行用 \n 分隔。
 * 字体没加载完就调用会按回退字形取样，需要精确字形请先 await document.fonts.ready。
 */
export function textToCloud(text: string, options: TextCloudOptions = {}): PointCloud {
  const empty: PointCloud = {
    count: 0,
    positions: new Float32Array(0),
    colors: new Float32Array(0),
    sizes: new Float32Array(0),
  }
  const lines = text.split('\n')
  if (text.length === 0)
    return empty

  const fontSize = options.fontSize ?? 160
  const weight = options.fontWeight ?? 700
  const family = options.fontFamily ?? 'system-ui, sans-serif'
  const font = options.font ?? `${weight} ${fontSize}px ${family}`
  const lineHeight = (options.lineHeight ?? 1.15) * fontSize
  const padding = options.padding ?? Math.round(fontSize * 0.18)

  // 先量一次文字宽度才知道画布该多大，量与画必须用同一份 font 设置。
  const measured = rasterize(1, 1, (ctx) => {
    ctx.font = font
    if (options.letterSpacing !== undefined)
      ctx.letterSpacing = options.letterSpacing
  })
  if (measured === null)
    return empty

  let width = 1
  rasterize(1, 1, (ctx) => {
    ctx.font = font
    if (options.letterSpacing !== undefined)
      ctx.letterSpacing = options.letterSpacing
    for (const line of lines)
      width = Math.max(width, ctx.measureText(line).width)
  })

  const canvasWidth = Math.min(MAX_RASTER_SIZE, Math.ceil(width) + padding * 2)
  const canvasHeight = Math.min(MAX_RASTER_SIZE, Math.ceil(lineHeight * lines.length) + padding * 2)

  const raster = rasterize(canvasWidth, canvasHeight, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.font = font
    if (options.letterSpacing !== undefined)
      ctx.letterSpacing = options.letterSpacing
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    const startY = h / 2 - (lines.length - 1) * lineHeight / 2
    lines.forEach((line, i) => {
      ctx.fillText(line, w / 2, startY + i * lineHeight, w - padding * 2)
    })
  })
  if (raster === null)
    return empty

  // 画的是白色不透明字，按 alpha 取样最稳；颜色由调用方指定。
  return sampleImageData(raster.data, raster.width, raster.height, {
    channel: 'alpha',
    keepColor: false,
    ...options,
  })
}
