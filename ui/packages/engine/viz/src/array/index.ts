/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 array 模块的公共接口。

export { bin } from './bin'
export type { Bin, BinOptions, BinThresholds } from './bin'
export { bisector } from './bisect'
export type { Bisect, Bisector, Comparable } from './bisect'
export { group, index, rollup } from './group'
export { cumsum, deviation, extent, mean, median, quantile, range, sum, variance } from './statistics'
export type { NumericAccessor } from './statistics'
export { nice, tickIncrement, ticks, tickStep } from './ticks'
