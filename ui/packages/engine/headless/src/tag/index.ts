/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 tag 模块的公共接口。

export { tagAnatomy } from './tag.anatomy'
export { connectStaticTag, connectTag, tagVariantForControl } from './tag.connect'
export { tagKeyboard } from './tag.keyboard'
export { tagMachine } from './tag.machine'
export { tagMeta } from './tag.meta'
export type { TagApi, TagOpenChangeDetails, TagPressedPart, TagPressPort, TagSchema, TagTranslations, TagVariant } from './tag.types'
