// 旋转矩形与变换控制柄：四角与包围盒、点命中与最上层命中、旋转后的框选、八向缩放（对边不动、等比、
// 以中心缩放、最小尺寸、旋转后在自身坐标系里缩放）、旋转柄的角度与吸附、方向键微移，以及标尺刻度。
import type { Point, Rect } from '../src'
import { describe, expect, it } from 'vitest'
import {
  alignRects,
  distributeRects,
  fitRect,
  handlePoints,
  hitTest,
  nudgeDelta,
  pointInRect,
  rectCenter,
  rectContains,
  rectCorners,
  rectsIntersect,
  resizeWithHandle,
  revealRect,
  rotatedBounds,
  rotatedRectIntersects,
  rotatePoint,
  rotateWithHandle,
  rulerTicks,
  selectInMarquee,
  snapRect,
  unionRects,
  worldRectToScreen,
} from '../src'

function rect(x: number, y: number, width: number, height: number, rotation?: number): Rect {
  return rotation === undefined ? { x, y, width, height } : { x, y, width, height, rotation }
}

function expectPoint(actual: Point, expected: Point): void {
  expect(actual.x).toBeCloseTo(expected.x, 9)
  expect(actual.y).toBeCloseTo(expected.y, 9)
}

function expectRect(actual: Rect, expected: Rect): void {
  expect(actual.x).toBeCloseTo(expected.x, 9)
  expect(actual.y).toBeCloseTo(expected.y, 9)
  expect(actual.width).toBeCloseTo(expected.width, 9)
  expect(actual.height).toBeCloseTo(expected.height, 9)
  expect(actual.rotation ?? 0).toBeCloseTo(expected.rotation ?? 0, 9)
}

describe('旋转矩形', () => {
  it('绕中心顺时针旋转', () => {
    expectPoint(rotatePoint({ x: 10, y: 0 }, { x: 0, y: 0 }, 90), { x: 0, y: 10 })
    expect(rotatePoint({ x: 3, y: 4 }, { x: 1, y: 1 }, 0)).toEqual({ x: 3, y: 4 })
  })

  it('四角与包围盒', () => {
    const turned = rect(0, 0, 20, 10, 90)
    const corners = rectCorners(turned)
    expectPoint(corners[0], { x: 15, y: -5 })
    expectPoint(corners[2], { x: 5, y: 15 })
    expectRect(rotatedBounds(turned), rect(5, -5, 10, 20))
    expect(rotatedBounds(rect(1, 2, 3, 4))).toEqual(rect(1, 2, 3, 4))
    expectRect(unionRects([turned, rect(30, 0, 5, 5)])!, rect(5, -5, 30, 20))
  })

  it('点命中考虑旋转与容差', () => {
    const diamond = rect(0, 0, 20, 20, 45)
    expect(pointInRect({ x: 10, y: 10 }, diamond)).toBe(true)
    expect(pointInRect({ x: 1, y: 1 }, diamond)).toBe(false)
    expect(pointInRect({ x: 1, y: 1 }, rect(0, 0, 20, 20))).toBe(true)
    expect(pointInRect({ x: 21, y: 10 }, rect(0, 0, 20, 20), 2)).toBe(true)
  })

  it('命中最上层的那一个', () => {
    const rects = [rect(0, 0, 100, 100), rect(10, 10, 20, 20), rect(200, 200, 5, 5)]
    expect(hitTest({ x: 15, y: 15 }, rects)).toBe(1)
    expect(hitTest({ x: 50, y: 50 }, rects)).toBe(0)
    expect(hitTest({ x: 150, y: 150 }, rects)).toBe(-1)
  })

  it('旋转矩形与轴对齐框的相交按分离轴判断', () => {
    const diamond = rect(0, 0, 20, 20, 45)
    expect(rotatedRectIntersects(diamond, rect(0, 0, 2, 2))).toBe(false)
    expect(rotatedRectIntersects(diamond, rect(8, 8, 4, 4))).toBe(true)
    expect(rotatedRectIntersects(diamond, rect(-5, 9, 0.5, 2))).toBe(false)
    expect(rotatedRectIntersects(rect(0, 0, 10, 10), rect(10, 10, 1, 1))).toBe(true)
  })

  it('框选按旋转后的形状判断', () => {
    const items = [rect(0, 0, 20, 20, 45), rect(40, 0, 10, 10)]
    expect(selectInMarquee(rect(-1, -1, 22, 22), items)).toEqual([])
    expect(selectInMarquee(rect(-5, -5, 30, 30), items)).toEqual([0])
    expect(selectInMarquee(rect(0, 0, 2, 2), items, 'intersect')).toEqual([])
    expect(selectInMarquee(rect(0, 8, 3, 4), items, 'intersect')).toEqual([0])
  })
})

