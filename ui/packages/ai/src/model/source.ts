// 引用来源模型。

export interface CitationAnchor {
  readonly sourceId: string
  readonly quote: string
  /** 引文在原文中的字符区间。 */
  readonly offset?: { readonly start: number, readonly end: number }
  /** 文档定位符，原样透传给宿主。 */
  readonly locator?: unknown
}

export interface SourceUrlPart {
  readonly type: 'source-url'
  readonly sourceId: string
  readonly url: string
  readonly title?: string
}

export interface SourceDocumentPart {
  readonly type: 'source-document'
  readonly sourceId: string
  readonly title?: string
  readonly mediaType?: string
  readonly anchors?: readonly CitationAnchor[]
}

export type SourcePart = SourceUrlPart | SourceDocumentPart
