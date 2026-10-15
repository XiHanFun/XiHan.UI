// 折线工具的性质：总长、按比例取点（含零长段与零总长）、两端收回（跨点、收尽时相遇）、箭头三角形的朝向与尺寸，
// 拐角倒圆的折线路径与箭头路径，以及非法输入立即报错。
import type { PolylinePoint } from '../src'
import { describe, expect, it } from 'vitest'
import { arrowHead, arrowHeadPath, isVizError, polylineLength, polylinePointAt, roundedPolylinePath, segmentsPath, shortenPolyline } from '../src'
import { forAll, integer } from './helpers/property'

const p = (x: number, y: number): PolylinePoint => ({ x, y })
const L = [p(0, 0), p(10, 0), p(10, 30)]

function expectThrows(run: () => unknown): void {
  let caught: unknown
  try {
    run()
  }
  catch (error) {
    caught = error
  }
  expect(isVizError(caught)).toBe(true)
}

describe('polylineLength', () => {
  it('各段长度之和，少于两点为 0', () => {
    expect(polylineLength(L)).toBe(40)
    expect(polylineLength([p(3, 4)])).toBe(0)
    expect(polylineLength([])).toBe(0)
    expect(polylineLength([p(0, 0), p(3, 4), p(3, 4)])).toBe(5)
  })
})

describe('polylinePointAt', () => {
  it('按总长比例取点', () => {
    expect(polylinePointAt(L, 0)).toEqual(p(0, 0))
    expect(polylinePointAt(L, 0.5)).toEqual(p(10, 10))
    expect(polylinePointAt(L, 1)).toEqual(p(10, 30))
    expect(polylinePointAt(L, 0.125)).toEqual(p(5, 0))
  })

  it('跳过零长段；总长为 0 时取起点', () => {
    expect(polylinePointAt([p(0, 0), p(0, 0), p(4, 0)], 0.5)).toEqual(p(2, 0))
    expect(polylinePointAt([p(7, 7), p(7, 7)], 0.5)).toEqual(p(7, 7))
    expect(polylinePointAt([p(1, 2)], 1)).toEqual(p(1, 2))
  })
})

describe('shortenPolyline', () => {
  it('终点沿最后一段收回', () => {
    expect(shortenPolyline(L, { end: 10 })).toEqual([p(0, 0), p(10, 0), p(10, 20)])
  })

  it('收回长度跨过拐点时去掉跨过的点', () => {
    expect(shortenPolyline(L, { end: 35 })).toEqual([p(0, 0), p(5, 0)])
    expect(shortenPolyline(L, { start: 15 })).toEqual([p(10, 5), p(10, 30)])
    expect(shortenPolyline(L, { start: 2, end: 2 })).toEqual([p(2, 0), p(10, 0), p(10, 28)])
  })

  it('两端收尽时停在按收回长度分配的同一位置', () => {
    expect(shortenPolyline(L, { start: 30, end: 30 })).toEqual([p(10, 10), p(10, 10)])
    expect(shortenPolyline(L, { start: 0, end: 100 })).toEqual([p(0, 0), p(0, 0)])
  })

  it('不收回时原样复制，不与输入共享对象', () => {
    const out = shortenPolyline(L, {})
    expect(out).toEqual(L)
    expect(out[0]).not.toBe(L[0])
    expect(shortenPolyline([p(1, 1)], { end: 5 })).toEqual([p(1, 1)])
  })

  it('随机折线：收回后总长恰好少了收回的长度', () => {
    forAll(60, 5, (random) => {
      const points = Array.from({ length: integer(random, 2, 6) }, () => p(integer(random, -50, 50), integer(random, -50, 50)))
      const total = polylineLength(points)
      return { points, start: total * random() * 0.4, end: total * random() * 0.4 }
    }, ({ points, start, end }) => {
      const total = polylineLength(points)
      expect(polylineLength(shortenPolyline(points, { start, end }))).toBeCloseTo(total - start - end, 9)
    })
  })
})

describe('arrowHead', () => {
  it('尖端在 tip，沿 from → tip 方向，缺省宽为长度的 0.8 倍', () => {
    const head = arrowHead(p(0, 20), p(100, 20), { length: 10 })
    expect(head.closed).toBe(true)
    expect(head.points).toEqual([p(100, 20), p(90, 24), p(90, 16)])
    expect(segmentsPath([head])).toBe('M100,20L90,24L90,16Z')
  })

  it('指定宽度；竖直向下的方向', () => {
    expect(arrowHead(p(0, 0), p(0, 10), { length: 4, width: 4 }).points).toEqual([p(0, 10), p(-2, 6), p(2, 6)])
  })

  it('from 与 tip 重合时三点都落在尖端', () => {
    expect(arrowHead(p(5, 5), p(5, 5), { length: 6 }).points).toEqual([p(5, 5), p(5, 5), p(5, 5)])
  })
})

describe('非法输入', () => {
  it('立即报错', () => {
    expectThrows(() => polylinePointAt([], 0.5))
    expectThrows(() => polylinePointAt(L, 1.5))
    expectThrows(() => polylinePointAt(L, Number.NaN))
    expectThrows(() => polylineLength([p(0, Number.POSITIVE_INFINITY)]))
    expectThrows(() => shortenPolyline(L, { end: -1 }))
    expectThrows(() => arrowHead(p(0, 0), p(1, 0), { length: -1 }))
    expectThrows(() => arrowHead(p(0, 0), p(1, 0), { length: 1, width: Number.NaN }))
  })
})

describe('roundedPolylinePath / arrowHeadPath', () => {
  it('拐角倒圆弧，半径不越过相邻两段的一半', () => {
    expect(roundedPolylinePath([p(0, 0), p(20, 0), p(20, 20)], 4)).toBe('M0,0L16,0A4,4,0,0,1,20,4L20,20')
    expect(roundedPolylinePath([p(0, 0), p(4, 0), p(4, 20)], 10)).toBe('M0,0L2,0A2,2,0,0,1,4,2L4,20')
    expect(roundedPolylinePath(L, 0)).toBe('M0,0L10,0L10,30')
    expect(roundedPolylinePath([p(1, 2)], 5)).toBe('M1,2')
    expect(roundedPolylinePath([], 5)).toBe('')
  })

  it('箭头路径与 arrowHead 同一几何，退化时为空串', () => {
    expect(arrowHeadPath(p(0, 20), p(100, 20), { length: 10 })).toBe('M100,20L90,24L90,16Z')
    expect(arrowHeadPath(p(0, 0), p(3, 0), { length: 1, width: 1 / 3, digits: 1 })).toBe('M3,0L2,0.2L2,-0.2Z')
    expect(arrowHeadPath(p(5, 5), p(5, 5), { length: 6 })).toBe('')
    expect(arrowHeadPath(p(0, 0), p(5, 5), { length: 0 })).toBe('')
  })

  it('非法输入立即报错', () => {
    expectThrows(() => roundedPolylinePath(L, -1))
    expectThrows(() => roundedPolylinePath([p(0, Number.NaN)], 1))
    expectThrows(() => arrowHeadPath(p(0, 0), p(1, 0), { length: -1 }))
  })
})
