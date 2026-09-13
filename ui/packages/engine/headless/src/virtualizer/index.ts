/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 virtualizer 模块的公共接口。

export { virtualizerAnatomy } from './virtualizer.anatomy'
export { connectVirtualizer } from './virtualizer.connect'
export {
  expandVirtualizerRange,
  findVirtualizerRange,
  measureVirtualizerItems,
  normalizeVirtualizerMetrics,
  resolveVirtualizerCount,
  resolveVirtualizerEstimate,
  resolveVirtualizerLanes,
  resolveVirtualizerOverscan,
  VIRTUALIZER_DEFAULT_OVERSCAN,
  virtualizerOffsetForItem,
  virtualizerTotalSize,
} from './virtualizer.geometry'
export type {
  VirtualizerAlign,
  VirtualizerMeasurement,
  VirtualizerMetrics,
  VirtualizerRange,
  VirtualizerWindow,
} from './virtualizer.geometry'
export {
  createVirtualizerKernel,
  VIRTUALIZER_INDEX_ATTRIBUTE,
  VIRTUALIZER_SCROLL_IDLE_DELAY,
} from './virtualizer.kernel'
export type { VirtualizerKernel, VirtualizerKernelOptions } from './virtualizer.kernel'
export { virtualizerKeyboard } from './virtualizer.keyboard'
export { virtualizerMachine } from './virtualizer.machine'
export { virtualizerMeta } from './virtualizer.meta'
export {
  findVirtualizerItem,
  VIRTUALIZER_EMPTY_SNAPSHOT,
  virtualizerContentStyle,
  virtualizerItemStyle,
  virtualizerSnapshotEqual,
} from './virtualizer.sizing'
export type { VirtualizerItemState, VirtualizerSnapshot } from './virtualizer.sizing'
export type { VirtualizerApi, VirtualizerChangeDetails, VirtualizerCore, VirtualizerItemProps, VirtualizerRefs, VirtualizerSchema, VirtualizerScrollToOptions, VirtualizerTranslations } from './virtualizer.types'
