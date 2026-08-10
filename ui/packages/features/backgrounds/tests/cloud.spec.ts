import { describe, expect, it } from 'vitest'
import {
  boundsOf,
  createCloud,
  createRng,
  lerpArrays,
  mergeClouds,
  normalizeCloud,
  resample,
  scatterShell,
} from '../src/sources/cloud'
import { heartAt, SHAPE_NAMES, shapeCloud } from '../src/sources/shape'

/**
 * 判据按「形变必须成立」写：
 * 重采样后长度必须严格对上，源里的点不许有人被漏掉，
 * 归一化必须等比（分轴缩放会把圆压成椭圆，图片粒子立刻走形）。
 */

describe('重采样', () => {
  it('无论源多长，产出长度严格等于目标数 × 分量数', () => {
    const src = new Float32Array([0, 0, 0, 1, 1, 1, 2, 2, 2])
    expect(resample(src, 3, 7, 3).length).toBe(21)
    expect(resample(src, 3, 2, 3).length).toBe(6)
  })

  it('源少于目标时循环取样，源里每个点都会被用到', () => {
    const src = new Float32Array([10, 20, 30])
    const out = resample(src, 3, 7, 1)
    expect(Array.from(out)).toEqual([10, 20, 30, 10, 20, 30, 10])
  })

  it('源多于目标时均匀间隔取样', () => {
    const src = new Float32Array([0, 1, 2, 3, 4, 5, 6, 7])
    expect(Array.from(resample(src, 8, 4, 1))).toEqual([0, 2, 4, 6])
  })

  it('空源产出全 0 而不是抛错', () => {
    expect(Array.from(resample(new Float32Array(0), 0, 3, 1))).toEqual([0, 0, 0])
  })
})

describe('插值', () => {
  it('两端与中点都对', () => {
    const a = new Float32Array([0, 10])
    const b = new Float32Array([100, 20])
    expect(Array.from(lerpArrays(a, b, 0))).toEqual([0, 10])
    expect(Array.from(lerpArrays(a, b, 1))).toEqual([100, 20])
    expect(Array.from(lerpArrays(a, b, 0.5))).toEqual([50, 15])
  })

  it('长度不等时按较长的一方产出，短的一方缺位当 0', () => {
    const out = lerpArrays(new Float32Array([2]), new Float32Array([4, 8]), 0.5)
    expect(Array.from(out)).toEqual([3, 4])
  })
})

describe('归一化', () => {
  it('居中且等比缩放：长宽比保持不变', () => {
    // 一个 4×2×0 的扁盒子，中心在 (10, 5, 0)
    const positions = new Float32Array([8, 4, 0, 12, 6, 0])
    const cloud = normalizeCloud(createCloud(positions, new Float32Array(6)))
    const { min, max } = boundsOf(cloud)

    expect((min[0]! + max[0]!) / 2).toBeCloseTo(0, 6)
    expect((min[1]! + max[1]!) / 2).toBeCloseTo(0, 6)
    // 长边被缩到 2，短边等比跟着缩到 1，而不是也被拉到 2
    expect(max[0]! - min[0]!).toBeCloseTo(2, 6)
    expect(max[1]! - min[1]!).toBeCloseTo(1, 6)
  })

  it('所有点重合时不产生 NaN', () => {
    const positions = new Float32Array([3, 3, 3, 3, 3, 3])
    const cloud = normalizeCloud(createCloud(positions, new Float32Array(6)))
    for (const v of cloud.positions)
      expect(Number.isFinite(v)).toBe(true)
  })

  it('空点云原样返回', () => {
    const empty = createCloud(new Float32Array(0), new Float32Array(0))
    expect(normalizeCloud(empty).count).toBe(0)
  })
})

describe('合并与散布', () => {
  it('合并后的点数与分量数都是各份之和', () => {
    const a = shapeCloud('ring', { count: 30 })
    const b = shapeCloud('disc', { count: 20 })
    const merged = mergeClouds([a, b])
    expect(merged.count).toBe(50)
    expect(merged.positions.length).toBe(150)
    expect(merged.sizes?.length).toBe(50)
  })

  it('球壳散布的点都落在指定半径附近且没有 NaN', () => {
    const shell = scatterShell(500, 2, 7)
    for (let i = 0; i < 500; i++) {
      const r = Math.hypot(shell[i * 3]!, shell[i * 3 + 1]!, shell[i * 3 + 2]!)
      expect(r).toBeGreaterThan(2 * 0.7)
      expect(r).toBeLessThan(2 * 1.25)
    }
  })
})

describe('随机源', () => {
  it('同一个种子给出同一串数，结果才可复现', () => {
    const a = createRng(123)
    const b = createRng(123)
    for (let i = 0; i < 20; i++)
      expect(a()).toBe(b())
  })

  it('取值落在 [0, 1)', () => {
    const rng = createRng(9)
    for (let i = 0; i < 500; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('参数方程形状', () => {
  it.each(SHAPE_NAMES)('%s 点数正确、坐标有限且在单位范围附近', (name) => {
    const cloud = shapeCloud(name, { count: 400, seed: 3 })
    expect(cloud.count).toBe(400)
    expect(cloud.positions.length).toBe(1200)
    expect(cloud.colors.length).toBe(1200)
    for (const v of cloud.positions) {
      expect(Number.isFinite(v)).toBe(true)
      expect(Math.abs(v)).toBeLessThanOrEqual(2)
    }
    for (const v of cloud.colors) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    }
  })

  it('心形轮廓在 t 上闭合且落在归一化范围内', () => {
    for (let i = 0; i <= 32; i++) {
      const [x, y] = heartAt((i / 32) * Math.PI * 2)
      expect(Math.abs(x)).toBeLessThanOrEqual(1.2)
      expect(Math.abs(y)).toBeLessThanOrEqual(1.2)
    }
    const start = heartAt(0)
    const end = heartAt(Math.PI * 2)
    expect(start[0]).toBeCloseTo(end[0], 6)
    expect(start[1]).toBeCloseTo(end[1], 6)
  })

  it('同一个种子给出同一份点云', () => {
    const a = shapeCloud('heart', { count: 200, seed: 11 })
    const b = shapeCloud('heart', { count: 200, seed: 11 })
    expect(Array.from(a.positions)).toEqual(Array.from(b.positions))
  })

  it('count 为 0 时返回空点云', () => {
    expect(shapeCloud('sphere', { count: 0 }).count).toBe(0)
  })
})
