/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/viz —— 图表引擎：比例尺、刻度、形状、坐标轴布局、拾取与降采样，全部是纯函数。

export * from './array'
export * from './color'

export { isVizError, VizError } from './errors'
export type { VizErrorCode } from './errors'
export * from './format'
export type { Point, Rect } from './geometry'
export * from './interpolate'
export { createSvgPath } from './path'
export type { PathSink, SvgPath } from './path'
export * from './scale'
export * from './shape'
export { createEstimatingMeasurer, ellipsize, wrapText } from './text'
export type { FontSpec, TextMeasurer, TextSize, WrapOptions } from './text'
export * from './time'
