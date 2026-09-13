/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 mention 模块的公共接口。

export { mentionAnatomy, mentionItemQuery, mentionItemText } from './mention.anatomy'
export { connectMention } from './mention.connect'
export { mentionKeyboard } from './mention.keyboard'
export { MENTION_DEFAULT_PLACEMENT, mentionMachine } from './mention.machine'
export { mentionMeta } from './mention.meta'
export { findMentionTrigger, insertMention, MENTION_DEFAULT_PREFIX, normalizeMentionPrefixes } from './mention.trigger'
export type {
  MentionApi,
  MentionInputEl,
  MentionItemProps,
  MentionNode,
  MentionNodeMeta,
  MentionOpenChangeDetails,
  MentionQueryChangeDetails,
  MentionRefs,
  MentionSchema,
  MentionSelectDetails,
  MentionTranslations,
  MentionTrigger,
  MentionValueChangeDetails,
} from './mention.types'
