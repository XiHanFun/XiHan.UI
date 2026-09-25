import { describe, expect, it } from 'vitest'
import { displacementAt, lensKey, parseBackdrop, supportsRefraction } from '../src/visual-environment/liquid/lens'

describe('displacementAt', () => {
  const W = 200
  const H = 60
  const R = 30
  const BEZEL = 18

  it('中心与 bezel 以内之外都没有位移', () => {
    expect(displacementAt(100, 30, W, H, R, BEZEL)).toEqual([0, 0])
    // 离上缘正好 bezel 深的点落在折射带之外
    expect(displacementAt(100, BEZEL, W, H, R, BEZEL)).toEqual([0, 0])
  })

  it('靠近上缘时朝下（向内）拉，越靠边越强', () => {
    const edge = displacementAt(100, 1, W, H, R, BEZEL)
    const deeper = displacementAt(100, 10, W, H, R, BEZEL)
    expect(edge[0]).toBeCloseTo(0, 6)
    expect(edge[1]).toBeGreaterThan(0)
    expect(edge[1]).toBeGreaterThan(deeper[1])
  })

  it('靠近左缘时朝右（向内）拉', () => {
    const [dx, dy] = displacementAt(1, 30, W, H, R, BEZEL)
    expect(dx).toBeGreaterThan(0)
    expect(Math.abs(dy)).toBeLessThan(1e-9)
  })

  it('位移分量不超过 1', () => {
    for (const [x, y] of [[0.5, 0.5], [199.5, 59.5], [100, 0.5], [0.5, 30]]) {
      const [dx, dy] = displacementAt(x!, y!, W, H, R, BEZEL)
      expect(Math.hypot(dx, dy)).toBeLessThanOrEqual(1 + 1e-9)
    }
  })
})

describe('parseBackdrop', () => {
  it('取出模糊半径与饱和度；none 与空串返回 null', () => {
    expect(parseBackdrop('blur(8px) saturate(1.4)')).toEqual({ blur: 8, saturate: 1.4 })
    expect(parseBackdrop('none')).toBeNull()
    expect(parseBackdrop('')).toBeNull()
  })
})

describe('supportsRefraction', () => {
  it('按内核品牌判断：只有 Chromium 渲染 SVG 背景滤镜', () => {
    expect(supportsRefraction({ userAgentData: { brands: [{ brand: 'Chromium' }] } } as unknown as Navigator)).toBe(true)
    expect(supportsRefraction({} as Navigator)).toBe(false)
    expect(supportsRefraction(undefined)).toBe(false)
  })
})

describe('lensKey', () => {
  it('尺寸、圆角与滤镜参数相同的部件共用一段滤镜', () => {
    const spec = { width: 48.4, height: 48, radius: 24, bezel: 18, blur: 8, saturate: 1.4 }
    expect(lensKey(spec)).toBe(lensKey({ ...spec, width: 48.2 }))
    expect(lensKey(spec)).not.toBe(lensKey({ ...spec, radius: 12 }))
  })
})
