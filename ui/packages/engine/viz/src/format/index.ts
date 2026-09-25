/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 format 模块的公共接口。

export { createDurationFormat } from './duration'
export type { DurationFormatOptions, DurationUnitTexts } from './duration'
export { createNumberFormat, roundToTotal, tickFormat } from './number'
export type { NumberFormatSpec } from './number'
export { createTimeFormat } from './time'
export type { TimeFormat } from './time'
