// 按住液态面的黏滞形变：拉扯向量按越界衰减趋近半径，transform 沿指向拉长、垂直方向压扁且不低于下限。
import { describe, expect, it } from 'vitest'
import { deformTransform, pullOf } from '../src/visual-environment/liquid/press'

describe('pullOf', () => {
  it('方向与手指一致，长度随距离增长但越来越慢，趋近半径', () => {
    const near = pullOf(10, 0, 20)
    const far = pullOf(200, 0, 20)
    const farther = pullOf(2000, 0, 20)
    expect(near.y).toBe(0)
    expect(near.x).toBeGreaterThan(0)
    expect(far.x).toBeGreaterThan(near.x)
    expect(farther.x).toBeGreaterThan(far.x)
    expect(farther.x).toBeLessThan(20)
    // 增长越来越慢：拖出 10 倍距离，拉扯长度远不到 10 倍
    expect(far.x / near.x).toBeLessThan(5)
  })

  it('按在正中心或半径为 0 时没有拉扯', () => {
    expect(pullOf(0, 0, 20)).toEqual({ x: 0, y: 0 })
    expect(pullOf(5, 5, 0)).toEqual({ x: 0, y: 0 })
  })

  it('斜着拉：两个分量按方向分配', () => {
    const pull = pullOf(30, -40, 20)
    expect(Math.atan2(pull.y, pull.x)).toBeCloseTo(Math.atan2(-40, 30), 6)
  })
})

describe('deformTransform', () => {
  it('没有拉扯时撤掉形变', () => {
    expect(deformTransform({ x: 0, y: 0 }, 20, 0.86)).toBeNull()
  })

  it('朝指向挪、沿指向拉长、垂直方向压扁，压扁不低于下限', () => {
    const full = deformTransform({ x: 20, y: 0 }, 20, 0.86)!
    expect(full).toContain('translate(10px, 0px)')
    expect(full).toContain('scale(1.35, 0.86)')
    const half = deformTransform({ x: 10, y: 0 }, 20, 0.86)!
    expect(half).toContain('scale(1.175, 0.93)')
  })

  it('减弱档的压扁下限为 1：只拉长不压扁', () => {
    expect(deformTransform({ x: 20, y: 0 }, 20, 1)).toContain('scale(1.35, 1)')
  })
})
