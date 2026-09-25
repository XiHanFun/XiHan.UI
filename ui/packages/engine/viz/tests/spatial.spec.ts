import type { Mark, Point } from '../src'
import { describe, expect, it } from 'vitest'
import { createPicker, createQuadtree, createScene, pointInArc, pointInPolygon, polygonArea, polygonCentroid } from '../src'
import { between, forAll, integer } from './helpers/property'

describe('四叉树', () => {
  it('最近点与半径限制', () => {
    const points: Point[] = [[0, 0], [10, 0], [5, 5]]
    const tree = createQuadtree(points, p => p[0], p => p[1])
    expect(tree.size).toBe(3)
    expect(tree.find(9, 1)?.index).toBe(1)
    expect(tree.find(50, 50, 5)).toBeUndefined()
    expect(tree.findAll(5, 1, 5.2).map(h => h.index)).toEqual([2, 0, 1])
  })

  it('距离相同取输入里靠前的；坐标非有限的点不进树', () => {
    const tree = createQuadtree<Point>([[0, 0], [2, 0], [Number.NaN, 1]], p => p[0], p => p[1])
    expect(tree.size).toBe(2)
    expect(tree.find(1, 0)?.index).toBe(0)
  })

  it('空树', () => {
    expect(createQuadtree<Point>([], p => p[0], p => p[1]).find(0, 0)).toBeUndefined()
  })

  it('visit 先序遍历，返回 true 时跳过子节点', () => {
    const points = Array.from({ length: 100 }, (_, i): Point => [i % 10, Math.floor(i / 10)])
    const tree = createQuadtree(points, p => p[0], p => p[1])
    let leaves = 0
    let seen = 0
    tree.visit((node) => {
      if (node.items) {
        leaves++
        seen += node.items.length
      }
    })
    expect(leaves).toBeGreaterThan(1)
    expect(seen).toBe(100)
    let visits = 0
    tree.visit(() => {
      visits++
      return true
    })
    expect(visits).toBe(1)
  })

  it('性质：find 与暴力搜索的结果一致', () => {
    forAll(300, 137, random => ({
      points: Array.from({ length: integer(random, 1, 400) }, (): Point => [between(random, -500, 500), between(random, -500, 500)]),
      q: [between(random, -600, 600), between(random, -600, 600)] as Point,
      radius: random() < 0.5 ? Number.POSITIVE_INFINITY : between(random, 0, 200),
    }), ({ points, q, radius }) => {
      const tree = createQuadtree(points, p => p[0], p => p[1])
      let best = -1
      let bestDistance = Number.POSITIVE_INFINITY
      points.forEach(([x, y], i) => {
        const d = Math.hypot(x - q[0], y - q[1])
        if (d < bestDistance) {
          best = i
          bestDistance = d
        }
      })
      const hit = tree.find(q[0], q[1], radius)
      if (bestDistance <= radius)
        expect(hit?.index).toBe(best)
      else
        expect(hit).toBeUndefined()
    })
  })
})

describe('几何判定', () => {
  it('点在扇区内：角度 0 在 12 点方向、顺时针为正', () => {
    const quarter = { innerRadius: 10, outerRadius: 20, startAngle: 0, endAngle: Math.PI / 2 }
    expect(pointInArc(10, -10, quarter)).toBe(true)
    expect(pointInArc(-10, -10, quarter)).toBe(false)
    expect(pointInArc(2, -2, quarter)).toBe(false)
    expect(pointInArc(0, -25, quarter)).toBe(false)
    expect(pointInArc(-10, 10, { ...quarter, startAngle: Math.PI, endAngle: 1.5 * Math.PI })).toBe(true)
    expect(pointInArc(-10, -10, { ...quarter, startAngle: 0, endAngle: -Math.PI / 2 })).toBe(true)
    expect(pointInArc(3, 3, { innerRadius: 0, outerRadius: 5, startAngle: 1, endAngle: 1 + 2 * Math.PI })).toBe(true)
  })

  it('点在多边形内、面积与形心', () => {
    const square: Point[] = [[0, 0], [10, 0], [10, 10], [0, 10]]
    expect(pointInPolygon(5, 5, square)).toBe(true)
    expect(pointInPolygon(15, 5, square)).toBe(false)
    expect(polygonArea(square)).toBe(100)
    expect(polygonArea([...square].reverse())).toBe(-100)
    expect(polygonCentroid(square)).toEqual([5, 5])
    expect(polygonCentroid([[0, 0], [2, 0], [4, 0]])).toEqual([2, 0])
  })
})

