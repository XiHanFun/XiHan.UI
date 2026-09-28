/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 citation 类型契约。

import type { Direction, MachineSchema, PropTypes, Size } from '@xihan-ui/core'

/** 与 @xihan-ui/chat-stream 的 CitationAnchor 结构兼容，不让 Headless 反向依赖 feature 包。 */
export interface CitationSourceAnchor {
  readonly sourceId: string
  readonly quote: string
  readonly offset?: { readonly start: number, readonly end: number }
  readonly locator?: unknown
}

/**
 * 来源数据的最小结构。SourcePart 可直接赋给本类型，无需复制或转换。
 * URL 与文档统一带 anchors，行内引用据 anchorIndex 找到引文。
 */
export type CitationSource
  = | {
    readonly type: 'source-url'
    readonly sourceId: string
    readonly url: string
    readonly title?: string
    readonly anchors?: readonly CitationSourceAnchor[]
  }
  | {
    readonly type: 'source-document'
    readonly sourceId: string
    readonly title?: string
    readonly mediaType?: string
    readonly anchors?: readonly CitationSourceAnchor[]
  }

export interface CitationActiveSourceChangeDetails {
  sourceId: string | null
}

export interface CitationOpenChangeDetails {
  open: boolean
}

export interface CitationSourceOpenDetails {
  sourceId: string
  source: CitationSource
  anchor: CitationSourceAnchor | null
}

export interface CitationTriggerProps {
  sourceId: string
  /** 同一来源可在正文里出现多次；citationId 用来生成不冲突的关系 id。 */
  citationId?: string
  /** 对应 source.anchors 的 0 基下标。 */
  anchorIndex?: number
  disabled?: boolean
}

export interface CitationSourceItemProps {
  sourceId: string
  disabled?: boolean
}

export interface CitationPreviewProps {
  sourceId: string
  /** 默认展示该来源的第一条引文。 */
  anchorIndex?: number
}

export interface CitationSchema extends MachineSchema {
  props: {
    /** @xihan-ui/chat-stream 的 SourcePart[] 可直接传入。 */
    sources?: readonly CitationSource[]
    activeSourceId?: string | null
    defaultActiveSourceId?: string | null
    open?: boolean
    defaultOpen?: boolean
    disabled?: boolean
    loop?: boolean
    dir?: Direction
    size?: Size
    translations?: Partial<CitationTranslations>
    onActiveSourceChange?: (details: CitationActiveSourceChangeDetails) => void
    onOpenChange?: (details: CitationOpenChangeDetails) => void
    /** 打开原始来源；URL 的默认链接仍会正常导航，同时发出该通知。 */
    onSourceOpen?: (details: CitationSourceOpenDetails) => void
  }
  context: {
    activeSourceId: string | null
    open: boolean
    focusedSourceId: string | null
    activeAnchorIndex: number | null
    activeTriggerId: string | null
    /** 此刻露面的那一份预览（open 且是当前来源）；没有为 null。 */
    shownSourceId: string | null
    /** 正在收起、退场还没播完的那一份预览；播完即清。 */
    leavingSourceId: string | null
    /**
     * 挂载之后露面的预览换过没有。没换过时预览投影 data-instant：首帧就开着的预览直接呈现，不播展开。
     */
    moved: boolean
    /** 各份预览量下的内容区高度（像素）：展开从 0 长到它、收起从它收回 0。 */
    previewBlockSizes: Readonly<Record<string, number>>
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    | { type: 'CITATION.ACTIVATE', sourceId: string, anchorIndex: number | null, triggerId: string, toggle: boolean }
    | { type: 'SOURCE.ACTIVATE', sourceId: string }
    | { type: 'SOURCE.OPEN', sourceId: string, anchorIndex: number | null }
    | { type: 'SOURCE.FOCUS', sourceId: string }
    | { type: 'LIST.BLUR' }
    | { type: 'OPEN.SET', open: boolean }
    /** 量下某份预览的内容区高度。 */
    | { type: 'PREVIEW.MEASURED', sourceId: string, blockSize: number }
    /** 收起的那一份退场播完。 */
    | { type: 'PREVIEW.LEFT', sourceId: string }
  tag: never
  guard: never
  action:
    | 'activateCitation'
    | 'activateSource'
    | 'invokeSourceOpen'
    | 'setFocusedSource'
    | 'clearFocus'
    | 'setOpen'
    | 'syncPreview'
    | 'setPreviewBlockSize'
    | 'clearLeaving'
  effect: never
}

export interface CitationApi<T extends PropTypes = PropTypes> {
  sources: readonly CitationSource[]
  activeSource: CitationSource | null
  activeSourceId: string | null
  activeAnchorIndex: number | null
  open: boolean
  focusedSourceId: string | null
  setOpen: (next: boolean) => void
  setActiveSource: (sourceId: string) => void
  getRootProps: () => T['element']
  getTextProps: () => T['element']
  getTriggerProps: (props: CitationTriggerProps) => T['button']
  getPreviewProps: (props: CitationPreviewProps) => T['element']
  getPreviewHeaderProps: (props: CitationPreviewProps) => T['element']
  getPreviewTitleProps: (props: CitationPreviewProps) => T['element']
  getPreviewMetaProps: (props: CitationPreviewProps) => T['element']
  getQuoteProps: (props: CitationPreviewProps) => T['element']
  getPreviewLinkProps: (props: CitationPreviewProps) => T['element']
  getDismissTriggerProps: (props: CitationPreviewProps) => T['button']
  getListProps: () => T['element']
  getSourceProps: (props: CitationSourceItemProps) => T['element']
  getSourceLinkProps: (props: CitationSourceItemProps) => T['button']
  getSourceIndexProps: (props: CitationSourceItemProps) => T['element']
  getSourceTitleProps: (props: CitationSourceItemProps) => T['element']
  getSourceMetaProps: (props: CitationSourceItemProps) => T['element']
}

export interface CitationTranslations {
  /** 来源列表的可及名。 */
  sources: string
  /** 预览区域的可及名。 */
  preview: string
  closePreview: string
  openSource: (title: string) => string
  citation: (index: number, title: string) => string
  source: (index: number, title: string) => string
  document: string
}
