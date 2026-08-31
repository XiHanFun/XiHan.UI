import type { MarkdownBlock, MarkdownStreamApi, MarkdownStreamProps, MarkdownStreamTranslations } from '@xihan-ui/headless'
import { connectMarkdownStream, markdownBlockHtml, markdownStreamAnatomy, markdownStreamMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 给出
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 缺省为真的开关：缺席翻成 undefined 交给 connect，要关掉写 caret="false"
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-markdown-stream>` —— Light-DOM 行为宿主，无状态机：wire 时算出 connectMarkdownStream
 * 的产出，打到作者写的角色节点上，并把块列表铺进 content 角色节点。
 *
 * 块是数据铺出来的，作者写不出 N 个节点，故 content 部件的内容由本元素接管。
 * **逐 key 比对复用**：key 没变的块只改内容不重建节点——整表重铺会把已定型的块连同用户
 * 正在拖的选区一起弄没，而稳定 key 正是为了避免这件事。
 *
 * markdown 块铺已消毒的 html；代码块与公式块只铺原文，要交给代码组件或公式引擎的话
 * 由作者监听块节点自行接管。
 *
 * @customElement xh-markdown-stream
 * @attr {string} announce - 播报档位：off（默认）或 polite
 * @attr {boolean} streaming - 正文是否仍在增长，只落 data-streaming
 * @attr {boolean} caret - 画不画流式光标，缺席时画，写 caret="false" 关掉
 * @attr {string} size - 尺寸：sm / md / lg
 * @csspart root - 外壳，承载 data-state / data-streaming，零块流式时承载 data-caret
 * @csspart content - 正文包裹层，内容由本元素铺
 * @csspart block - 一个顶层块，承载 data-kind / data-live / data-complete / data-caret
 * @csspart live-region - 视觉隐藏的原子播报区，一段回复写完时念一句
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
  /** 已渲染好的块列表，由宿主调 createStreamRenderer().render() 得到。 */
  declare blocks?: readonly MarkdownBlock[]
  declare translations?: Partial<MarkdownStreamTranslations>

  /** 上一轮铺出来的块节点，按 key 索引。 */
  readonly #nodes = new Map<string, HTMLElement>()

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
      if (html === undefined) {
        // 代码与公式块没人接管就把原文当正文显示
        if (node.textContent !== (block.source ?? ''))
          node.textContent = block.source ?? ''
      }
      else if (node.innerHTML !== html) {
        node.innerHTML = html
      }
    }

    for (const [key, node] of this.#nodes) {
      if (seen.has(key))
        continue
      node.remove()
      this.#nodes.delete(key)
    }
  }
}
