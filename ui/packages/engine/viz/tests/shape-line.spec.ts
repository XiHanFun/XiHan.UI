import type { Curve, PathSink, Point } from '../src'
import { describe, expect, it } from 'vitest'
import {
  area,
  areaRadial,
  curveBasis,
  curveBumpX,
  curveBumpY,
  curveBundle,
  curveCatmullRom,
  curveCatmullRomClosed,
  curveLinear,
  curveLinearClosed,
  curveMonotoneX,
  curveMonotoneY,
  curveStep,
  curveStepAfter,
  curveStepBefore,
  line,
  lineRadial,
  link,
} from '../src'
import { flatten } from './helpers/flatten'
import { between, forAll, integer } from './helpers/property'

type Datum = readonly [number, number]
const X = (d: Datum): number => d[0]
const Y = (d: Datum): number => d[1]

/** 记录每一段三次贝塞尔：起点、两个控制点、终点。 */
function recordBeziers(draw: (sink: PathSink) => void): Array<[Point, Point, Point, Point]> {
  const out: Array<[Point, Point, Point, Point]> = []
  let at: Point = [0, 0]
  const sink: PathSink = {
    moveTo: (x, y) => { at = [x, y] },
    lineTo: (x, y) => { at = [x, y] },
    bezierCurveTo: (x1, y1, x2, y2, x, y) => {
      out.push([at, [x1, y1], [x2, y2], [x, y]])
      at = [x, y]
    },
    quadraticCurveTo: (_x1, _y1, x, y) => { at = [x, y] },
    arc: () => {},
    arcTo: () => {},
    rect: () => {},
    closePath: () => {},
  }
  draw(sink)
  return out
}

function cubic(p: readonly [Point, Point, Point, Point], t: number): Point {
  const u = 1 - t
  const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t]
  return [k.reduce((s, w, i) => s + w * p[i]![0], 0), k.reduce((s, w, i) => s + w * p[i]![1], 0)]
}

describe('折线', () => {
  it('折线按点连接', () => {
    expect(line<Datum>({ x: X, y: Y })([[0, 0], [10, 5], [20, 0]])).toBe('M0,0L10,5L20,0')
  })

  it('缺失的点处断开，不按 0 连过去', () => {
    expect(line<Datum>({ x: X, y: Y })([[0, 0], [10, Number.NaN], [20, 4], [30, 5]])).toBe('M0,0ZM20,4L30,5')
  })

  it('只有一个点时闭合成一个点（配合圆头端点显示为圆点）', () => {
    expect(line<Datum>({ x: X, y: Y })([[3, 4]])).toBe('M3,4Z')
  })

  it('自定义 defined 与小数位', () => {
    const gen = line<Datum>({ x: X, y: Y, defined: d => d[1] >= 0, digits: 0 })
    expect(gen([[0.4, 1.6], [1, -1], [2.2, 2.7]])).toBe('M0,2ZM2,3Z')
  })

  it('传入 sink 时直接写入、不返回字符串', () => {
    const sink = flatten()
    expect(line<Datum>({ x: X, y: Y })([[0, 0], [1, 1]], sink)).toBeUndefined()
    expect(sink.points()).toEqual([[0, 0], [1, 1]])
  })

  it('径向折线：角度 0 在 12 点方向、顺时针为正', () => {
    const gen = lineRadial<Datum>({ angle: d => d[0], radius: d => d[1] })
    expect(gen([[0, 10], [Math.PI / 2, 10]])).toBe('M0,-10L10,0')
  })
})

describe('面积', () => {
  it('先画上沿，再反向画回基线，闭合', () => {
    const gen = area<Datum>({ x: X, y0: () => 100, y1: Y })
    expect(gen([[0, 10], [10, 20]])).toBe('M0,10L10,20L10,100L0,100Z')
  })

  it('缺失处分成两块', () => {
    const gen = area<Datum>({ x: X, y0: () => 0, y1: Y })
    expect(gen([[0, 1], [1, Number.NaN], [2, 3], [3, 4]]).match(/M/g)).toHaveLength(2)
  })

  it('横向面积用 x0 / x1 与 y', () => {
    const gen = area<Datum>({ y: Y, x0: () => 0, x1: X })
    expect(gen([[5, 0], [8, 10]])).toBe('M5,0L8,10L0,10L0,0Z')
  })

  it('两个方向都没给时报错', () => {
    expect(() => area<Datum>({ x: X })).toThrow(/y/)
  })

  it('性质：折线面积的面积等于梯形之和，阶梯面积等于值乘步宽之和', () => {
    forAll(200, 79, (random) => {
      const n = integer(random, 2, 20)
      let x = 0
      return Array.from({ length: n }, (): Datum => [(x += between(random, 1, 10)), between(random, 1, 50)])
    }, (data) => {
      const linear = flatten()
      area<Datum>({ x: X, y0: () => 0, y1: Y })(data, linear)
      let trapezoids = 0
      let steps = 0
      for (let i = 1; i < data.length; i++) {
        const w = data[i]![0] - data[i - 1]![0]
        trapezoids += (w * (data[i]![1] + data[i - 1]![1])) / 2
        steps += w * data[i - 1]![1]
      }
      expect(linear.area()).toBeCloseTo(trapezoids, 6)
      const stepped = flatten()
      area<Datum>({ x: X, y0: () => 0, y1: Y, curve: curveStepAfter })(data, stepped)
      expect(stepped.area()).toBeCloseTo(steps, 6)
    })
  })

  it('径向面积：外沿与内沿之间', () => {
    const gen = areaRadial<Datum>({ angle: d => d[0], innerRadius: () => 5, outerRadius: d => d[1] })
    expect(gen([[0, 10], [Math.PI / 2, 10]])).toBe('M0,-10L10,0L5,0L0,-5Z')
  })
})

