/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 citation 类型契约。

import type { Cleanup, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size } from '@xihan-ui/core'

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

/**
 * 预览怎样出现：
 * - inline：正文流里的一块面，展开时把后面的段落推开；
 * - hover：锚定在引用编号上的浮层卡片，指针停留或聚焦即出现、离开即收起，不推动正文。
 */
export type CitationPreviewMode = 'inline' | 'hover'

export interface CitationTriggerProps {
  /** 这一处引用的来源；一处引多个来源时改写 sourceIds，两者只写一个。 */
  sourceId?: string
  /** 一处引用多个来源：预览里可以在它们之间轮换，缺省先看第一个。 */
  sourceIds?: readonly string[]
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

/** 适配器在挂载后填入：定位引擎、层注册与悬停浮层的定位壳，缺省时 hover 档的对应副作用短路。 */
export interface CitationRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄，只在悬停卡片开着时调用（Escape 与层外按下收起它）。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎，未提供时悬停卡片不落位。 */
  position: PositionEnginePort | null
  /** 悬停卡片的定位壳，即 positioner。 */
  getFloatingEl: () => HTMLElement | null
}

/** 一处行内引用的身份：它引了哪些来源、第几条引文、按钮的 id。 */
export interface CitationTriggerTarget {
  readonly sourceIds: readonly string[]
  readonly anchorIndex: number | null
  readonly triggerId: string
}

export interface CitationSchema extends MachineSchema {
  props: {
    /**
     * 预览怎样出现，缺省 inline。
     * hover 档要在根里放 positioner 部件，预览放进它里面，定位到当前引用编号旁。
     */
    previewMode?: CitationPreviewMode
    /** hover 档：指针停在引用上到卡片出现的等待毫秒，缺省 700。 */
    openDelay?: number
    /** hover 档：指针离开引用与卡片到收起的等待毫秒，缺省 300；也是从编号挪进卡片的通行时间。 */
    closeDelay?: number
    /**
     * hover 档：卡片刚收起不到这么久，指向另一处引用即直接出现、不再等 openDelay，缺省 300；
     * 卡片开着时指向另一处引用始终直接切过去。0 表示不接替。
     */
    skipDelayDuration?: number
    /** hover 档：卡片相对引用编号的朝向，缺省 bottom，空间不足时由定位引擎避让。 */
    placement?: Placement
    /** hover 档：卡片与引用编号的间距（px）。 */
    offset?: number
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
    /** 当前那处引用引到的全部来源；一处多源时预览在它们之间轮换。从来源列表打开时为 null。 */
    activeGroup: readonly string[] | null
    /** hover 档：等 openDelay 到点要打开的那处引用。 */
    pendingTarget: CitationTriggerTarget | null
    /** hover 档：焦点是否停在引用编号或卡片里；为真时指针移开不收起，改由失焦收起。 */
    focusHeld: boolean
    /** hover 档：卡片最近一次收起的时刻（Date.now 毫秒），接替窗口据此判定。 */
    closedAt: number
    /** hover 档：定位引擎回填的最新结果。 */
    position: PositionResult | null
    /** hover 档：卡片开着时换了来源（轮换或指向另一处引用），新露面的预览就地换内容、不再播出现。 */
    swapped: boolean
  }
  computed: Record<string, never>
  refs: CitationRefs
  /** opening：hover 档等 openDelay；closing：hover 档等 closeDelay，卡片仍开着。 */
  state: 'idle' | 'opening' | 'closing'
  event:
    | { type: 'CITATION.ACTIVATE', target: CitationTriggerTarget, toggle: boolean }
    /** hover 档：指针进入某处引用编号。 */
    | { type: 'TRIGGER.ENTER', target: CitationTriggerTarget }
    /** hover 档：指针离开引用编号或卡片。 */
    | { type: 'POINTER.LEAVE' }
    /** hover 档：指针进入卡片，撤销收起等待。 */
    | { type: 'FLOATING.ENTER' }
    /** hover 档：焦点落到某处引用编号上。 */
    | { type: 'TRIGGER.FOCUS', target: CitationTriggerTarget }
    /** hover 档：焦点落进卡片。 */
    | { type: 'FLOATING.FOCUS' }
    /** hover 档：焦点离开引用编号与卡片。 */
    | { type: 'HOVER.BLUR' }
    | { type: 'after.openDelay' }
    | { type: 'after.closeDelay' }
    /** 一处多源时在预览里换到上一个 / 下一个来源。 */
    | { type: 'GROUP.STEP', delta: 1 | -1 }
    /** hover 档：消解层回报 Escape 或层外按下。 */
    | { type: 'DISMISS' }
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
  guard: 'isHoverMode' | 'isVisible' | 'isWarm' | 'isFocusHeld' | 'isSameTarget'
  action:
    | 'activateCitation'
    | 'openTarget'
    | 'openPending'
    | 'setPending'
    | 'clearPending'
    | 'closeHover'
    | 'markFocusHeld'
    | 'clearFocusHeld'
    | 'stepGroup'
    | 'activateSource'
    | 'invokeSourceOpen'
    | 'setFocusedSource'
    | 'clearFocus'
    | 'setOpen'
    | 'syncPreview'
    | 'setPreviewBlockSize'
    | 'clearLeaving'
  effect: 'waitForOpenDelay' | 'waitForCloseDelay' | 'trackPosition' | 'trackLayer'
}