describe('变换控制柄', () => {
  it('控制柄位置随旋转', () => {
    const points = handlePoints(rect(0, 0, 100, 40), 20)
    expect(points.nw).toEqual({ x: 0, y: 0 })
    expect(points.se).toEqual({ x: 100, y: 40 })
    expect(points.e).toEqual({ x: 100, y: 20 })
    expect(points.rotate).toEqual({ x: 50, y: -20 })
    const turned = handlePoints(rect(0, 0, 100, 40, 90), 20)
    expectPoint(turned.rotate, { x: 90, y: 20 })
    expectPoint(turned.n, { x: 70, y: 20 })
  })

  it('拖边：对边不动', () => {
    expectRect(resizeWithHandle(rect(10, 10, 100, 40), 'e', { x: 150, y: 999 }), rect(10, 10, 140, 40))
    expectRect(resizeWithHandle(rect(10, 10, 100, 40), 'w', { x: 0, y: 0 }), rect(0, 10, 110, 40))
    expectRect(resizeWithHandle(rect(10, 10, 100, 40), 'n', { x: 0, y: -10 }), rect(10, -10, 100, 60))
  })

  it('拖角：对角不动', () => {
    expectRect(resizeWithHandle(rect(10, 10, 100, 40), 'se', { x: 60, y: 90 }), rect(10, 10, 50, 80))
    expectRect(resizeWithHandle(rect(10, 10, 100, 40), 'nw', { x: 0, y: 0 }), rect(0, 0, 110, 50))
  })

  it('等比：角取较大的缩放，边带着另一边按中线对称缩放', () => {
    expectRect(resizeWithHandle(rect(0, 0, 100, 50), 'se', { x: 150, y: 60 }, { keepAspect: true }), rect(0, 0, 150, 75))
    expectRect(resizeWithHandle(rect(0, 0, 100, 50), 'e', { x: 200, y: 0 }, { keepAspect: true }), rect(0, -25, 200, 100))
  })

  it('以中心缩放', () => {
    expectRect(resizeWithHandle(rect(0, 0, 100, 40), 'e', { x: 70, y: 0 }, { fromCenter: true }), rect(30, 0, 40, 40))
  })

  it('拖过对边时停在最小尺寸上', () => {
    expectRect(resizeWithHandle(rect(10, 10, 100, 40), 'e', { x: -50, y: 0 }, { minWidth: 8 }), rect(10, 10, 8, 40))
    expectRect(resizeWithHandle(rect(10, 10, 100, 40), 'nw', { x: 500, y: 500 }, { minWidth: 4, minHeight: 6 }), rect(106, 44, 4, 6))
    expectRect(
      resizeWithHandle(rect(0, 0, 100, 50), 'se', { x: 1, y: 1 }, { keepAspect: true, minWidth: 20, minHeight: 20 }),
      rect(0, 0, 40, 20),
    )
  })

  it('旋转后的矩形在自身坐标系里缩放，对边在世界坐标中不动', () => {
    const start = rect(0, 0, 100, 40, 90)
    const fixedBefore = handlePoints(start).w
    const pointer = rotatePoint({ x: 150, y: 20 }, rectCenter(start), 90)
    const resized = resizeWithHandle(start, 'e', pointer)
    expect(resized.width).toBeCloseTo(150)
    expect(resized.height).toBeCloseTo(40)
    expect(resized.rotation).toBe(90)
    expectPoint(handlePoints(resized).w, fixedBefore)
  })

  it('未知控制柄与负最小尺寸报错', () => {
    expect(() => resizeWithHandle(rect(0, 0, 1, 1), 'x' as 'n', { x: 0, y: 0 })).toThrow(RangeError)
    expect(() => resizeWithHandle(rect(0, 0, 1, 1), 'n', { x: 0, y: 0 }, { minWidth: -1 })).toThrow(RangeError)
  })

  it('旋转柄：朝上为 0，顺时针增大，可按步长吸附', () => {
    const box = rect(0, 0, 100, 100)
    expect(rotateWithHandle(box, { x: 50, y: -10 })).toBeCloseTo(0)
    expect(rotateWithHandle(box, { x: 200, y: 50 })).toBeCloseTo(90)
    expect(rotateWithHandle(box, { x: -100, y: 50 })).toBeCloseTo(270)
    expect(rotateWithHandle(box, { x: 100, y: -2 }, { step: 15 })).toBe(45)
    expect(() => rotateWithHandle(box, { x: 0, y: 0 }, { step: 0 })).toThrow(RangeError)
  })

  it('方向键微移', () => {
    expect(nudgeDelta('ArrowLeft')).toEqual({ dx: -1, dy: 0 })
    expect(nudgeDelta('ArrowDown', { large: true })).toEqual({ dx: 0, dy: 10 })
    expect(nudgeDelta('ArrowUp', { step: 0.5 })).toEqual({ dx: 0, dy: -0.5 })
    expect(nudgeDelta('ArrowRight', { large: true, largeStep: 5 })).toEqual({ dx: 5, dy: 0 })
    expect(nudgeDelta('Enter')).toBeUndefined()
  })
})

