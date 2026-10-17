/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 富文本模型：块（段落、标题、列表、分隔线）与行内（文字、字段、换行），整份是 JSON，不含 HTML。

import type { JsonObject } from '../json'

/** 块的水平对齐。 */
export type RichTextAlign = 'left' | 'center' | 'right' | 'justify'

/** 全部对齐取值。 */
export const RICH_TEXT_ALIGNS: readonly RichTextAlign[] = ['left', 'center', 'right', 'justify']

/** 列表最多嵌套几层。 */
export const RICH_TEXT_MAX_LIST_DEPTH = 3

/** 字号（pt）的取值范围。 */
export const RICH_TEXT_FONT_SIZE_RANGE = { min: 1, max: 500 } as const

/**
 * 行内样式。颜色写作 `#RGB`、`#RGBA`、`#RRGGBB` 或 `#RRGGBBAA`；字号单位 pt；
 * 链接只认 `toSafeLinkHref` 放行的地址。上标与下标不同时出现。
 */
export interface RichMarks {
  readonly bold?: boolean
  readonly italic?: boolean
  readonly underline?: boolean
  readonly lineThrough?: boolean
  readonly color?: string
  readonly background?: string
  readonly fontSize?: number
  readonly fontFamily?: string
  readonly superscript?: boolean
  readonly subscript?: boolean
  readonly link?: string
}

/** 全部行内样式的键。 */
export const RICH_MARK_KEYS: readonly (keyof RichMarks)[] = [
  'bold',
  'italic',
  'underline',
  'lineThrough',
  'color',
  'background',
  'fontSize',
  'fontFamily',
  'superscript',
  'subscript',
  'link',
]

/** 一段文字。 */
export interface RichTextRun {
  readonly type: 'text'
  readonly text: string
  readonly marks?: RichMarks
}

/** 行内字段：显示时由使用方按字段路径取值；format 是使用方自己解释的格式说明。 */
export interface RichFieldRun {
  readonly type: 'field'
  readonly field: string
  readonly format?: JsonObject
  readonly marks?: RichMarks
}

/** 行内换行。 */
export interface RichBreak {
  readonly type: 'break'
}

/** 行内内容。 */
export type RichInline = RichTextRun | RichFieldRun | RichBreak

/** 全部行内类型。 */
export const RICH_INLINE_TYPES: readonly RichInline['type'][] = ['text', 'field', 'break']

/** 段落；runs 为空时是一个空行。 */
export interface RichParagraph {
  readonly type: 'paragraph'
  readonly runs: readonly RichInline[]
  readonly align?: RichTextAlign
}

/** 标题，级别 1 到 3。 */
export interface RichHeading {
  readonly type: 'heading'
  readonly level: 1 | 2 | 3
  readonly runs: readonly RichInline[]
  readonly align?: RichTextAlign
}

/** 列表的一项，内容是若干块。 */
export interface RichListItem {
  readonly blocks: readonly RichBlock[]
}

/** 列表：ordered 为 true 时是从 start（缺省 1）开始编号的有序列表。 */
export interface RichList {
  readonly type: 'list'
  readonly ordered: boolean
  readonly start?: number
  readonly items: readonly RichListItem[]
}

/** 分隔线。 */
export interface RichDivider {
  readonly type: 'divider'
}

/** 块。 */
export type RichBlock = RichParagraph | RichHeading | RichList | RichDivider

/** 全部块类型。 */
export const RICH_BLOCK_TYPES: readonly RichBlock['type'][] = ['paragraph', 'heading', 'list', 'divider']

/** 富文本文档。 */
export interface RichTextDocument {
  readonly blocks: readonly RichBlock[]
}
