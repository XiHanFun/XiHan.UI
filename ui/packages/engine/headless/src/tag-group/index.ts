/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 tag group 模块的公共接口。

export { tagGroupAnatomy, tagGroupItems, tagGroupItemText } from './tag-group.anatomy'
export { connectTagGroup } from './tag-group.connect'
export { tagGroupKeyboard } from './tag-group.keyboard'
export { normalizeTagSelection, tagGroupMachine } from './tag-group.machine'
export { tagGroupMeta } from './tag-group.meta'
export type { TagGroupApi, TagGroupFocusModel, TagGroupItemDeleteDetails, TagGroupItemProps, TagGroupNode, TagGroupNodeMeta, TagGroupRefs, TagGroupSchema, TagGroupSelectionMode, TagGroupTranslations, TagGroupValueChangeDetails } from './tag-group.types'
