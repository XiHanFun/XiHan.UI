/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/core/rich-text —— 结构化的富文本模型：类型、HTML 白名单解析、结构检查、转义的 HTML 写出与纯文字。
// 不依赖 DOM，浏览器与 Node.js 里都能用；按模型生成 DOM 的渲染在 @xihan-ui/core/rich-text-dom。

export type { RichTextIssue, RichTextIssueCode } from './check'
export { checkRichTextDocument } from './check'
export type { ParseRichTextHtmlResult, RichTextDrop } from './parse'
export { parseRichTextHtml } from './parse'
export type { RichTextPlainTextOptions } from './serialize'
export { richTextPlainText, serializeRichTextHtml } from './serialize'
export type {
  RichBlock,
  RichBreak,
  RichDivider,
  RichFieldRun,
  RichHeading,
  RichInline,
  RichList,
  RichListItem,
  RichMarks,
  RichParagraph,
  RichTextAlign,
  RichTextDocument,
  RichTextRun,
} from './types'
export {
  RICH_BLOCK_TYPES,
  RICH_INLINE_TYPES,
  RICH_MARK_KEYS,
  RICH_TEXT_ALIGNS,
  RICH_TEXT_FONT_SIZE_RANGE,
  RICH_TEXT_MAX_LIST_DEPTH,
} from './types'
export { isRichAlign, isRichColor, isRichFontFamily, isRichFontSize, parseCssColor, parseCssFontSize, RICH_TEXT_FONT_FAMILY_MAX } from './values'
