/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 . 模块的公共接口。

export { citationAnatomy, citationSourceQuery, citationSourceText } from './citation.anatomy'
export { citationSourceMetaText, citationSourceTitle, connectCitation } from './citation.connect'
export { citationKeyboard } from './citation.keyboard'
export { CITATION_DEFAULT_PLACEMENT, citationMachine } from './citation.machine'
export { citationMeta } from './citation.meta'
export type {
  CitationActiveSourceChangeDetails,
  CitationApi,
  CitationOpenChangeDetails,
  CitationPreviewMode,
  CitationPreviewProps,
  CitationRefs,
  CitationSchema,
  CitationSource,
  CitationSourceAnchor,
  CitationSourceItemProps,
  CitationSourceOpenDetails,
  CitationTranslations,
  CitationTriggerProps,
  CitationTriggerTarget,
} from './citation.types'
