// 几何、吸附、对齐分布与框选：吸到最近的线、参考线合并、网格退路、对齐贴边与居中、等距分布的两种口径、框选两种方式。
import { describe, expect, it } from 'vitest'
import {
  alignRects,
  distributeRects,
  expandRect,
  marqueeModeFromDrag,
  marqueeRect,
  rectCenter,
  rectContains,
  rectFromPoints,
  rectsIntersect,
  selectInMarquee,
  snapPointToGrid,
  snapRect,
  snapToGrid,
  unionRects,
} from '../src'

const rect = (x: number, y: number, width: number, height: number) => ({ x, y, width, height })

describe('矩形运算', () => {
  it('两点围成矩形与包围盒', () => {
    expect(rectFromPoints({ x: 10, y: 5 }, { x: 0, y: 20 })).toEqual(rect(0, 5, 10, 15))
    expect(unionRects([rect(0, 0, 10, 10), rect(20, -5, 5, 5)])).toEqual(rect(0, -5, 25, 15))
    expect(unionRects([])).toBeUndefined()
  })

  it('包含、相交、外扩与中心', () => {
    expect(rectContains(rect(0, 0, 10, 10), rect(0, 0, 10, 10))).toBe(true)
    expect(rectContains(rect(0, 0, 10, 10), rect(5, 5, 10, 1))).toBe(false)
    expect(rectsIntersect(rect(0, 0, 10, 10), rect(10, 10, 5, 5))).toBe(true)
    expect(rectsIntersect(rect(0, 0, 10, 10), rect(11, 0, 5, 5))).toBe(false)
    expect(expandRect(rect(10, 10, 20, 10), 5)).toEqual(rect(5, 5, 30, 20))
    expect(expandRect(rect(10, 10, 4, 4), -5)).toEqual(rect(12, 12, 0, 0))
    expect(rectCenter(rect(0, 0, 10, 20))).toEqual({ x: 5, y: 10 })
  })
})

describe('snapRect', () => {
  const target = rect(100, 100, 50, 40)

  it('吸到阈值内最近的线并给出参考线', () => {
    const result = snapRect(rect(103, 300, 30, 20), { targets: [target], threshold: 5 })
    expect(result.dx).toBe(-3)
    expect(result.dy).toBe(0)
    expect(result.guides).toEqual([{ axis: 'x', position: 100, from: 100, to: 320 }])
  })

  it('中线也能吸', () => {
    const result = snapRect(rect(114, 98, 20, 20), { targets: [target], threshold: 2 })
    expect([result.dx, result.dy]).toEqual([1, 2])
    expect(result.guides.map(guide => [guide.axis, guide.position])).toEqual([['x', 125], ['y', 100], ['y', 120]])
  })

  it('同一位置的参考线合并成一条，跨度覆盖所有对齐的矩形', () => {
    const result = snapRect(rect(0, 0, 10, 10), { targets: [rect(0, 50, 30, 10), rect(-20, 200, 20, 10)], threshold: 1 })
    expect(result.guides.filter(guide => guide.axis === 'x')).toEqual([{ axis: 'x', position: 0, from: 0, to: 210 }])
  })

  it('超出阈值不吸；可只吸一个方向', () => {
    expect(snapRect(rect(110, 300, 20, 20), { targets: [target], threshold: 4 })).toEqual({ dx: 0, dy: 0, guides: [] })
    const onlyY = snapRect(rect(103, 101, 20, 20), { targets: [target], threshold: 5, x: false })
    expect([onlyY.dx, onlyY.dy]).toEqual([0, -1])
    expect(onlyY.guides.every(guide => guide.axis === 'y')).toBe(true)
  })

  it('吸附线与目标矩形一同比对，取最近的一条；对齐线跨度只覆盖移动的矩形', () => {
    const result = snapRect(rect(52, 300, 20, 10), { targets: [target], threshold: 5, lines: { x: [50, 99], y: [305] } })
    expect([result.dx, result.dy]).toEqual([-2, 0])
    expect(result.guides).toEqual([
      { axis: 'x', position: 50, from: 300, to: 310 },
      { axis: 'y', position: 305, from: 50, to: 70 },
    ])
    const tie = snapRect(rect(101, 0, 10, 10), { targets: [target], threshold: 5, lines: { x: [100] } })
    expect(tie.dx).toBe(-1)
    expect(tie.guides.filter(guide => guide.axis === 'x')).toEqual([{ axis: 'x', position: 100, from: 0, to: 140 }])
  })

  it('吸附线优先于网格，只吸关闭的方向时忽略该向的线', () => {
    const result = snapRect(rect(13, 27, 20, 20), { targets: [], threshold: 2, grid: 10, lines: { x: [12] } })
    expect([result.dx, result.dy]).toEqual([-1, 3])
    expect(snapRect(rect(13, 27, 20, 20), { targets: [], threshold: 2, lines: { x: [12] }, x: false })).toEqual({ dx: 0, dy: 0, guides: [] })
  })

  it('没有可吸的目标时落到网格上', () => {
    const result = snapRect(rect(13, 27, 20, 20), { targets: [], threshold: 2, grid: 10 })
    expect([result.dx, result.dy]).toEqual([-3, 3])
    const aligned = snapRect(rect(101, 27, 20, 20), { targets: [target], threshold: 2, grid: 10 })
    expect([aligned.dx, aligned.dy]).toEqual([-1, 3])
  })

  it('非法参数报错；网格工具', () => {
    expect(() => snapRect(rect(0, 0, 1, 1), { targets: [], threshold: -1 })).toThrow(RangeError)
    expect(() => snapRect(rect(0, 0, 1, 1), { targets: [], threshold: 1, grid: 0 })).toThrow(RangeError)
    expect(() => snapRect(rect(0, 0, 1, 1), { targets: [], threshold: 1, lines: { y: [Number.NaN] } })).toThrow(RangeError)
    expect(snapToGrid(14, 8)).toBe(16)
    expect(snapPointToGrid({ x: 3, y: 13 }, 5)).toEqual({ x: 5, y: 15 })
    expect(() => snapToGrid(1, -2)).toThrow(RangeError)
  })
})