describe('曲线', () => {
  const draw = (curve: Curve, points: Point[]): string => line<Point>({ x: p => p[0], y: p => p[1], curve })(points)

  it('阶梯的三种转折位置', () => {
    const pts: Point[] = [[0, 0], [10, 10]]
    expect(draw(curveStep, pts)).toBe('M0,0L5,0L5,10L10,10')
    expect(draw(curveStepBefore, pts)).toBe('M0,0L0,10L10,10')
    expect(draw(curveStepAfter, pts)).toBe('M0,0L10,0L10,10')
  })

  it('闭合折线回到起点', () => {
    expect(draw(curveLinearClosed, [[0, 0], [10, 0], [5, 5]])).toBe('M0,0L10,0L5,5Z')
  })

  it('单调插值经过每个数据点', () => {
    const pts: Point[] = [[0, 0], [1, 3], [2, 2], [4, 8]]
    const segments = recordBeziers(sink => line<Point>({ x: p => p[0], y: p => p[1], curve: curveMonotoneX })(pts, sink))
    expect(segments.map(s => s[3])).toEqual(pts.slice(1))
    expect(segments[0]![0]).toEqual(pts[0])
  })

  it('性质：单调插值不越过数据点（每段都落在两端点的值之间）', () => {
    forAll(400, 83, (random) => {
      const n = integer(random, 3, 15)
      let x = 0
      return Array.from({ length: n }, (): Point => [(x += between(random, 0.5, 5)), random() < 0.2 ? 5 : between(random, -50, 50)])
    }, (pts) => {
      const segments = recordBeziers(sink => line<Point>({ x: p => p[0], y: p => p[1], curve: curveMonotoneX })(pts, sink))
      segments.forEach((segment) => {
        const low = Math.min(segment[0][1], segment[3][1])
        const high = Math.max(segment[0][1], segment[3][1])
        for (let t = 0; t <= 1; t += 0.05) {
          const [, y] = cubic(segment, t)
          expect(y).toBeGreaterThanOrEqual(low - 1e-9)
          expect(y).toBeLessThanOrEqual(high + 1e-9)
        }
      })
    })
  })

  it('沿 y 单调的插值是沿 x 的转置', () => {
    const pts: Point[] = [[0, 0], [3, 1], [2, 2], [8, 4]]
    const transposed = pts.map(([x, y]): Point => [y, x])
    const a = recordBeziers(sink => line<Point>({ x: p => p[0], y: p => p[1], curve: curveMonotoneY })(pts, sink))
    const b = recordBeziers(sink => line<Point>({ x: p => p[0], y: p => p[1], curve: curveMonotoneX })(transposed, sink))
    expect(a.map(s => s.map(([x, y]) => [y, x]))).toEqual(b)
  })

  it('catmull–Rom 经过每个数据点，闭合版首尾相接', () => {
    const pts: Point[] = [[0, 0], [10, 10], [20, 0], [30, 10]]
    const segments = recordBeziers(sink => line<Point>({ x: p => p[0], y: p => p[1], curve: curveCatmullRom })(pts, sink))
    expect(segments.map(s => s[3])).toEqual(pts.slice(1))
    const closed = recordBeziers(sink => line<Point>({ x: p => p[0], y: p => p[1], curve: curveCatmullRomClosed })(pts, sink))
    expect(closed).toHaveLength(4)
    expect(closed[3]![3]).toEqual(pts[0])
  })

  it('b 样条从首点出发、到末点结束，只逼近中间的点', () => {
    const pts: Point[] = [[0, 0], [10, 20], [20, 0]]
    const sink = flatten()
    line<Point>({ x: p => p[0], y: p => p[1], curve: curveBasis })(pts, sink)
    const all = sink.points()
    expect(all[0]).toEqual([0, 0])
    expect(all[all.length - 1]).toEqual([20, 0])
    expect(Math.max(...all.map(p => p[1]))).toBeLessThan(20)
  })

  it('捆绑强度为 0 时拉成首尾之间的直线', () => {
    const sink = flatten()
    line<Point>({ x: p => p[0], y: p => p[1], curve: curveBundle(0) })([[0, 0], [5, 40], [10, -40], [20, 20]], sink)
    for (const [x, y] of sink.points())
      expect(y).toBeCloseTo(x, 6)
    expect(() => curveBundle(2)).toThrow(/beta/)
  })

  it('bump 曲线的控制点在中线上', () => {
    expect(draw(curveBumpX, [[0, 0], [10, 10]])).toBe('M0,0C5,0,5,10,10,10')
    expect(draw(curveBumpY, [[0, 0], [10, 10]])).toBe('M0,0C0,5,10,5,10,10')
  })

  it('曲线的少点退化：少于三个点时画直线', () => {
    expect(draw(curveMonotoneX, [[0, 0], [10, 10]])).toBe(draw(curveLinear, [[0, 0], [10, 10]]))
    expect(draw(curveCatmullRom, [[0, 0], [10, 10]])).toBe('M0,0L10,10')
  })
})

describe('连线', () => {
  it('横向与纵向连线', () => {
    expect(link({ orientation: 'horizontal' })([0, 0], [10, 20])).toBe('M0,0C5,0,5,20,10,20')
    expect(link({ orientation: 'vertical' })([0, 0], [10, 20])).toBe('M0,0C0,10,10,10,10,20')
  })

  it('径向连线的点按 [角度, 半径] 给出', () => {
    expect(link({ orientation: 'radial' })([0, 10], [Math.PI / 2, 20])).toBe('M0,-10C0,-15,15,0,20,0')
  })
})
