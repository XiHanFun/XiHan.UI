// 点云的构造与变换。图片、文字、SVG、参数方程最终都归一到 PointCloud 这一种表示，
// 于是「换形态」永远只是换一份点云，形变动画不必关心它从哪来。

import type { PointCloud } from '../types'

/** 确定性伪随机数，同一 seed 每次跑出同一串——点云要能复现，否则没法做视觉回归。 */
export function createRng(seed: number): () => number {
  let t = seed >>> 0
  return (): number => {
    t = (t + 0x6D2B79F5) >>> 0
    let x = Math.imul(t ^ (t >>> 15), t | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

export function createCloud(
  positions: Float32Array,
  colors: Float32Array,
  sizes?: Float32Array,
): PointCloud {
  const count = Math.floor(positions.length / 3)
  return { count, positions, colors, sizes }
}

/**
 * 把 stride 分量的数组重采样到 dstCount 个元素。
 * 源多于目标就间隔取样，源少于目标就循环取样——两份点云数量不同时的配对全靠它，
 * 循环取样意味着源里的每个点都会被用到，不会有一半点原地不动。
 */
export function resample(
  src: Float32Array,
  srcCount: number,
  dstCount: number,
  stride: number,
): Float32Array {
  const out = new Float32Array(dstCount * stride)
  if (srcCount <= 0)
    return out
  for (let i = 0; i < dstCount; i++) {
    const j = srcCount >= dstCount
      ? Math.min(srcCount - 1, Math.floor(i * srcCount / dstCount))
      : i % srcCount
    for (let k = 0; k < stride; k++)
      out[i * stride + k] = src[j * stride + k] ?? 0
  }
  return out
}

/** 逐分量线性插值。两个数组长度须一致，短的一方按 0 处理。 */
export function lerpArrays(a: Float32Array, b: Float32Array, t: number): Float32Array {
  const out = new Float32Array(Math.max(a.length, b.length))
  for (let i = 0; i < out.length; i++) {
    const av = a[i] ?? 0
    const bv = b[i] ?? 0
    out[i] = av + (bv - av) * t
  }
  return out
}

/** 把点云散到一层球壳上，用作出场前的起始形态。 */
export function scatterShell(count: number, radius: number, seed = 1): Float32Array {
  const rng = createRng(seed)
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const u = rng() * 2 - 1
    const phi = rng() * Math.PI * 2
    const r = radius * (0.75 + rng() * 0.45)
    const s = Math.sqrt(Math.max(0, 1 - u * u))
    out[i * 3] = Math.cos(phi) * s * r
    out[i * 3 + 1] = Math.sin(phi) * s * r
    out[i * 3 + 2] = u * r
  }
  return out
}

/** 取包围盒。空点云返回全 0。 */
export function boundsOf(cloud: PointCloud): { min: [number, number, number], max: [number, number, number] } {
  if (cloud.count === 0)
    return { min: [0, 0, 0], max: [0, 0, 0] }
  const min: [number, number, number] = [Infinity, Infinity, Infinity]
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < cloud.count; i++) {
    for (let k = 0; k < 3; k++) {
      const v = cloud.positions[i * 3 + k] ?? 0
      if (v < min[k]!)
        min[k] = v
      if (v > max[k]!)
        max[k] = v
    }
  }
  return { min, max }
}

/**
 * 居中并等比缩放到边长 2 的立方体内。
 * 等比是关键：分轴缩放会把圆压成椭圆，图片粒子立刻就走形。
 */
export function normalizeCloud(cloud: PointCloud): PointCloud {
  if (cloud.count === 0)
    return cloud
  const { min, max } = boundsOf(cloud)
  const center = [0, 1, 2].map(k => (min[k]! + max[k]!) / 2)
  const extent = Math.max(max[0]! - min[0]!, max[1]! - min[1]!, max[2]! - min[2]!)
  const scale = extent > 1e-6 ? 2 / extent : 1
  const positions = new Float32Array(cloud.positions.length)
  for (let i = 0; i < cloud.count; i++) {
    for (let k = 0; k < 3; k++)
      positions[i * 3 + k] = ((cloud.positions[i * 3 + k] ?? 0) - center[k]!) * scale
  }
  return { count: cloud.count, positions, colors: cloud.colors, sizes: cloud.sizes }
}

/** 合并多份点云。 */
export function mergeClouds(clouds: readonly PointCloud[]): PointCloud {
  const count = clouds.reduce((sum, c) => sum + c.count, 0)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  let at = 0
  for (const cloud of clouds) {
    positions.set(cloud.positions.subarray(0, cloud.count * 3), at * 3)
    colors.set(cloud.colors.subarray(0, cloud.count * 3), at * 3)
    for (let i = 0; i < cloud.count; i++)
      sizes[at + i] = cloud.sizes?.[i] ?? 1
    at += cloud.count
  }
  return { count, positions, colors, sizes }
}
