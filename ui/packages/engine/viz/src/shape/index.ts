/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 shape 模块的公共接口。

export { arc, arcCentroid } from './arc'
export type { ArcParams } from './arc'
export { roundedBar } from './bar'
export type { RoundedBarOptions } from './bar'
export {
  curveBasis,
  curveBumpRadial,
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
  pointRadial,
} from './curves'
export type { Curve, CurveMode } from './curves'
export { area, areaRadial, line, lineRadial } from './line'
export type { AreaOptions, AreaRadialOptions, LineOptions, LineRadialOptions, ShapeGenerator } from './line'
export { link } from './links'
export type { LinkGenerator, LinkOptions } from './links'
export { foldSmall, pie } from './pie'
export type { FoldOptions, FoldResult, PieOptions, PieSlice } from './pie'
export { stack } from './stack'
export type { StackOffset, StackOptions, StackOrder, StackSegment, StackSeries } from './stack'
export { symbol, SYMBOL_NAMES } from './symbol'
export type { SymbolName } from './symbol'
