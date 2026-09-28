/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 markdown stream 相关实现。

import type { MarkdownBlock, MarkdownInlineMount, MarkdownStreamApi, MarkdownStreamProps, MarkdownStreamTranslations } from '@xihan-ui/headless'
import { connectMarkdownStream, markdownBlockHtml, markdownStreamAnatomy, markdownStreamMeta, queryMarkdownInlines } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 给出
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 缺省为真的开关：缺席翻成 undefined 交给 connect，要关掉写 caret="false"
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
const BLOCK_SELECTOR = markdownStreamAnatomy.build().block.selector

/**
 * `<xh-markdown-stream>`：Light-DOM 行为宿主，无状态机：wire 时计算 connectMarkdownStream
 * 的产出，接到作者编写的角色节点上，并把块列表铺进 content 角色节点。
 *
 * 块由数据铺设，作者无法编写 N 个节点，因此 content 部件的内容由本元素接管。
 * 逐 key 比对复用：key 未变的块只改内容不重建节点：整表重铺会把已定型的块连同用户
 * 正在拖动的选区一起清除，而稳定 key 正是为了避免这一点。
 *
 * markdown 块铺设已消毒的 html；代码块与公式块只铺设原文，需要交给代码组件或公式引擎时
 * 由作者监听块节点自行接管。
 *
 * 正文里的行内引用与行内公式在 html 里是占位节点（带 data-md-inline），新铺出来一个就派发一次
 * `inline-mount`，detail 给出占位节点、所在块与挂点内容；作者往占位节点里放引用角标或公式引擎的产物。
 * 角标要接到外层 `<xh-citation>` 上时写成 `data-xh-part="trigger"` 并声明 `data-xh-part-owner="citation"`，
 * 外层引用元素即认领它。
 *
 * @fires inline-mount - 新铺出一个行内挂点的占位节点；detail 为 `{ key, element, block, index, inline }`
 * @customElement xh-markdown-stream
 * @attr {'off'|'polite'|'assertive'} announce - 播报档位：off（默认）/ polite / assertive
 * @attr {boolean} streaming - 正文是否仍在增长，只写 data-streaming
 * @attr {boolean} caret - 是否绘制流式光标，缺席时绘制，写 caret="false" 关闭
 * @attr {string} size - 尺寸：sm / md / lg
 * @csspart root - 外壳，承载 data-state / data-streaming，零块流式时承载 data-caret
 * @csspart content - 正文包裹层，内容由本元素铺设
 * @csspart block - 一个顶层块，承载 data-kind / data-live / data-complete / data-caret
 * @csspart live-region - 视觉隐藏的原子播报区，一段回复完成时朗读一句
 */
export class XhMarkdownStreamElement extends XhElement {
  static override partContract = { anatomy: markdownStreamAnatomy, meta: markdownStreamMeta }

  // 描述符逐个写全，不用对象展开，CEM 分析器的 lit 插件读不了展开元素的名字
  static override properties = {
    streaming: { type: Boolean },
    announce: { converter: STRING_CONVERTER },
    caret: { converter: BOOLEAN_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 数组与对象值走不了 HTML 属性，只作为 property 暴露
    blocks: { attribute: false },
    translations: { attribute: false },
  }

  declare streaming?: boolean
  declare announce?: MarkdownStreamProps['announce']
  declare caret?: boolean
  declare size?: MarkdownStreamProps['size']
  /** 已渲染的块列表，由宿主调用 createStreamRenderer().render() 得到。 */
  declare blocks?: readonly MarkdownBlock[]
  declare translations?: Partial<MarkdownStreamTranslations>

  /** 上一轮铺出来的块节点，按 key 索引。 */
  readonly #nodes = new Map<string, HTMLElement>()
  /** 每个块节点上一轮铺进去的内容。 */
  readonly #painted = new WeakMap<HTMLElement, string>()

  private viewProps(): MarkdownStreamProps {
    return {
      blocks: this.blocks ?? [],
      streaming: this.streaming,
      announce: this.announce,
      caret: this.caret,
      size: this.size,
      translations: this.translations,
    }
  }

  protected wire(): void {
    const api = connectMarkdownStream(this.configured('markdown-stream', this.viewProps()), wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)

    const live = this.getPart('live-region')
    if (live) {
      this.spreader.spread(live, api.getLiveRegionProps() as Record<string, unknown>)
      live.textContent = api.announcement ?? ''
    }

    this.#paint(api)
  }

  /** 逐 key 比对铺块：key 相同复用节点、只更新内容，key 消失的移除，新 key 追加。 */
  #paint(api: MarkdownStreamApi): void {
    const host = this.getPart('content')
    if (!host) {
      this.#nodes.clear()
      return
    }

    const doc = host.ownerDocument
    const seen = new Set<string>()
    /** 这一轮重铺了 html 的块节点：它们里面的占位节点是新的。 */
    const mounted: HTMLElement[] = []
    let cursor: ChildNode | null = host.firstChild

    for (const block of api.blocks) {
      seen.add(block.key)
      let node = this.#nodes.get(block.key)
      if (!node) {
        node = doc.createElement('div')
        this.#nodes.set(block.key, node)
      }
      // 位置对不上才搬，对得上就原地不动：搬动节点同样会丢选区
      if (cursor !== node)
        host.insertBefore(node, cursor)
      else
        cursor = node.nextSibling

      this.spreader.spread(node, api.getBlockProps({ block }) as Record<string, unknown>)
      const html = markdownBlockHtml(block)
      // 与上一轮铺的比，而不是与节点此刻的内容比：作者往占位节点里挂了引用角标或公式，
      // 节点内容已经不是铺进去的那份，拿它比会把作者的节点整块冲掉
      const painted = html ?? block.source ?? ''
      if (this.#painted.get(node) === painted)
        continue
      this.#painted.set(node, painted)
      if (html === undefined) {
        // 代码与公式块没人接管就把原文当正文显示
        node.textContent = painted
        continue
      }
      node.innerHTML = html
      mounted.push(node)
    }

    for (const [key, node] of this.#nodes) {
      if (seen.has(key))
        continue
      node.remove()
      this.#nodes.delete(key)
    }

    // 新铺出来的占位节点逐个报给作者，由作者往里挂引用角标或公式引擎的产物。
    // 排到接线之后的微任务里报：作者挂进去的角标常归外层 xh-citation 管，外层此刻可能正在接线、
    // 对这一刻的节点变动充耳不闻，挪到它接完之后才接得住
    if (mounted.length > 0) {
      const fresh = queryMarkdownInlines(host, api.blocks)
        .filter(mount => mounted.includes(mount.element.closest<HTMLElement>(BLOCK_SELECTOR)!))
      queueMicrotask(() => {
        for (const mount of fresh) {
          if (mount.element.isConnected)
            this.dispatchEvent(new CustomEvent<MarkdownInlineMount>('inline-mount', { detail: mount, bubbles: true, composed: true }))
        }
      })
    }
  }
}
