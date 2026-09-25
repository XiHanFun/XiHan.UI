/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 折线与面积生成器（直角与径向）：缺失的点处断开，每一段交给曲线写入路径。

import type { Point } from '../geometry'
import type { PathSink } from '../path'
import type { Curve } from './curves'
import { invalidArgument } from '../errors'
import { createSvgPath } from '../path'
import { curveLinear, pointRadial } from './curves'

type Channel<T> = (d: T, i: number) => number

/** 不传 sink 时返回 SVG 路径字符串；传入 sink（如 Canvas 2D 上下文）时直接写入、不返回。 */
export interface ShapeGenerator<T> {
  (data: readonly T[]): string
  (data: readonly T[], sink: PathSink): void
}

export interface LineOptions<T> {
  readonly x: Channel<T>
  readonly y: Channel<T>
  /** 该点是否存在；缺省为 x、y 都是有限数。不存在的点处折线断开，不按 0 连过去。 */
  readonly defined?: (d: T, i: number) => boolean
  /** 缺省 curveLinear。 */
  readonly curve?: Curve
  /** 生成字符串时保留的小数位，缺省 2。 */
  readonly digits?: number
}

function generator<T>(digits: number | undefined, draw: (data: readonly T[], sink: PathSink) => void): ShapeGenerator<T> {
  function run(data: readonly T[]): string
  function run(data: readonly T[], sink: PathSink): void
  function run(data: readonly T[], sink?: PathSink): string | void {
    if (sink) {
      draw(data, sink)
      return
    }
    const path = createSvgPath(digits)
    draw(data, path)
    return path.toString()
  }
  return run
}

/** 把数据切成连续存在的若干段。 */
function runs<T>(data: readonly T[], defined: (d: T, i: number) => boolean): Array<Array<[T, number]>> {
  const out: Array<Array<[T, number]>> = []
  let current: Array<[T, number]> = []
  data.forEach((d, i) => {
    if (defined(d, i)) {
      current.push([d, i])
    }
    else if (current.length > 0) {
      out.push(current)
      current = []
    }
  })
  if (current.length > 0)
    out.push(current)
  return out
}

/** 折线生成器。 */
export function line<T>(options: LineOptions<T>): ShapeGenerator<T> {
  const { x, y, curve = curveLinear } = options
  const defined = options.defined ?? ((d: T, i: number) => Number.isFinite(x(d, i)) && Number.isFinite(y(d, i)))
  return generator<T>(options.digits, (data, sink) => {
    for (const segment of runs(data, defined))
      curve.draw(segment.map(([d, i]): Point => [x(d, i), y(d, i)]), sink, 'line')
  })
}

export interface AreaOptions<T> {
  /** 纵向面积：x 同时作为上下沿的 x；或分别给 x0 / x1。 */
  readonly x?: Channel<T>
  readonly x0?: Channel<T>
  readonly x1?: Channel<T>
  /** 横向面积：y 同时作为两侧的 y；或分别给 y0 / y1。 */
  readonly y?: Channel<T>
  /** 基线。 */
  readonly y0?: Channel<T>
  /** 上沿。 */
  readonly y1?: Channel<T>
  readonly defined?: (d: T, i: number) => boolean
  readonly curve?: Curve
  readonly digits?: number
}

/**
 * 面积生成器：先沿 (x1, y1) 画上沿，再沿 (x0, y0) 反向画回基线，闭合。
 * x0 缺省取 x，x1 缺省取 x0；y0 缺省取 y，y1 缺省取 y0。两个方向都没给时报错。
 */
export function area<T>(options: AreaOptions<T>): ShapeGenerator<T> {
  const x0 = options.x0 ?? options.x
  const y0 = options.y0 ?? options.y
  if (!x0 || !y0)
    throw invalidArgument('面积需要 x（或 x0）与 y（或 y0）', { options: Object.keys(options) })
  const x1 = options.x1 ?? x0
  const y1 = options.y1 ?? y0
  const curve = options.curve ?? curveLinear
  const defined = options.defined
    ?? ((d: T, i: number) => [x0, x1, y0, y1].every(channel => Number.isFinite(channel(d, i))))
  return generator<T>(options.digits, (data, sink) => {
    for (const segment of runs(data, defined)) {
      curve.draw(segment.map(([d, i]): Point => [x1(d, i), y1(d, i)]), sink, 'area-top')
      curve.draw(segment.map(([d, i]): Point => [x0(d, i), y0(d, i)]).reverse(), sink, 'area-bottom')
      sink.closePath()
    }
  })
}

export interface LineRadialOptions<T> {
  /** 角度（弧度），0 在 12 点方向，顺时针为正。 */
  readonly angle: Channel<T>
  readonly radius: Channel<T>
  readonly defined?: (d: T, i: number) => boolean
  readonly curve?: Curve
  readonly digits?: number
}

/** 径向折线（雷达、径向时间线）：极坐标换成直角坐标后交给曲线。 */
export function lineRadial<T>(options: LineRadialOptions<T>): ShapeGenerator<T> {
  const { angle, radius } = options
  return line<T>({
    x: (d, i) => pointRadial(angle(d, i), radius(d, i))[0],
    y: (d, i) => pointRadial(angle(d, i), radius(d, i))[1],
    defined: options.defined ?? ((d, i) => Number.isFinite(angle(d, i)) && Number.isFinite(radius(d, i))),
    curve: options.curve,
    digits: options.digits,
  })
}

export interface AreaRadialOptions<T> {
  readonly angle: Channel<T>
  readonly innerRadius: Channel<T>
  readonly outerRadius: Channel<T>
  readonly defined?: (d: T, i: number) => boolean
  readonly curve?: Curve
  readonly digits?: number
}

/** 径向面积：外沿与内沿之间的区域。 */
export function areaRadial<T>(options: AreaRadialOptions<T>): ShapeGenerator<T> {
  const { angle, innerRadius, outerRadius } = options
  return area<T>({
    x0: (d, i) => pointRadial(angle(d, i), innerRadius(d, i))[0],
    y0: (d, i) => pointRadial(angle(d, i), innerRadius(d, i))[1],
    x1: (d, i) => pointRadial(angle(d, i), outerRadius(d, i))[0],
    y1: (d, i) => pointRadial(angle(d, i), outerRadius(d, i))[1],
    defined: options.defined ?? ((d, i) => [angle, innerRadius, outerRadius].every(channel => Number.isFinite(channel(d, i)))),
    curve: options.curve,
    digits: options.digits,
  })
}
