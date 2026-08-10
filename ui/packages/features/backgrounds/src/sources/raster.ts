// 光栅化：把任何能画到 2D 画布上的东西变成一份 RGBA 像素。
// 图片、文字、SVG 走的都是这一条路，所以它们的采样行为完全一致。

import { isSSR } from '@xihan-ui/kernel'

export interface RasterResult {
  readonly data: Uint8ClampedArray
  readonly width: number
  readonly height: number
}

/** 长边像素上限。再大对点云精度没有可见收益，只是让 getImageData 变慢。 */
export const MAX_RASTER_SIZE = 1024

/** 按长边上限等比收缩，同时保证两边至少 1 像素。 */
export function fitSize(width: number, height: number, limit: number): [number, number] {
  const cap = Math.min(limit, MAX_RASTER_SIZE)
  const longest = Math.max(width, height)
  if (longest <= 0)
    return [1, 1]
  const scale = longest > cap ? cap / longest : 1
  return [Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale))]
}

/**
 * 建一张离屏画布，交给 draw 画，然后取回像素。
 * 画布被跨源图污染时 getImageData 会抛，这里吞掉并返回 null，由调用方决定怎么提示。
 */
export function rasterize(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
): RasterResult | null {
  if (isSSR())
    return null
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (ctx === null)
    return null
  draw(ctx, width, height)
  try {
    const image = ctx.getImageData(0, 0, width, height)
    return { data: image.data, width, height }
  }
  catch {
    return null
  }
}