describe('拾取器', () => {
  const bounds = { x: 0, y: 0, width: 300, height: 200 }
  const bar = (key: string, x: number, height: number, seriesId = 's1', y?: number): Mark => ({
    kind: 'rect',
    key,
    part: 'bar',
    x,
    y: y ?? 200 - height,
    width: 20,
    height,
    datum: { seriesId, index: 0 },
  })

  it('柱按整条带命中：很短的柱也能在带内任意高度命中', () => {
    const picker = createPicker(createScene({ version: 1, layers: { data: [bar('a', 10, 3), bar('b', 50, 120)] }, bounds }))
    expect(picker.pick(20, 20).map(h => h.key)).toEqual(['a'])
    expect(picker.pick(40, 20)).toEqual([])
    expect(picker.pick(60, 150)[0]).toMatchObject({ key: 'b', x: 60, y: 80, distance: 0 })
  })

  it('堆叠的柱：指针落在哪段就是哪段，axis 模式报告整列', () => {
    const scene = createScene({ version: 1, layers: { data: [bar('low', 10, 50, 's1'), bar('high', 10, 50, 's2', 100)] }, bounds })
    const picker = createPicker(scene)
    expect(picker.pick(20, 120)[0]?.key).toBe('high')
    expect(picker.pick(20, 180)[0]?.key).toBe('low')
    expect(picker.pick(20, 10, { mode: 'axis' }).map(h => h.key).sort()).toEqual(['high', 'low'])
  })

  it('折线按 x 取最近键，item 模式再按 y 取最近系列，axis 模式报告该键上的全部系列', () => {
    const line = (key: string, ys: number[]): Mark => ({
      kind: 'line',
      key,
      part: 'line',
      curve: 'linear',
      datum: { seriesId: key, index: 0 },
      points: ys.map((y, i) => ({ key: `k${i}`, x: i * 100, y })),
    })
    const picker = createPicker(createScene({ version: 1, layers: { data: [line('up', [150, 100, 50]), line('down', [50, 100, 190])] }, bounds }))
    expect(picker.pick(190, 60)[0]).toMatchObject({ key: 'up', pointKey: 'k2', datum: { seriesId: 'up', index: 2 }, x: 200, y: 50 })
    expect(picker.pick(190, 180)[0]?.key).toBe('down')
    expect(picker.pick(40, 0, { mode: 'axis' }).map(h => [h.key, h.pointKey])).toEqual([['down', 'k0'], ['up', 'k0']])
    expect(picker.pick(400, 60)).toEqual([])
  })

  it('散点用最近点，命中半径 = max（外延 + 2，最小半径），粗指针更大', () => {
    const dot = (key: string, x: number, y: number): Mark => ({ kind: 'symbol', key, part: 'point', x, y, size: 50, symbol: 'circle' })
    const picker = createPicker(createScene({ version: 1, layers: { data: [dot('p', 100, 100), dot('q', 200, 100)] }, bounds }))
    expect(picker.pick(110, 100)[0]?.key).toBe('p')
    expect(picker.pick(115, 100)).toEqual([])
    expect(picker.pick(115, 100, { pointerType: 'touch' })[0]?.key).toBe('p')
  })

  it('扇区按极坐标判定，锚点在扇区中线的中点', () => {
    const slice: Mark = { kind: 'arc', key: 'slice', part: 'slice', cx: 100, cy: 100, innerRadius: 40, outerRadius: 80, startAngle: 0, endAngle: Math.PI / 2 }
    const picker = createPicker(createScene({ version: 1, layers: { data: [slice] }, bounds }))
    const hit = picker.pick(150, 60)[0]!
    expect(hit.key).toBe('slice')
    expect(hit.x).toBeCloseTo(100 + 60 * Math.SQRT1_2, 9)
    expect(picker.pick(100, 100)).toEqual([])
  })

  it('分组的平移、退场与不可聚焦的标记、非数据层都不参与命中', () => {
    const scene = createScene({
      version: 1,
      layers: {
        back: [bar('grid', 100, 200)],
        data: [
          { kind: 'group', key: 'g', part: 'series', x: 100, y: 0, children: [bar('moved', 0, 50)] },
          { ...bar('gone', 200, 50), exiting: true } as Mark,
          { ...bar('muted', 250, 50), a11y: { label: 'x', focusable: false } } as Mark,
        ],
      },
      bounds,
    })
    const picker = createPicker(scene)
    expect(picker.pick(110, 190)[0]?.key).toBe('moved')
    expect(picker.pick(210, 190)).toEqual([])
    expect(picker.pick(260, 190)).toEqual([])
  })

  it('负的命中半径报错；非有限的指针坐标不命中', () => {
    expect(() => createPicker(createScene({ version: 1, layers: {}, bounds }), { radius: -1 })).toThrow(/半径/)
    expect(createPicker(createScene({ version: 1, layers: { data: [bar('a', 10, 30)] }, bounds })).pick(Number.NaN, 0)).toEqual([])
  })
})
