// 引用来源模型。内核只搬运不解释：来源的打开方式是宿主的事。

export interface CitationAnchor {
  readonly sourceId: string
  readonly quote: string
  /** 字符区间。后端切片只有序号没有偏移，当前恒为 undefined。 */
  readonly offset?: { readonly start: number, readonly end: number }
  /** 文档定位符。内核只透传、绝不解释，交给宿主注册的打开器。 */
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