export interface CitationApi<T extends PropTypes = PropTypes> {
  sources: readonly CitationSource[]
  activeSource: CitationSource | null
  activeSourceId: string | null
  activeAnchorIndex: number | null
  /** 当前那处引用引到的全部来源；只有一个或从来源列表打开时为 null。 */
  activeGroup: readonly string[] | null
  previewMode: CitationPreviewMode
  open: boolean
  focusedSourceId: string | null
  setOpen: (next: boolean) => void
  setActiveSource: (sourceId: string) => void
  getRootProps: () => T['element']
  getTextProps: () => T['element']
  getTriggerProps: (props: CitationTriggerProps) => T['button']
  /** hover 档的浮层定位壳；inline 档不参与排版（display: contents）。 */
  getPositionerProps: () => T['element']
  getPreviewProps: (props: CitationPreviewProps) => T['element']
  getPreviewHeaderProps: (props: CitationPreviewProps) => T['element']
  getPreviewTitleProps: (props: CitationPreviewProps) => T['element']
  getPreviewMetaProps: (props: CitationPreviewProps) => T['element']
  getQuoteProps: (props: CitationPreviewProps) => T['element']
  getPreviewLinkProps: (props: CitationPreviewProps) => T['element']
  /** 预览链接上写的字：网页来源取 previewLinkSource，文档来源取 previewLinkDocument。 */
  previewLinkText: (props: CitationPreviewProps) => string
  getDismissTriggerProps: (props: CitationPreviewProps) => T['button']
  /** 一处多源时换到上一个来源；只有一个来源时带 hidden。 */
  getPrevTriggerProps: (props: CitationPreviewProps) => T['button']
  /** 一处多源时换到下一个来源；只有一个来源时带 hidden。 */
  getNextTriggerProps: (props: CitationPreviewProps) => T['button']
  /** 一处多源时的位置，如「2 / 3」；只有一个来源时带 hidden。 */
  getPreviewIndexProps: (props: CitationPreviewProps) => T['element']
  /** 该预览此刻在一处多源里排第几（1 基）与共几个；不在多源轮换里时为 null。 */
  getPreviewPosition: (props: CitationPreviewProps) => { index: number, total: number } | null
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
  /** 一处引了多个来源时引用编号的可及名，入参是这些来源在列表里的序号（1 基）。 */
  citations: (indexes: readonly number[]) => string
  previousSource: string
  nextSource: string
  source: (index: number, title: string) => string
  document: string
  /** 预览卡里打开网页来源的链接上写的字。 */
  previewLinkSource: string
  /** 预览卡里打开文档来源的按钮上写的字。 */
  previewLinkDocument: string
}
