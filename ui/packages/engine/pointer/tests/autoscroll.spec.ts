import { describe, expect, it } from 'vitest'
import { DEFAULT_EDGE_SPEED, DEFAULT_EDGE_THRESHOLD, edgeScrollDelta } from '../src'

/** 一个 400×400 的容器，左上角在 (0,0)。两条边缘带各 48，中间地带 304。 */
const bounds = { x: 0, y: 0, width: 400, height: 400 }

const delta = (x: number, y: number) => edgeScrollDelta({ bounds, point: { x, y } })

describe('边缘自动滚动', () => {
  it('默认阈值 48px、满速 12px/帧', () => {
    expect(DEFAULT_EDGE_THRESHOLD).toBe(48)
    expect(DEFAULT_EDGE_SPEED).toBe(12)
  })

  it('中间地带不滚', () => {
    expect(delta(200, 200)).toEqual({ x: 0, y: 0 })
  })

  it('刚好踩在边缘线上还不滚', () => {
    expect(delta(48, 200).x).toBe(0)
    expect(delta(352, 200).x).toBe(0)
  })

  it('往起点方向是负值，往终点方向是正值', () => {
    expect(delta(10, 200).x).toBeLessThan(0)
    expect(delta(390, 200).x).toBeGreaterThan(0)
    expect(delta(200, 10).y).toBeLessThan(0)
    expect(delta(200, 390).y).toBeGreaterThan(0)
  })

  it('贴死边缘时满速', () => {
    expect(delta(0, 200).x).toBe(-12)
    expect(delta(400, 200).y).toBe(0)
    expect(delta(200, 400).y).toBe(12)
  })

  it('速度随入侵深度线性上升', () => {
    // 深度 24 = 阈值的一半 → 半速
    expect(delta(24, 200).x).toBeCloseTo(-6)
    expect(delta(376, 200).x).toBeCloseTo(6)
  })

  it('越靠边越快，不是常速', () => {
    const shallow = Math.abs(delta(40, 200).x)
    const deep = Math.abs(delta(8, 200).x)
    expect(deep).toBeGreaterThan(shallow)
  })

  it('指针跑到容器外时按满速算，不是停下', () => {
    expect(delta(-100, 200).x).toBe(-12)
    expect(delta(9999, 200).x).toBe(12)
  })

  it('两轴各算各的：角落里两轴同时滚', () => {
    const corner = delta(10, 10)
    expect(corner.x).toBeLessThan(0)
    expect(corner.y).toBeLessThan(0)
  })

  it('容器窄到两条边缘带重叠时不滚——否则方向来回翻，原地抽搐', () => {
    const narrow = { x: 0, y: 0, width: 80, height: 400 }
    for (const x of [0, 20, 40, 60, 80]) {
      expect(edgeScrollDelta({ bounds: narrow, point: { x, y: 200 } }).x).toBe(0)
    }
    // 同一个容器，另一轴够宽，照滚不误
    expect(edgeScrollDelta({ bounds: narrow, point: { x: 40, y: 10 } }).y).toBeLessThan(0)
  })

  it('阈值或速度给 0 就整个关掉', () => {
    expect(edgeScrollDelta({ bounds, point: { x: 0, y: 0 }, threshold: 0 })).toEqual({ x: 0, y: 0 })
    expect(edgeScrollDelta({ bounds, point: { x: 0, y: 0 }, speed: 0 })).toEqual({ x: 0, y: 0 })
  })

  it('自定阈值与速度', () => {
    const out = edgeScrollDelta({ bounds, point: { x: 0, y: 200 }, threshold: 100, speed: 30 })
    expect(out.x).toBe(-30)
    // 深度 50 = 自定阈值的一半
    expect(edgeScrollDelta({ bounds, point: { x: 50, y: 200 }, threshold: 100, speed: 30 }).x).toBeCloseTo(-15)
  })

  it('容器不在原点时按它自己的边算', () => {
    const shifted = { x: 1000, y: 500, width: 400, height: 400 }
    expect(edgeScrollDelta({ bounds: shifted, point: { x: 1000, y: 700 } }).x).toBe(-12)
    expect(edgeScrollDelta({ bounds: shifted, point: { x: 1200, y: 700 } }).x).toBe(0)
  })
})