describe('标尺刻度', () => {
  it('毫米标尺：每毫米 10 像素时主刻度 10 mm、小刻度 1 mm', () => {
    const ruler = rulerTicks({ start: 0, end: 30, pixelsPerUnit: 10 })
    expect([ruler.step, ruler.minorStep]).toEqual([10, 1])
    expect(ruler.ticks.filter(tick => tick.major).map(tick => [tick.value, tick.offset])).toEqual([[0, 0], [10, 100], [20, 200], [30, 300]])
    expect(ruler.ticks).toHaveLength(31)
  })

  it('缩小后主刻度按 1-2-5 放大间隔', () => {
    expect(rulerTicks({ start: 0, end: 1000, pixelsPerUnit: 1 }).step).toBe(100)
    expect(rulerTicks({ start: 0, end: 1000, pixelsPerUnit: 0.5 }).step).toBe(200)
    expect(rulerTicks({ start: 0, end: 1000, pixelsPerUnit: 0.2 }).step).toBe(500)
    expect(rulerTicks({ start: 0, end: 10, pixelsPerUnit: 400 }).step).toBe(0.2)
  })

  it('起点不在刻度上与负值区间', () => {
    const ruler = rulerTicks({ start: -12.5, end: 12.5, pixelsPerUnit: 10 })
    expect(ruler.ticks[0]).toEqual({ value: -12, offset: 5, major: false })
    expect(ruler.ticks.filter(tick => tick.major).map(tick => tick.value)).toEqual([-10, 0, 10])
    expect(ruler.ticks.every(tick => Number.isInteger(tick.value))).toBe(true)
  })

  it('小刻度太密时减少分格', () => {
    const ruler = rulerTicks({ start: 0, end: 100, pixelsPerUnit: 1.3, minMajorSpacing: 64, minMinorSpacing: 8 })
    expect(ruler.step).toBe(50)
    expect(ruler.minorStep).toBe(10)
  })

  it('非法参数报错', () => {
    expect(() => rulerTicks({ start: 1, end: 0, pixelsPerUnit: 1 })).toThrow(RangeError)
    expect(() => rulerTicks({ start: 0, end: 1, pixelsPerUnit: 0 })).toThrow(RangeError)
    expect(() => rulerTicks({ start: 0, end: 1, pixelsPerUnit: 1, steps: [] })).toThrow(RangeError)
  })
})

describe('带旋转角的矩形按旋转后的包围盒计算', () => {
  it('包含与相交', () => {
    expect(rectContains(rect(0, 0, 30, 40), rect(-2, 17, 34, 6, 90))).toBe(true)
    expect(rectContains(rect(0, 0, 30, 40), rect(-2, 17, 34, 6))).toBe(false)
    expect(rectsIntersect(rect(0, 0, 10, 10), rect(12, -10, 4, 30, 90))).toBe(true)
    expect(rectsIntersect(rect(0, 0, 10, 10), rect(12, -10, 4, 30))).toBe(false)
  })

  it('对齐与分布移动的是包围盒，旋转前的框跟着平移', () => {
    const rects = [rect(0, 0, 20, 10, 90), rect(50, 0, 10, 10)]
    expect(alignRects(rects, 'left')).toEqual([{ x: 0, y: 0 }, { x: 5, y: 0 }])
    expect(alignRects(rects, 'top')).toEqual([{ x: 0, y: 0 }, { x: 50, y: -5 }])
    const row = [rect(0, 0, 10, 10), rect(40, 0, 20, 10, 90), rect(100, 0, 10, 10)]
    expect(distributeRects(row, 'horizontal')).toEqual([{ x: 0, y: 0 }, { x: 45, y: 0 }, { x: 100, y: 0 }])
  })

  it('吸附按包围盒的三条线比对，网格也落包围盒的左上角', () => {
    const moving = rect(103, 40, 20, 10, 90)
    expect(snapRect(moving, { targets: [rect(100, 200, 10, 10)], threshold: 3 }).dx).toBe(2)
    const grid = snapRect(moving, { targets: [], threshold: 1, grid: 10 })
    expect([grid.dx, grid.dy]).toEqual([2, 5])
  })

  it('视口适配与显露按包围盒，矩形换算保留旋转角', () => {
    expect(fitRect(rect(0, 0, 200, 100, 90), { width: 800, height: 600 }, { padding: 0, maxZoom: 10 }).zoom).toBeCloseTo(3)
    const viewport = { x: 0, y: 0, zoom: 1 }
    expect(revealRect(viewport, rect(650, 100, 200, 20, 90), { width: 800, height: 600 })).toBe(viewport)
    expect(worldRectToScreen({ x: 10, y: 0, zoom: 2 }, rect(0, 0, 5, 5, 30))).toEqual(rect(10, 0, 10, 10, 30))
  })
})
