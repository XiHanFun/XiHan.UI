/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 segmented 模块的公共接口。

export { segmentedAnatomy, segmentedItemQuery } from './segmented.anatomy'
export { connectSegmented } from './segmented.connect'
export { segmentedKeyboard } from './segmented.keyboard'
export { segmentedMachine } from './segmented.machine'
export { segmentedMeta } from './segmented.meta'
export type {
  SegmentedApi,
  SegmentedIndicatorRect,
  SegmentedItemProps,
  SegmentedNode,
  SegmentedNodeMeta,
  SegmentedRefs,
  SegmentedSchema,
  SegmentedTranslations,
  SegmentedValueChangeDetails,
} from './segmented.types'
