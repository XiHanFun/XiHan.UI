/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 markdown stream 类型契约。

import type { PropTypes, Size } from '@xihan-ui/core'

/**
 * 生长中的块的固定 key。
 *
 * 与 `@xihan-ui/markdown` 的 `LIVE_BLOCK_KEY` 逐字相同。本包不 import 该包：
 * 组件只接受与它同形的裸字段，不建立编译期耦合。两处的取值必须一起修改。
 */
export const MARKDOWN_STREAM_LIVE_KEY = 'live'

/**
 * 一个已渲染完成的顶层块。
 *
 * 字段与 `@xihan-ui/markdown` 的 `RenderedBlock` 逐字同形，由宿主调用
 * `createStreamRenderer().render()` 得到后原样传入。
 */
export interface MarkdownBlock {
  /** 稳定 key。生长中的块恒为 {@link MARKDOWN_STREAM_LIVE_KEY}。 */
  readonly key: string
  readonly kind: 'markdown' | 'code' | 'math' | 'html'
  /** 已消毒的 HTML。只对 kind 为 markdown 的块有效，见 {@link markdownBlockHtml}。 */
  readonly html: string
  /** 该块是否已闭合。 */
  readonly complete: boolean
  /** 围栏语言标注，仅 code 块有。 */
  readonly lang?: string
  /** 块正文原文，仅 code 与 math 块有。 */
  readonly source?: string
}

export interface MarkdownStreamProps {
  /** 已渲染完成的块列表。 */
  blocks: readonly MarkdownBlock[]
  /** 该段正文是否仍在增长，只写 data-streaming。 */
  streaming?: boolean
  /** 播报档位，默认 off：会话级播报区在消息流层，不在每条回复中各开一个。 */
  announce?: 'off' | 'polite' | 'assertive'
  /** 是否绘制流式光标，默认绘制。设为 false 时不发出任何 data-caret。 */
  caret?: boolean
  /** 尺寸：sm / md / lg。 */
  size?: Size
  translations?: Partial<MarkdownStreamTranslations>
}

export interface MarkdownStreamApi<T extends PropTypes = PropTypes> {
  blocks: readonly MarkdownBlock[]
  streaming: boolean
  /** 播报文本；announce 为 off、或正文仍在增长时为 undefined。 */
  announcement: string | undefined
  getRootProps: () => T['element']
  getContentProps: () => T['element']
  getBlockProps: (props: { block: MarkdownBlock }) => T['element']
  getLiveRegionProps: () => T['element']
}

export interface MarkdownStreamTranslations {
  /** 一段回复完成之后播报的文案。 */
  completed: string
}

/**
 * 该块是否可以按 html 渲染。
 *
 * 只有 markdown 块可以。code 块的 html 是一份已转义的 `<pre><code>`，直接渲染会与交给
 * 代码组件的内容重复；math 块的 html 只是把 LaTeX 源码作为正文包了一层。
 * 两者都取 `source` 交给对应的组件或引擎，不接管时的降级结果是把原文作为正文显示。
 * `html` 这一种在这里不出现：渲染器明确不会产出它。
 */
export function markdownBlockHtml(block: MarkdownBlock): string | undefined {
  return block.kind === 'markdown' ? block.html : undefined
}

/** 该块是否为正在生长的块。开启光标时 data-caret 发在它身上。 */
export function isLiveMarkdownBlock(block: MarkdownBlock): boolean {
  return block.key === MARKDOWN_STREAM_LIVE_KEY
}
