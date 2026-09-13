/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 tags input 模块的公共接口。

export { tagsInputAnatomy, tagsInputEditInputId } from './tags-input.anatomy'
export { connectTagsInput } from './tags-input.connect'
export { tagsInputKeyboard } from './tags-input.keyboard'
export {
  appendTags,
  isAtMax,
  isOverflow,
  normalizeTag,
  normalizeTags,
  sameTags,
  splitTags,
  TAGS_INPUT_DELIMITER,
  tagsDelimiter,
  tagsInputMachine,
} from './tags-input.machine'
export type { TagsAppendOptions, TagsAppendResult } from './tags-input.machine'
export { tagsInputMeta } from './tags-input.meta'
export type {
  TagsInputApi,
  TagsInputBlurBehavior,
  TagsInputInputValueChangeDetails,
  TagsInputItemProps,
  TagsInputSchema,
  TagsInputTranslations,
  TagsInputValueChangeDetails,
} from './tags-input.types'
