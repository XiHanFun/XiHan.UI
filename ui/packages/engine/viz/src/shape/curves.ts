/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 曲线：把一段连续的点写成路径。数据曲线的「平滑」只用单调三次插值，不越过数据点；自然三次样条会制造不存在的极值，不提供。

import type { Point } from '../geometry'
import type { PathSink } from '../path'
import { invalidArgument } from '../errors'

/**
 * line：独立折线，只有一个点时闭合成一个点（配合圆头端点画出圆点）；
 * area-top：面积的上沿，从起点 moveTo；area-bottom：面积的回程基线，点序已反转，第一点用 lineTo 接上。
 */
export type CurveMode = 'line' | 'area-top' | 'area-bottom'

export interface Curve {
  readonly name: string
  readonly draw: (points: readonly Point[], sink: PathSink, mode: CurveMode) => void
}

function begin(sink: PathSink, mode: CurveMode, [x, y]: Point): void {
  if (mode === 'area-bottom')
    sink.lineTo(x, y)
  else
    sink.moveTo(x, y)
}

function finish(sink: PathSink, mode: CurveMode, count: number): void {
  if (mode === 'line' && count === 1)
    sink.closePath()
}

function at(points: readonly Point[], i: number): Point {
  return points[i] as Point
}

function drawLinear(points: readonly Point[], sink: PathSink, mode: CurveMode): void {
  if (points.length === 0)
    return
  begin(sink, mode, at(points, 0))
  for (let i = 1; i < points.length; i++)
    sink.lineTo(at(points, i)[0], at(points, i)[1])
  finish(sink, mode, points.length)
}

/** 折线。 */
export const curveLinear: Curve = Object.freeze({ name: 'linear', draw: drawLinear })

/** 闭合折线（雷达的缺省）。 */
export const curveLinearClosed: Curve = Object.freeze({
  name: 'linearClosed',
  draw(points: readonly Point[], sink: PathSink, mode: CurveMode) {
    if (points.length === 0)
      return
    drawLinear(points, sink, mode === 'line' ? 'area-top' : mode)
    sink.closePath()
  },
})

/** 阶梯：t 是转折处在两点之间的位置（0 先竖后横，1 先横后竖）；面积回程点序反转，t 随之取 1 − t。 */
function stepCurve(name: string, t: number): Curve {
  return Object.freeze({
    name,
    draw(points: readonly Point[], sink: PathSink, mode: CurveMode) {
      if (points.length === 0)
        return
      const s = mode === 'area-bottom' ? 1 - t : t
      begin(sink, mode, at(points, 0))
      for (let i = 1; i < points.length; i++) {
        const [x0, y0] = at(points, i - 1)
        const [x1, y1] = at(points, i)
        const xm = x0 * (1 - s) + x1 * s
        if (xm !== x0)
          sink.lineTo(xm, y0)
        sink.lineTo(xm, y1)
        if (xm !== x1)
          sink.lineTo(x1, y1)
      }
      finish(sink, mode, points.length)
    },
  })
}

/** 阶梯，转折在两点正中。 */
export const curveStep: Curve = stepCurve('step', 0.5)
/** 阶梯，先竖后横：值在自变量到达之前就已变化。 */
export const curveStepBefore: Curve = stepCurve('stepBefore', 0)
/** 阶梯，先横后竖：值保持到下一个自变量才变化（价格档位、状态）。 */
export const curveStepAfter: Curve = stepCurve('stepAfter', 1)

/**
 * Fritsch–Carlson 单调三次插值：先取相邻割线斜率的平均作切线，极值点切线置 0，
 * 再把 (α, β) 收进半径 3 的圆内，使每一段在数据单调的区间里保持单调，曲线不越过数据点。
 */
