/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 interpolate 模块的公共接口。

export { interpolateOklab, interpolateOklch } from './color'
export { interpolatePoints } from './points'
export type { KeyedPoint } from './points'
export {
  interpolate,
  interpolateArray,
  interpolateDate,
  interpolateNumber,
  interpolateObject,
  interpolateRound,
  interpolateString,
  piecewise,
  quantize,
} from './value'
export type { Interpolatable, Interpolator } from './value'
