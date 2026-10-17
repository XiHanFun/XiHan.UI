/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 array 模块的公共接口。

export { aggregate, AGGREGATE_KINDS, createAccumulator } from './aggregate'
export type { Accumulator, AggregateKind } from './aggregate'
export { bin } from './bin'
export type { Bin, BinOptions, BinThresholds } from './bin'
export { bisector } from './bisect'
export type { Bisect, Bisector, Comparable } from './bisect'
export { compileFilter, FILTER_OPERATORS } from './filter'
export type { CompileFilterOptions, FilterCondition, FilterField, FilterGroup, FilterNode, FilterNormalizer, FilterOperator, FilterParameter, FilterValueType } from './filter'
export { group, index, rollup } from './group'
export { compareMixed, isMissing, tupleKey, valueKey } from './mixed'
export type { CollateOptions, StringCollator } from './mixed'
export { pivotWider } from './pivot'
export type { PivotWiderColumn, PivotWiderOptions, PivotWiderResult } from './pivot'
export { sortBy } from './sort'
export type { NullsPosition, SortDirection, SortKey } from './sort'
export { cumsum, deviation, extent, mean, median, quantile, range, sum, variance } from './statistics'
export type { NumericAccessor } from './statistics'
export { nice, tickIncrement, ticks, tickStep } from './ticks'
