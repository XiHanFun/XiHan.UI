// 图片 → 点云。任何 CanvasImageSource（img / canvas / video / ImageBitmap）都能进来，
// 传 URL 时负责加载并按需处理跨源。

import type { PointCloud } from '../types'
import type { SampleOptions } from './sampler'
import { isSSR } from '@xihan-ui/kernel'
import { fitSize, rasterize } from './raster'
import { sampleImageData } from './sampler'

export type ImageSource
  = | string
    | HTMLImageElement
    | HTMLCanvasElement
    | HTMLVideoElement
    | ImageBitmap
    | Blob

export interface ImageCloudOptions extends SampleOptions {
  /** 光栅化的长边像素上限，默认 320。 */
  readonly resolution?: number
  /** 加载 URL 时的 crossOrigin，设为 null 表示不设置。 */
  readonly crossOrigin?: string | null
}

function sizeOf(source: Exclude<ImageSource, string | Blob>): [number, number] {
  if (typeof HTMLVideoElement !== 'undefined' && source instanceof HTMLVideoElement)
    return [source.videoWidth, source.videoHeight]
  if (typeof HTMLImageElement !== 'undefined' && source instanceof HTMLImageElement)
    return [source.naturalWidth || source.width, source.naturalHeight || source.height]
  return [source.width, source.height]
}

/** 同步版本：源已经可以直接绘制时用它。 */
export function drawableToCloud(
  source: Exclude<ImageSource, string | Blob>,
  options: ImageCloudOptions = {},
): PointCloud {
  const [srcW, srcH] = sizeOf(source)
  const [width, height] = fitSize(srcW, srcH, options.resolution ?? 320)
  const raster = rasterize(width, height, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(source, 0, 0, w, h)
  })
  if (raster === null)
    return { count: 0, positions: new Float32Array(0), colors: new Float32Array(0), sizes: new Float32Array(0) }
  return sampleImageData(raster.data, raster.width, raster.height, options)
}

/** 加载一张图片。失败时 reject，调用方自行决定降级。 */
export function loadImage(src: string, crossOrigin: string | null = 'anonymous'): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (isSSR()) {
      reject(new Error('[backgrounds] 服务端无法加载图片'))
      return
    }
    const img = new Image()
    if (crossOrigin !== null)
      img.crossOrigin = crossOrigin
    img.decoding = 'async'
    img.onload = (): void => resolve(img)
    img.onerror = (): void => reject(new Error(`[backgrounds] 图片加载失败：${src}`))
    img.src = src
  })
}

/** 图片 → 点云。传 URL 或 Blob 时内部负责加载。 */
export async function imageToCloud(
  source: ImageSource,
  options: ImageCloudOptions = {},
): Promise<PointCloud> {
  if (typeof source === 'string')
    return drawableToCloud(await loadImage(source, options.crossOrigin ?? 'anonymous'), options)

  if (source instanceof Blob) {
    const url = URL.createObjectURL(source)
    try {
      return drawableToCloud(await loadImage(url, null), options)
    }
    finally {
      URL.revokeObjectURL(url)
    }
  }

  return drawableToCloud(source, options)
}