function drawMonotone(points: readonly Point[], sink: PathSink, mode: CurveMode, transpose: boolean): void {
  const n = points.length
  if (n < 3) {
    drawLinear(points, sink, mode)
    return
  }
  const xs = points.map(p => (transpose ? p[1] : p[0]))
  const ys = points.map(p => (transpose ? p[0] : p[1]))
  const secant: number[] = []
  for (let k = 0; k < n - 1; k++) {
    const h = (xs[k + 1] as number) - (xs[k] as number)
    secant.push(h === 0 ? 0 : ((ys[k + 1] as number) - (ys[k] as number)) / h)
  }
  const tangent: number[] = Array.from<number>({ length: n }).fill(0)
  tangent[0] = secant[0] as number
  tangent[n - 1] = secant[n - 2] as number
  for (let k = 1; k < n - 1; k++) {
    const a = secant[k - 1] as number
    const b = secant[k] as number
    tangent[k] = a * b <= 0 ? 0 : (a + b) / 2
  }
  for (let k = 0; k < n - 1; k++) {
    const delta = secant[k] as number
    if (delta === 0) {
      tangent[k] = 0
      tangent[k + 1] = 0
      continue
    }
    const alpha = (tangent[k] as number) / delta
    const beta = (tangent[k + 1] as number) / delta
    const radius = alpha * alpha + beta * beta
    if (radius > 9) {
      const tau = 3 / Math.sqrt(radius)
      tangent[k] = tau * alpha * delta
      tangent[k + 1] = tau * beta * delta
    }
  }
  const emit = (x: number, y: number): Point => (transpose ? [y, x] : [x, y])
  begin(sink, mode, at(points, 0))
  for (let k = 0; k < n - 1; k++) {
    const x0 = xs[k] as number
    const x1 = xs[k + 1] as number
    const y0 = ys[k] as number
    const y1 = ys[k + 1] as number
    const h = (x1 - x0) / 3
    const c1 = emit(x0 + h, y0 + (tangent[k] as number) * h)
    const c2 = emit(x1 - h, y1 - (tangent[k + 1] as number) * h)
    const end = emit(x1, y1)
    sink.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], end[0], end[1])
  }
}

/** 沿 x 单调的平滑曲线：数据曲线「平滑」的唯一实现。 */
export const curveMonotoneX: Curve = Object.freeze({
  name: 'monotoneX',
  draw: (points: readonly Point[], sink: PathSink, mode: CurveMode) => drawMonotone(points, sink, mode, false),
})

/** 沿 y 单调的平滑曲线（横向图）。 */
export const curveMonotoneY: Curve = Object.freeze({
  name: 'monotoneY',
  draw: (points: readonly Point[], sink: PathSink, mode: CurveMode) => drawMonotone(points, sink, mode, true),
})

const EPSILON = 1e-12

/**
 * 向心 Catmull–Rom（α = 0.5）的一段：p1 → p2，p0、p3 为两侧邻点，换算成三次贝塞尔。
 * 参数按弦长的平方根取，曲线不打结、不在急转处出尖。
 */
function catmullRomSegment(sink: PathSink, p0: Point, p1: Point, p2: Point, p3: Point): void {
  const d01 = Math.sqrt(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]))
  const d12 = Math.sqrt(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]))
  const d23 = Math.sqrt(Math.hypot(p3[0] - p2[0], p3[1] - p2[1]))
  let c1: Point = p1
  let c2: Point = p2
  if (d01 > EPSILON) {
    const a = 2 * d01 * d01 + 3 * d01 * d12 + d12 * d12
    const n = 3 * d01 * (d01 + d12)
    c1 = [(p1[0] * a - p0[0] * d12 * d12 + p2[0] * d01 * d01) / n, (p1[1] * a - p0[1] * d12 * d12 + p2[1] * d01 * d01) / n]
  }
  if (d23 > EPSILON) {
    const b = 2 * d23 * d23 + 3 * d23 * d12 + d12 * d12
    const m = 3 * d23 * (d23 + d12)
    c2 = [(p2[0] * b + p1[0] * d23 * d23 - p3[0] * d12 * d12) / m, (p2[1] * b + p1[1] * d23 * d23 - p3[1] * d12 * d12) / m]
  }
  sink.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p2[0], p2[1])
}

/** 平滑且不打结的曲线（雷达平滑）。两端用端点自身作邻点。 */
export const curveCatmullRom: Curve = Object.freeze({
  name: 'catmullRom',
  draw(points: readonly Point[], sink: PathSink, mode: CurveMode) {
    const n = points.length
    if (n < 3) {
      drawLinear(points, sink, mode)
      return
    }
    begin(sink, mode, at(points, 0))
    for (let i = 0; i < n - 1; i++)
      catmullRomSegment(sink, at(points, Math.max(0, i - 1)), at(points, i), at(points, i + 1), at(points, Math.min(n - 1, i + 2)))
  },
})

/** 闭合的向心 Catmull–Rom，首尾互为邻点。 */
export const curveCatmullRomClosed: Curve = Object.freeze({
  name: 'catmullRomClosed',
  draw(points: readonly Point[], sink: PathSink, mode: CurveMode) {
    const n = points.length
    if (n < 3) {
      curveLinearClosed.draw(points, sink, mode)
      return
    }
    begin(sink, mode === 'line' ? 'area-top' : mode, at(points, 0))
    for (let i = 0; i < n; i++)
      catmullRomSegment(sink, at(points, (i - 1 + n) % n), at(points, i), at(points, (i + 1) % n), at(points, (i + 2) % n))
    sink.closePath()
  },
})