describe('对齐与分布', () => {
  const rects = [rect(10, 10, 20, 10), rect(50, 30, 40, 20), rect(30, 70, 10, 10)]

  it('贴齐选区包围盒的边', () => {
    expect(alignRects(rects, 'left')).toEqual([{ x: 10, y: 10 }, { x: 10, y: 30 }, { x: 10, y: 70 }])
    expect(alignRects(rects, 'right').map(p => p.x)).toEqual([70, 50, 80])
    expect(alignRects(rects, 'top').map(p => p.y)).toEqual([10, 10, 10])
    expect(alignRects(rects, 'bottom').map(p => p.y)).toEqual([70, 60, 70])
  })

  it('居中到包围盒的中线', () => {
    expect(alignRects(rects, 'center-vertical').map(p => p.x)).toEqual([40, 30, 45])
    expect(alignRects(rects, 'center-horizontal').map(p => p.y)).toEqual([40, 35, 40])
  })

  it('不到两个时原样返回；未知方式报错', () => {
    expect(alignRects([rect(5, 6, 1, 1)], 'left')).toEqual([{ x: 5, y: 6 }])
    expect(() => alignRects(rects, 'middle' as 'left')).toThrow(RangeError)
  })

  it('等空隙分布：首尾不动，中间的空隙相等', () => {
    const items = [rect(0, 0, 10, 10), rect(100, 0, 30, 10), rect(20, 0, 10, 10), rect(200, 0, 20, 10)]
    const result = distributeRects(items, 'horizontal')
    expect(result.map(p => p.x)).toEqual([0, 120, 60, 200])
    expect(result.every(p => p.y === 0)).toBe(true)
  })

  it('等中心距分布', () => {
    const items = [rect(0, 0, 10, 10), rect(0, 7, 10, 30), rect(0, 100, 10, 10)]
    expect(distributeRects(items, 'vertical', 'center').map(p => p.y)).toEqual([0, 40, 100])
  })

  it('不到三个时原样返回；未知方向或口径报错', () => {
    expect(distributeRects([rect(1, 2, 3, 4), rect(9, 9, 1, 1)], 'horizontal')).toEqual([{ x: 1, y: 2 }, { x: 9, y: 9 }])
    expect(() => distributeRects(rects, 'diagonal' as 'horizontal')).toThrow(RangeError)
    expect(() => distributeRects(rects, 'horizontal', 'edge' as 'gap')).toThrow(RangeError)
  })
})

describe('框选', () => {
  const items = [rect(10, 10, 10, 10), rect(25, 25, 20, 20), rect(100, 100, 5, 5)]

  it('完整包住才选中', () => {
    const marquee = marqueeRect({ x: 50, y: 50 }, { x: 0, y: 0 })
    expect(marquee).toEqual(rect(0, 0, 50, 50))
    expect(selectInMarquee(rect(0, 0, 30, 30), items)).toEqual([0])
  })

  it('碰到即选', () => {
    expect(selectInMarquee(rect(0, 0, 30, 30), items, 'intersect')).toEqual([0, 1])
  })

  it('按拖拽方向决定方式；未知方式报错', () => {
    expect(marqueeModeFromDrag({ x: 0, y: 0 }, { x: 10, y: -5 })).toBe('contain')
    expect(marqueeModeFromDrag({ x: 10, y: 0 }, { x: 0, y: 5 })).toBe('intersect')
    expect(() => selectInMarquee(rect(0, 0, 1, 1), items, 'touch' as 'contain')).toThrow(RangeError)
  })
})
