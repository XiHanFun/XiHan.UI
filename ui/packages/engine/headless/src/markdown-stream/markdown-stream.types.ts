import type { PropTypes, Size } from '@xihan-ui/kernel'

/**
 * 生长中那一块的固定 key。
 *
 * 与 `@xihan-ui/markdown` 的 `LIVE_BLOCK_KEY` 逐字相同。本包不 import 那个包：
 * 组件只吃与它同形的裸字段，不建编译期耦合。两处的取值必须一起改。
 */
export const MARKDOWN_STREAM_LIVE_KEY = 'live'

/**
 * 一个已渲染好的顶层块。
 *
 * 字段与 `@xihan-ui/markdown` 的 `RenderedBlock` 逐字同形，由宿主调
 * `createStreamRenderer().render()` 得到后原样传进来。
 */
export interface MarkdownBlock {
  /** 稳定 key。生长中的那一块恒为 {@link MARKDOWN_STREAM_LIVE_KEY}。 */
  readonly key: string
  readonly kind: 'markdown' | 'code' | 'math' | 'html'
  /** 已消毒的 HTML。**只对 kind 为 markdown 的块有效**，见 {@link markdownBlockHtml}。 */
  readonly html: string
  /** 该块是否已闭合。 */
  readonly complete: boolean
  /** 围栏语言标注，仅 code 块有。 */
  readonly lang?: string
  /** 块正文原文，仅 code 与 math 块有。 */
  readonly source?: string
}

export interface MarkdownStreamProps {
  /** 已渲染好的块列表。 */
  blocks: readonly MarkdownBlock[]
  /** 这一段正文是否仍在增长，只落 data-streaming。 */
  streaming?: boolean
  /** 播报档位，默认 off——会话级播报区在消息流那一层，别在每条回复里各开一个。 */
  announce?: 'off' | 'polite'
  /** 尺寸：sm / md / lg。 */
  size?: Size
  translations?: Partial<MarkdownStreamTranslations>
}

export interface MarkdownStreamApi<T extends PropTypes = PropTypes> {
  blocks: readonly MarkdownBlock[]
  streaming: boolean
  /** 播报文本；announce 为 off、或正文还在增长时为 undefined。 */
  announcement: string | undefined
  getRootProps: () => T['element']
  getContentProps: () => T['element']
  getBlockProps: (props: { block: MarkdownBlock }) => T['element']
  getLiveRegionProps: () => T['element']
}

export interface MarkdownStreamTranslations {
  /** 一段回复写完之后播报的那句话。 */
  completed: string
}

/**
 * 这一块能不能按 html 渲。
 *
 * **只有 markdown 块能。** code 块的 html 是一份已转义的 `<pre><code>`，照渲会与交给
 * 代码组件的那份重复；math 块的 html 只是把 LaTeX 源码当正文包了一层。
 * 两者都拿 `source` 交给对应的组件或引擎，不接管的降级结果是把原文当正文显示。
 * `html` 这一种在这里不出现：渲染器明写它永远不会产出。
 */
export function markdownBlockHtml(block: MarkdownBlock): string | undefined {
  return block.kind === 'markdown' ? block.html : undefined
}

/** 这一块是不是正在生长的那一块。流式光标就挂在它身上。 */
export function isLiveMarkdownBlock(block: MarkdownBlock): boolean {
  return block.key === MARKDOWN_STREAM_LIVE_KEY
}
