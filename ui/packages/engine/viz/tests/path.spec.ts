import type { PathSink } from '../src'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { createSvgPath } from '../src'
import { between, forAll } from './helpers/property'

/** 路径最后落在哪个点：取末尾两个数。 */
function endPoint(d: string): [number, number] {
  const numbers = d.match(/-?\d+(?:\.\d+)?(?:e-?\d+)?/g)!.map(Number)
  return [numbers[numbers.length - 2]!, numbers[numbers.length - 1]!]
}

describe('路径构建器（SVG）', () => {
  it('直线、曲线与闭合', () => {
    const p = createSvgPath()
    p.moveTo(0, 0)
    p.lineTo(10, 0)
    p.quadraticCurveTo(15, 5, 10, 10)
    p.bezierCurveTo(8, 12, 2, 12, 0, 10)
    p.closePath()
    expect(p.toString()).toBe('M0,0L10,0Q15,5,10,10C8,12,2,12,0,10Z')
  })

  it('没有当前点时 lineTo 当作 moveTo', () => {
    const p = createSvgPath()
    p.lineTo(3, 4)
    expect(p.toString()).toBe('M3,4')
  })

  it('小数位缺省 2 位，末尾的 0 与负零去掉', () => {
    const p = createSvgPath()
    p.moveTo(1.23456, -0.0001)
    p.lineTo(2.5, 3)
    expect(p.toString()).toBe('M1.23,0L2.5,3')
    const q = createSvgPath(0)
    q.moveTo(1.6, 2.4)
    expect(q.toString()).toBe('M2,2')
    expect(() => createSvgPath(-1)).toThrow(/小数位/)
  })

  it('弧：没有当前点时先移到起点，有当前点时直线接过去', () => {
    const p = createSvgPath()
    p.arc(0, 0, 10, 0, Math.PI / 2)
    expect(p.toString()).toBe('M10,0A10,10,0,0,1,0,10')
    const q = createSvgPath()
    q.moveTo(0, 0)
    q.arc(0, 0, 10, 0, Math.PI / 2)
    expect(q.toString()).toBe('M0,0L10,0A10,10,0,0,1,0,10')
  })

  it('弧：大于半圈置大弧标记，逆时针置扫向标记为 0', () => {
    const p = createSvgPath()
    p.arc(0, 0, 10, 0, (3 * Math.PI) / 2)
    expect(p.toString()).toBe('M10,0A10,10,0,1,1,0,-10')
    const q = createSvgPath()
    q.arc(0, 0, 10, 0, Math.PI / 2, true)
    expect(q.toString()).toBe('M10,0A10,10,0,1,0,0,10')
  })

  it('整圆拆成两个半圆', () => {
    const p = createSvgPath()
    p.arc(50, 50, 10, 0, 2 * Math.PI)
    expect(p.toString()).toBe('M60,50A10,10,0,1,1,40,50A10,10,0,1,1,60,50')
  })

  it('半径为 0 的弧只落一个点；负半径报错', () => {
    const p = createSvgPath()
    p.arc(5, 5, 0, 0, 1)
    expect(p.toString()).toBe('M5,5')
    expect(() => p.arc(0, 0, -1, 0, 1)).toThrow(/半径/)
  })

  it('arcTo 在拐角处画与两条边相切的圆角', () => {
    const p = createSvgPath()
    p.moveTo(0, 0)
    p.arcTo(10, 0, 10, 10, 4)
    expect(p.toString()).toBe('M0,0L6,0A4,4,0,0,1,10,4')
  })

  it('arcTo 三点共线或半径为 0 时直线接到拐点', () => {
    const p = createSvgPath()
    p.moveTo(0, 0)
    p.arcTo(5, 0, 10, 0, 3)
    expect(p.toString()).toBe('M0,0L5,0')
    const q = createSvgPath()
    q.moveTo(0, 0)
    q.arcTo(5, 0, 5, 5, 0)
    expect(q.toString()).toBe('M0,0L5,0')
  })

  it('rect 画闭合矩形', () => {
    const p = createSvgPath()
    p.rect(1, 2, 3, 4)
    expect(p.toString()).toBe('M1,2h3v4h-3Z')
  })

  it('性质：弧的终点落在圆上 a1 处', () => {
    forAll(500, 73, random => ({ r: between(random, 1, 200), a0: between(random, -7, 7), sweep: between(random, 0.01, 6.2), ccw: random() < 0.5 }), ({ r, a0, sweep, ccw }) => {
      const a1 = ccw ? a0 - sweep : a0 + sweep
      const p = createSvgPath(6)
      p.arc(0, 0, r, a0, a1, ccw)
      const [x, y] = endPoint(p.toString())
      expect(x).toBeCloseTo(r * Math.cos(a1), 4)
      expect(y).toBeCloseTo(r * Math.sin(a1), 4)
    })
  })

  it('canvas 2D 上下文满足同一协议，可以直接当接收端', () => {
    expectTypeOf<CanvasRenderingContext2D>().toExtend<PathSink>()
  })
})
