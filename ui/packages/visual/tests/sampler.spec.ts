import { describe, expect, it } from 'vitest'
import { sampleImageData } from '../src/sources/sampler'

/**
 * 判据按「像素转点云必须保证什么」写：
 * 点只能落在有内容的地方、等比映射不许把图拉变形、同一个种子必须给出同一份结果、
 * 空图不许凭空造点。好不好看不在这层判。
 */

/** 造一张 RGBA 图：fill 决定每个像素的 [r,g,b,a]。 */
function makeImage(
  width: number,
  height: number,
  fill: (x: number, y: number) => [number, number, number, number],
): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = fill(x, y)
      const at = (y * width + x) * 4
      data[at] = r
      data[at + 1] = g
      data[at + 2] = b
      data[at + 3] = a
    }
  }
  return data
}

const transparent: [number, number, number, number] = [0, 0, 0, 0]

describe('取样范围', () => {
  it('点只落在不透明的区域里', () => {
    // 8×8 的图，中间 4×4 不透明
    const data = makeImage(8, 8, (x, y) =>
      x >= 2 && x <= 5 && y >= 2 && y <= 5 ? [255, 255, 255, 255] : transparent)

    const cloud = sampleImageData(data, 8, 8, { count: 400, jitter: 0 })

    expect(cloud.count).toBe(400)
    for (let i = 0; i < cloud.count; i++) {
      // scale = 2 / max(8,8) = 0.25，像素 2..5 → 归一化 ±0.375
      expect(Math.abs(cloud.positions[i * 3]!)).toBeLessThanOrEqual(0.376)
      expect(Math.abs(cloud.positions[i * 3 + 1]!)).toBeLessThanOrEqual(0.376)
    }
  })

  it('全透明的图一个点都不产出，而不是产出一堆落在原点的点', () => {
    const data = makeImage(8, 8, () => transparent)
    expect(sampleImageData(data, 8, 8, { count: 400 }).count).toBe(0)
  })

  it('阈值以下的像素被排除', () => {
    // 左半边 alpha=10（约 0.04），低于默认阈值 0.08；右半边全不透明
    const data = makeImage(8, 8, x => (x < 4 ? [255, 255, 255, 10] : [255, 255, 255, 255]))
    const cloud = sampleImageData(data, 8, 8, { count: 300, jitter: 0 })
    for (let i = 0; i < cloud.count; i++)
      expect(cloud.positions[i * 3]!).toBeGreaterThan(0)
  })
})

describe('等比映射', () => {
  it('宽图的长边铺满 ±1，短边按比例收窄，不被拉变形', () => {
    const data = makeImage(16, 8, () => [255, 255, 255, 255])
    const cloud = sampleImageData(data, 16, 8, { count: 3000, jitter: 0 })

    let maxX = 0
    let maxY = 0
    for (let i = 0; i < cloud.count; i++) {
      maxX = Math.max(maxX, Math.abs(cloud.positions[i * 3]!))
      maxY = Math.max(maxY, Math.abs(cloud.positions[i * 3 + 1]!))
    }
    // scale = 2/16 = 0.125：x 最远 (15.5-8)*0.125 = 0.9375，y 最远 (7.5-4)*0.125 = 0.4375
    expect(maxX).toBeCloseTo(0.9375, 3)
    expect(maxY).toBeCloseTo(0.4375, 3)
    // 等比的定义是两轴反推出同一个缩放系数（取样落在像素中心，故极值为 (边长/2 - 0.5) × scale）
    expect(maxX / (16 / 2 - 0.5)).toBeCloseTo(maxY / (8 / 2 - 0.5), 6)
  })

  it('y 轴翻转：图片上方的像素对应点云的正 y', () => {
    // 只有第 0 行不透明
    const data = makeImage(8, 8, (_x, y) => (y === 0 ? [255, 255, 255, 255] : transparent))
    const cloud = sampleImageData(data, 8, 8, { count: 50, jitter: 0 })
    for (let i = 0; i < cloud.count; i++)
      expect(cloud.positions[i * 3 + 1]!).toBeGreaterThan(0)
  })
})

describe('确定性与颜色', () => {
  it('同一个种子给出逐字节相同的结果', () => {
    const data = makeImage(12, 12, (x, y) => [x * 20, y * 20, 128, x + y > 6 ? 255 : 0])
    const a = sampleImageData(data, 12, 12, { count: 200, seed: 42 })
    const b = sampleImageData(data, 12, 12, { count: 200, seed: 42 })
    expect(Array.from(a.positions)).toEqual(Array.from(b.positions))
    expect(Array.from(a.colors)).toEqual(Array.from(b.colors))
  })

  it('不同种子给出不同的采样', () => {
    const data = makeImage(12, 12, () => [255, 255, 255, 255])
    const a = sampleImageData(data, 12, 12, { count: 200, seed: 1 })
    const b = sampleImageData(data, 12, 12, { count: 200, seed: 2 })
    expect(Array.from(a.positions)).not.toEqual(Array.from(b.positions))
  })

  it('keepColor 打开时取原像素颜色，关闭时统一用指定色', () => {
    const data = makeImage(4, 4, () => [255, 0, 0, 255])

    const kept = sampleImageData(data, 4, 4, { count: 10, keepColor: true })
    expect(kept.colors[0]).toBeCloseTo(1, 5)
    expect(kept.colors[1]).toBeCloseTo(0, 5)

    const fixed = sampleImageData(data, 4, 4, { count: 10, keepColor: false, color: '#0000ff' })
    expect(fixed.colors[0]).toBeCloseTo(0, 5)
    expect(fixed.colors[2]).toBeCloseTo(1, 5)
  })

  it('亮度通道按明暗取样：纯黑的不透明像素权重为 0', () => {
    const data = makeImage(8, 8, x => (x < 4 ? [0, 0, 0, 255] : [255, 255, 255, 255]))
    const cloud = sampleImageData(data, 8, 8, { count: 300, channel: 'luminance', jitter: 0 })
    expect(cloud.count).toBe(300)
    for (let i = 0; i < cloud.count; i++)
      expect(cloud.positions[i * 3]!).toBeGreaterThan(0)
  })

  it('depth 为 0 时点云是纯平面', () => {
    const data = makeImage(8, 8, () => [255, 255, 255, 255])
    const cloud = sampleImageData(data, 8, 8, { count: 100, depth: 0 })
    for (let i = 0; i < cloud.count; i++)
      expect(cloud.positions[i * 3 + 2]).toBe(0)
  })
})

describe('边界输入', () => {
  it('count 为 0、宽高为 0 都返回空点云而不是抛错', () => {
    const data = makeImage(4, 4, () => [255, 255, 255, 255])
    expect(sampleImageData(data, 4, 4, { count: 0 }).count).toBe(0)
    expect(sampleImageData(new Uint8ClampedArray(0), 0, 0).count).toBe(0)
  })

  it('产出的数组长度与 count 严格对应', () => {
    const data = makeImage(6, 6, () => [255, 255, 255, 255])
    const cloud = sampleImageData(data, 6, 6, { count: 77 })
    expect(cloud.positions.length).toBe(77 * 3)
    expect(cloud.colors.length).toBe(77 * 3)
    expect(cloud.sizes?.length).toBe(77)
  })
})
