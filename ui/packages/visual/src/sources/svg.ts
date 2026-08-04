// SVG → 点云。
// 单条路径走 Path2D 填充；整段 SVG 交给浏览器自己渲染成图片再采样，
// 这样描边、渐变、嵌套分组这些自己解析要写很久的东西全都免费拿到。

import type { PointCloud } from '../types'
import type { ImageCloudOptions } from './image'
import type { SampleOptions } from './sampler'
import { imageToCloud } from './image'
import { rasterize } from './raster'
import { sampleImageData } from './sampler'

export interface PathCloudOptions extends SampleOptions {
  /** 路径数据的坐标范围，默认 [0, 0, 100, 100]。 */
  readonly viewBox?: readonly [number, number, number, number]
  /** 光栅化的长边像素，默认 320。 */
  readonly resolution?: number
  /** 填充还是描边。 */
  readonly mode?: 'fill' | 'stroke'
  /** mode 为 stroke 时的线宽，按 viewBox 坐标计。 */
  readonly strokeWidth?: number
}

/** 单条 SVG path 的 d 属性 → 点云。 */
export function pathToCloud(d: string, options: PathCloudOptions = {}): PointCloud {
  const empty: PointCloud = {
    count: 0,
    positions: new Float32Array(0),
    colors: new Float32Array(0),
    sizes: new Float32Array(0),
  }
  if (d.length === 0 || typeof Path2D === 'undefined')
    return empty

  const [vx, vy, vw, vh] = options.viewBox ?? [0, 0, 100, 100]
  if (vw <= 0 || vh <= 0)
    return empty

  const longest = options.resolution ?? 320
  const scale = longest / Math.max(vw, vh)
  const width = Math.max(1, Math.round(vw * scale))
  const height = Math.max(1, Math.round(vh * scale))

  const raster = rasterize(width, height, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.setTransform(scale, 0, 0, scale, -vx * scale, -vy * scale)
    const path = new Path2D(d)
    if (options.mode === 'stroke') {
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = options.strokeWidth ?? 2
      ctx.lineJoin = 'round'
      ctx.stroke(path)
    }
    else {
      ctx.fillStyle = '#ffffff'
      ctx.fill(path)
    }
  })
  if (raster === null)
    return empty

  return sampleImageData(raster.data, raster.width, raster.height, {
    channel: 'alpha',
    keepColor: false,
    ...options,
  })
}

/** 整段 SVG 标记 → 点云。 */
export function svgToCloud(svg: string, options: ImageCloudOptions = {}): Promise<PointCloud> {
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  return imageToCloud(url, { crossOrigin: null, ...options })
}
