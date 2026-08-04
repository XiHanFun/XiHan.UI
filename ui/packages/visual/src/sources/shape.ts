// 参数方程形状。不依赖 DOM，纯数学，所以能在服务端预生成，也能直接测。
// 与图片采样出的点云是同一种表示，两者之间可以直接形变。

import type { PointCloud } from '../types'
import { hexToRgb } from '../params'
import { createRng } from './cloud'

export type ShapeName
  = | 'heart'
    | 'sphere'
    | 'torus'
    | 'ring'
    | 'disc'
    | 'grid'
    | 'spiral'
    | 'cube'
    | 'wave'

export const SHAPE_NAMES: readonly ShapeName[] = [
  'heart',
  'sphere',
  'torus',
  'ring',
  'disc',
  'grid',
  'spiral',
  'cube',
  'wave',
]

export interface ShapeOptions {
  readonly count?: number
  readonly seed?: number
  /** 三色渐变，沿形状的主参数铺开。 */
  readonly colors?: readonly [string, string, string]
  /** 立体形状的额外厚度系数。 */
  readonly depth?: number
}

const DEFAULT_COLORS: readonly [string, string, string] = ['#ff4d6d', '#ff9f45', '#7c5cff']

/** 沿 0~1 在三色之间取色。 */
function mix3(colors: readonly [[number, number, number], [number, number, number], [number, number, number]], v: number): [number, number, number] {
  const x = Math.min(1, Math.max(0, v))
  const [a, b, c] = colors
  if (x < 0.5) {
    const t = x * 2
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
  }
  const t = (x - 0.5) * 2
  return [b[0] + (c[0] - b[0]) * t, b[1] + (c[1] - b[1]) * t, b[2] + (c[2] - b[2]) * t]
}

/** 心形轮廓的参数方程，t ∈ [0, 2π)，输出已归一到约 [-1, 1]。 */
export function heartAt(t: number): [number, number] {
  const s = Math.sin(t)
  const x = 1.1 * s * s * s
  const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + 2) / 14
  return [x, y]
}

export function shapeCloud(name: ShapeName, options: ShapeOptions = {}): PointCloud {
  const count = Math.max(0, Math.floor(options.count ?? 9000))
  const rng = createRng(options.seed ?? 20260804)
  const depth = options.depth ?? 1
  const palette = (options.colors ?? DEFAULT_COLORS).map(hexToRgb) as [
    [number, number, number],
    [number, number, number],
    [number, number, number],
  ]

  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    let x = 0
    let y = 0
    let z = 0
    let tone = 0

    switch (name) {
      case 'heart': {
        const t = rng() * Math.PI * 2
        const [hx, hy] = heartAt(t)
        // 边缘点单独留一圈，否则填充采样会把轮廓糊掉
        const edge = rng() < 0.42
        const rad = edge ? 0.92 + rng() * 0.08 : Math.sqrt(rng()) * 0.98
        x = hx * rad
        y = -0.02 + (hy + 0.02) * rad
        const thickness = 0.58 * Math.sqrt(Math.max(0, 1 - rad ** 1.7))
        z = (edge ? (rng() - 0.5) * Math.max(0.14, thickness * 1.7) : (rng() < 0.5 ? -1 : 1) * thickness) * depth
        tone = (y + 1) / 2
        break
      }
      case 'sphere': {
        const u = rng() * 2 - 1
        const phi = rng() * Math.PI * 2
        const s = Math.sqrt(Math.max(0, 1 - u * u))
        x = Math.cos(phi) * s
        y = u
        z = Math.sin(phi) * s * depth
        tone = (u + 1) / 2
        break
      }
      case 'torus': {
        const a = rng() * Math.PI * 2
        const b = rng() * Math.PI * 2
        const r = 0.34
        x = (1 - r + r * Math.cos(b)) * Math.cos(a)
        y = r * Math.sin(b)
        z = (1 - r + r * Math.cos(b)) * Math.sin(a) * depth
        tone = a / (Math.PI * 2)
        break
      }
      case 'ring': {
        const a = rng() * Math.PI * 2
        const r = 0.82 + rng() * 0.16
        x = Math.cos(a) * r
        y = Math.sin(a) * r
        z = (rng() - 0.5) * 0.06 * depth
        tone = a / (Math.PI * 2)
        break
      }
      case 'disc': {
        const a = rng() * Math.PI * 2
        const r = Math.sqrt(rng())
        x = Math.cos(a) * r
        y = Math.sin(a) * r
        z = (rng() - 0.5) * 0.08 * depth
        tone = r
        break
      }
      case 'grid': {
        const side = Math.max(2, Math.round(Math.sqrt(count)))
        const gx = i % side
        const gy = Math.floor(i / side) % side
        x = (gx / (side - 1)) * 2 - 1
        y = (gy / (side - 1)) * 2 - 1
        z = (rng() - 0.5) * 0.05 * depth
        tone = (x + 1) / 2
        break
      }
      case 'spiral': {
        const t = (i / Math.max(1, count)) * Math.PI * 14
        const r = t / (Math.PI * 14)
        x = Math.cos(t) * r
        y = Math.sin(t) * r
        z = (r - 0.5) * 1.2 * depth
        tone = r
        break
      }
      case 'cube': {
        const face = Math.floor(rng() * 6)
        const u = rng() * 2 - 1
        const v = rng() * 2 - 1
        const coords: [number, number, number][] = [
          [1, u, v],
          [-1, u, v],
          [u, 1, v],
          [u, -1, v],
          [u, v, 1],
          [u, v, -1],
        ]
        const c = coords[face] ?? [0, 0, 0]
        x = c[0]
        y = c[1]
        z = c[2] * depth
        tone = (y + 1) / 2
        break
      }
      case 'wave': {
        const u = rng() * 2 - 1
        const v = rng() * 2 - 1
        x = u
        z = v * depth
        y = Math.sin(u * 3.1) * 0.28 + Math.cos(v * 2.4) * 0.22
        tone = (y + 0.5) / 1
        break
      }
    }

    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z

    const col = mix3(palette, tone)
    colors[i * 3] = col[0]
    colors[i * 3 + 1] = col[1]
    colors[i * 3 + 2] = col[2]
    sizes[i] = 0.55 + rng() * 0.95
  }

  return { count, positions, colors, sizes }
}
