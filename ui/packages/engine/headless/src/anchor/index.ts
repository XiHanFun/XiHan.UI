/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 anchor 模块的公共接口。

export { anchorAnatomy, anchorItemQuery } from './anchor.anatomy'
export { connectAnchor } from './anchor.connect'
export { anchorKeyboard } from './anchor.keyboard'
export { ANCHOR_DEFAULT_BOUNDS, ANCHOR_DEFAULT_OFFSET, anchorMachine, resolveActiveAnchor } from './anchor.machine'
export { anchorMeta } from './anchor.meta'
export type {
  AnchorApi,
  AnchorIndicatorRect,
  AnchorLinkProps,
  AnchorRefs,
  AnchorSchema,
  AnchorTargetOffset,
  AnchorTranslations,
  AnchorValueChangeDetails,
} from './anchor.types'
