/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 highlight 模块的公共接口。

export { highlightAnatomy } from './highlight.anatomy'
export { connectHighlight } from './highlight.connect'
export { highlightKeyboard } from './highlight.keyboard'
export { highlightMeta } from './highlight.meta'
export { normalizeHighlightKeywords, splitHighlight } from './highlight.split'
export type { HighlightSegment } from './highlight.split'
export type { HighlightApi, HighlightProps, HighlightTranslations } from './highlight.types'
