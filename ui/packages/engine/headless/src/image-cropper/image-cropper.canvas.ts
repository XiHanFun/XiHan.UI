// 出图的那一步。连接层不碰它：什么时候出图、出成什么、拿去做什么，全归使用者。

import type { ImageCropperRect } from './image-cropper.types'

export interface CropToCanvasOptions {
  /** 输出画布宽度，缺省等于裁切矩形的宽（即按 1:1 出图）。 */
  width?: number
  /** 输出画布高度，缺省按输出宽度与裁切矩形的比例算。 */
  height?: number
  /**
   * 先铺一层底色再画图。
   * 源图带透明像素而输出格式是 JPEG 时，不铺底色的透明区会被编码成黑块。
   */
  background?: string
  /** 缩放时的插值质量，缺省 'high'。 */
  quality?: ImageSmoothingQuality
}

/**
 * 把裁切矩形那一块画到一张新画布上，尺寸与坐标都按源图的自然像素。
 * 没有 document（服务端）、拿不到 2d 上下文、或裁切矩形是空的时候返回 null。
 */
export function cropToCanvas(
  image: CanvasImageSource,
  rect: ImageCropperRect,
  options: CropToCanvasOptions = {},
): HTMLCanvasElement | null {
  if (typeof document === 'undefined')
    return null
  if (!(rect.width > 0) || !(rect.height > 0))
    return null

  const width = Math.max(1, Math.round(options.width ?? rect.width))
  const height = Math.max(1, Math.round(options.height ?? (width * rect.height) / rect.width))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return null

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = options.quality ?? 'high'
  if (options.background) {
    ctx.fillStyle = options.background
    ctx.fillRect(0, 0, width, height)
  }
  ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, width, height)
  return canvas
}
