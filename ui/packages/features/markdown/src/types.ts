/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/** 一个已渲染的顶层块。html 一律已消毒，可直接交给宿主插进 DOM。 */
export interface RenderedBlock {
  /**
   * 稳定 key。生长中的那一块恒为 {@link LIVE_BLOCK_KEY}，定型块由下标与内容摘要拼成。
   *
   * 稳定性是防整段重建的关键：生长块 key 不变，框架才会复用同一份 DOM 只改文本；
   * 每帧换 key 的话，用户每收到一个 token 就要被重建一次节点，选区和滚动位置全丢。
   */
  readonly key: string
  readonly kind: 'markdown' | 'code' | 'math' | 'html'
  /** 已消毒的 HTML。 */
  readonly html: string
  /** 该块是否已闭合。未闭合的块随时会变，宿主据此决定要不要上高亮这类昂贵渲染。 */
  readonly complete: boolean
  /** 围栏语言标注，仅 code 块有。半截或不认识的标注一律留原样，由消费方降级。 */
  readonly lang?: string
  /**
   * 块正文的原始文本，只有 code 与 math 两种块填。
   *
   * html 对这两种块只是降级产物：代码要交给代码组件重排行号与着色，公式要交给公式引擎，
   * 两者都得拿到未经转义的正文。code 块给的是剥掉起止围栏后的代码，math 块给的是剥掉 `$$` 后的公式。
   */
  readonly source?: string
  /**
   * 块正文里的行内挂点，按在 html 里出现的先后排；没有时缺席。
   *
   * html 里每个挂点是一个带 `data-md-inline="<下标>"` 的 span，下标对应这张表。
   * 占位节点里放着降级内容（引用写来源 id，公式写 TeX 原文），宿主可以把它换成
   * 引用角标组件或公式引擎的产物；不接管时降级内容照常显示。
   */
  readonly inlines?: readonly RenderedInline[]
}

/**
 * 一个行内挂点。
 *
 * - citation：`[@来源]` 或 `[@甲; @乙]` 写成的行内引用，sourceIds 按书写顺序排。
 * - math：`$…$` 行内公式（display 为 false）或行内写的 `$$…$$`（display 为 true），
 *   source 是未经转义的 TeX 原文，公式由宿主选的引擎渲染。
 */
export type RenderedInline
  = | { readonly kind: 'citation', readonly sourceIds: readonly string[] }
    | { readonly kind: 'math', readonly source: string, readonly display: boolean }

export interface StreamRendererOptions {
  /**
   * 正文里裸写的 http(s):// 与 www. 地址是否成为链接（GFM 扩展自动链接），缺省开。
   * CommonMark 本身不认它们，要严格按 CommonMark 渲染时关掉。
   */
  readonly bareLinks?: boolean
  /**
   * 脚注锚点 id 的前缀，缺省 `md-`。同一页上有几段正文带脚注时各传一个
   * （例如消息 id），否则脚注与回链会串到别的消息上。
   */
  readonly idPrefix?: string
}

export interface RenderOpts {
  /**
   * 流是否已经结束。
   *
   * 为真时最后一块也按定型处理：不再做未闭合补全、拿到自己的稳定 key。
   * 不传等同于「还在生长」——宁可多当一帧生长态，也不要把没吐完的内容当成定稿。
   */
  readonly ended?: boolean
}

export interface StreamRenderer {
  /**
   * 幂等：传入截至当前的全文，返回稳定 key 的块列表。
   * 同一份全文调多少次结果都一样；内部按块 memo，已定型的块不会重渲。
   */
  render: (fullText: string, opts?: RenderOpts) => readonly RenderedBlock[]
  dispose: () => void
}

/** 生长块的固定 key。 */
export const LIVE_BLOCK_KEY = 'live'