/** 均匀三次 B 样条，首尾钳在端点上。曲线只逼近中间的点，不经过它们。 */
function drawBasis(points: readonly Point[], sink: PathSink, mode: CurveMode): void {
  const n = points.length
  if (n < 3) {
    drawLinear(points, sink, mode)
    return
  }
  const [x0, y0] = at(points, 0)
  const [x1, y1] = at(points, 1)
  begin(sink, mode, [x0, y0])
  sink.lineTo((5 * x0 + x1) / 6, (5 * y0 + y1) / 6)
  const segment = (a: Point, b: Point, c: Point): void => {
    sink.bezierCurveTo(
      (2 * a[0] + b[0]) / 3,
      (2 * a[1] + b[1]) / 3,
      (a[0] + 2 * b[0]) / 3,
      (a[1] + 2 * b[1]) / 3,
      (a[0] + 4 * b[0] + c[0]) / 6,
      (a[1] + 4 * b[1] + c[1]) / 6,
    )
  }
  for (let i = 2; i < n; i++)
    segment(at(points, i - 2), at(points, i - 1), at(points, i))
  const last = at(points, n - 1)
  segment(at(points, n - 2), last, last)
  sink.lineTo(last[0], last[1])
}

/** B 样条（关系图的边捆绑、平滑的层级连线）。 */
export const curveBasis: Curve = Object.freeze({ name: 'basis', draw: drawBasis })

/**
 * 捆绑曲线：先把控制点朝首尾连线拉直（beta = 1 不拉直，0 拉成直线），再画 B 样条。
 * 用于关系图的边捆绑：beta 越小，同向的边越聚成一束。
 */
export function curveBundle(beta = 0.85): Curve {
  if (!(beta >= 0 && beta <= 1))
    throw invalidArgument('捆绑强度 beta 必须在 [0, 1] 内', { beta })
  return Object.freeze({
    name: 'bundle',
    draw(points: readonly Point[], sink: PathSink, mode: CurveMode) {
      const n = points.length
      if (n < 3) {
        drawLinear(points, sink, mode)
        return
      }
      const [x0, y0] = at(points, 0)
      const [xn, yn] = at(points, n - 1)
      const straightened = points.map(([x, y], i): Point => {
        const t = i / (n - 1)
        return [beta * x + (1 - beta) * (x0 + t * (xn - x0)), beta * y + (1 - beta) * (y0 + t * (yn - y0))]
      })
      drawBasis(straightened, sink, mode)
    },
  })
}

/** 相邻两点之间的三次贝塞尔：控制点在两点横向（或纵向）的中线上，端点处切线水平（或竖直）。 */
function bumpCurve(name: string, vertical: boolean): Curve {
  return Object.freeze({
    name,
    draw(points: readonly Point[], sink: PathSink, mode: CurveMode) {
      if (points.length === 0)
        return
      begin(sink, mode, at(points, 0))
      for (let i = 1; i < points.length; i++) {
        const [x0, y0] = at(points, i - 1)
        const [x1, y1] = at(points, i)
        if (vertical) {
          const ym = (y0 + y1) / 2
          sink.bezierCurveTo(x0, ym, x1, ym, x1, y1)
        }
        else {
          const xm = (x0 + x1) / 2
          sink.bezierCurveTo(xm, y0, xm, y1, x1, y1)
        }
      }
      finish(sink, mode, points.length)
    },
  })
}

/** 横向连接（桑基流带、横向树）。 */
export const curveBumpX: Curve = bumpCurve('bumpX', false)
/** 纵向连接（纵向树）。 */
export const curveBumpY: Curve = bumpCurve('bumpY', true)

/** 极坐标 → 屏幕坐标：角度 0 在 12 点方向，顺时针为正。 */
export function pointRadial(angle: number, radius: number): Point {
  return [radius * Math.sin(angle), -radius * Math.cos(angle)]
}

/** 径向连接：点按 [角度, 半径] 给出，控制点取两点半径的中值（径向树）。 */
export const curveBumpRadial: Curve = Object.freeze({
  name: 'bumpRadial',
  draw(points: readonly Point[], sink: PathSink, mode: CurveMode) {
    if (points.length === 0)
      return
    const first = at(points, 0)
    begin(sink, mode, pointRadial(first[0], first[1]))
    for (let i = 1; i < points.length; i++) {
      const [a0, r0] = at(points, i - 1)
      const [a1, r1] = at(points, i)
      const rm = (r0 + r1) / 2
      const c1 = pointRadial(a0, rm)
      const c2 = pointRadial(a1, rm)
      const end = pointRadial(a1, r1)
      sink.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], end[0], end[1])
    }
    finish(sink, mode, points.length)
  },
})
