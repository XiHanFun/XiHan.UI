/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 连线：两点之间的三次贝塞尔（树形连线、桑基流带的中心线）。

import type { Point } from '../geometry'
import type { PathSink } from '../path'
import type { Curve } from './curves'
import { invalidArgument } from '../errors'
import { createSvgPath } from '../path'
import { curveBumpRadial, curveBumpX, curveBumpY } from './curves'

export interface LinkOptions {
  /** horizontal：端点处切线水平；vertical：竖直；radial：点按 [角度, 半径] 给出（角度 0 在 12 点方向）。 */
  readonly orientation: 'horizontal' | 'vertical' | 'radial'
  readonly digits?: number
}

export interface LinkGenerator {
  (source: Point, target: Point): string
  (source: Point, target: Point, sink: PathSink): void
}

const CURVES: Readonly<Record<LinkOptions['orientation'], Curve>> = {
  horizontal: curveBumpX,
  vertical: curveBumpY,
  radial: curveBumpRadial,
}

/** 连线生成器。 */
export function link(options: LinkOptions): LinkGenerator {
  const curve = CURVES[options.orientation]
  if (!curve)
    throw invalidArgument('未知的连线方向', { orientation: options.orientation })
  function run(source: Point, target: Point): string
  function run(source: Point, target: Point, sink: PathSink): void
  function run(source: Point, target: Point, sink?: PathSink): string | void {
    if (sink) {
      curve.draw([source, target], sink, 'area-top')
      return
    }
    const path = createSvgPath(options.digits)
    curve.draw([source, target], path, 'area-top')
    return path.toString()
  }
  return run
}
