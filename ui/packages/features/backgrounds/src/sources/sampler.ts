// 像素 → 点云。这是「任意图片转粒子」的通用核心：
// 图片、文字、SVG、乃至任何画到 canvas 上的东西，都先变成一份 RGBA 像素，再走这里。
// 采样按权重带放回抽取，所以目标点数可以大于也可以小于有效像素数，密度都是均匀的。

import type { PointCloud } from '../types'
import { hexToRgb } from '../params'
import { createRng } from './cloud'

export type SampleChannel = 'alpha' | 'luminance'

export interface SampleOptions {
  /** 目标点数。 */
  readonly count?: number
  /** 按不透明度还是按亮度决定「这里有没有东西」。 */
  readonly channel?: SampleChannel
  /** 权重低于此值的像素直接排除，0~1。 */
  readonly threshold?: number
  /** 反相：取暗处而不是亮处。对白底黑字的图必须打开。 */
  readonly invert?: boolean
  /** z 轴厚度，0 得到纯平面图案。 */
  readonly depth?: number
  /** 亚像素抖动幅度，0~1，避免点排成整齐的网格。 */
  readonly jitter?: number
  /** 保留原像素颜色；关掉则统一用 color。 */
  readonly keepColor?: boolean
  /** keepColor 关闭时的统一颜色。 */
  readonly color?: string
  /** 让亮处的点更大。 */
  readonly sizeByWeight?: boolean
  readonly seed?: number
}

const DEFAULTS = {
  count: 12000,
  channel: 'alpha' as SampleChannel,
  threshold: 0.08,
  invert: false,
  depth: 0,
  jitter: 1,
  keepColor: true,
  color: '#ffffff',
  sizeByWeight: false,
  seed: 20260804,
}

/** 单个像素的权重，0~1。 */
function weightAt(data: Uint8ClampedArray, at: number, channel: SampleChannel): number {
  const alpha = (data[at + 3] ?? 0) / 255
  if (channel === 'alpha')
    return alpha
  const r = (data[at] ?? 0) / 255
  const g = (data[at + 1] ?? 0) / 255
  const b = (data[at + 2] ?? 0) / 255
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) * alpha
}

/**
 * 从 RGBA 像素里抽出点云。
 *
 * 坐标等比映射到 [-1, 1]：长边占满，短边按比例收窄，图片不会被拉变形。
 * y 轴翻转，因为像素行自上而下而点云的 y 轴朝上。
 */
export function sampleImageData(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options: SampleOptions = {},
): PointCloud {
  const opt = { ...DEFAULTS, ...options }
  const count = Math.max(0, Math.floor(opt.count))
  if (count === 0 || width <= 0 || height <= 0)
    return { count: 0, positions: new Float32Array(0), colors: new Float32Array(0), sizes: new Float32Array(0) }

  // 前缀和：一次遍历建表，之后每个点用二分查到落在哪个像素上。
  const total = width * height
  const cumulative = new Float64Array(total)
  let sum = 0
  for (let i = 0; i < total; i++) {
    let w = weightAt(data, i * 4, opt.channel)
    if (opt.invert)
      w = ((data[i * 4 + 3] ?? 0) / 255) * (1 - w)
    if (w < opt.threshold)
      w = 0
    sum += w
    cumulative[i] = sum
  }

  if (sum <= 0)
    return { count: 0, positions: new Float32Array(0), colors: new Float32Array(0), sizes: new Float32Array(0) }

  const rng = createRng(opt.seed)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const scale = 2 / Math.max(width, height)
  const fixed = hexToRgb(opt.color)

  for (let i = 0; i < count; i++) {
    const target = rng() * sum
    let lo = 0
    let hi = total - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if ((cumulative[mid] ?? 0) < target)
        lo = mid + 1
      else
        hi = mid
    }
    const px = lo % width
    const py = Math.floor(lo / width)
    const jx = (rng() - 0.5) * opt.jitter
    const jy = (rng() - 0.5) * opt.jitter

    positions[i * 3] = (px + 0.5 + jx - width / 2) * scale
    positions[i * 3 + 1] = -(py + 0.5 + jy - height / 2) * scale
    positions[i * 3 + 2] = opt.depth === 0 ? 0 : (rng() - 0.5) * opt.depth

    const at = lo * 4
    if (opt.keepColor) {
      colors[i * 3] = (data[at] ?? 0) / 255
      colors[i * 3 + 1] = (data[at + 1] ?? 0) / 255
      colors[i * 3 + 2] = (data[at + 2] ?? 0) / 255
    }
    else {
      colors[i * 3] = fixed[0]
      colors[i * 3 + 1] = fixed[1]
      colors[i * 3 + 2] = fixed[2]
    }

    const w = weightAt(data, at, opt.channel)
    sizes[i] = opt.sizeByWeight ? 0.45 + w * 1.1 : 0.6 + rng() * 0.8
  }

  return { count, positions, colors, sizes }
}
