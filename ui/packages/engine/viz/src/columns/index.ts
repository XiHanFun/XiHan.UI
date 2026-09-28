/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/viz/columns —— 大数据：列式数据仓与流式追加、有序列二分、分块极值、按像素降采样、
// K 线与柱的合并、散点稀疏、像素网格拾取与等距时间刻度。全部在类型化数组上做，不为每个点建对象。

export { bisectLeft, bisectRight, isAscending, nearestIndex } from './bisect'
export { bucketOhlc, bucketPeak, bucketSize } from './bucket'
export type { OhlcBuckets, PeakBuckets } from './bucket'
export { decimateLine } from './decimate'
export type { DecimateOptions, Decimation } from './decimate'
export { createExtentIndex, EXTENT_BLOCK } from './extent'
export type { ExtentIndex, RangeExtent } from './extent'
export { ordinalTimeTicks } from './ordinal-ticks'
export type { OrdinalTickOptions, OrdinalTicks } from './ordinal-ticks'
export { createPointIndex } from './point-index'
export type { PointIndex } from './point-index'
export { createColumnStore, isColumnSource } from './store'
export type { ColumnRow, ColumnSource, ColumnStore, ColumnStoreOptions, ColumnValue } from './store'
export { thinPoints } from './thin'
export type { ThinnedPoints, ThinOptions } from './thin'
