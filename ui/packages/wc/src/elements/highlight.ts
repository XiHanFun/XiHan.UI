import type { HighlightApi, HighlightProps } from '@xihan-ui/headless'
import { connectHighlight, highlightAnatomy, highlightMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-highlight>` —— Light-DOM 行为宿主，无状态机，把 text 按 keyword 切段铺进 root。
 *
 * 作者写一个空的行内容器当 root：命中位置是按 text 这个串逐字符算的，
 * 切出来的片段作者自己写不出，故 root 的内容整份由本元素接管，写在里面的东西会被替换掉。
 *
 * 一处有多个关键词都命中时取最长的那个，重叠的命中只切出一段。
 * 关键词全程逐字符比对，不拼进正则：搜索框里敲进来的 `.` `*` `(` 都是普通字符。
 *
 * 多个关键词只能走 property（`el.keyword = ['a', 'b']`）：属性里的一个串就是一个关键词，
 * 按空格拆的话带空格的关键词就没法写了。
 *
 * @customElement xh-highlight
 * @attr {string} text - 要显示的整段文本
 * @attr {string} keyword - 一个关键词；一组关键词走 property
 * @attr {boolean} case-sensitive - 区分大小写，缺省不区分
 * @csspart root - 包住整段文本的容器，承载 data-case-sensitive
 * @csspart mark - 命中关键词的那一小段，渲染成 `<mark>`
 */
export class XhHighlightElement extends XhElement {
  static override partContract = { anatomy: highlightAnatomy, meta: highlightMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    text: { converter: STRING_CONVERTER },
    keyword: { converter: STRING_CONVERTER },
    caseSensitive: { type: Boolean, attribute: 'case-sensitive' },
  }

  declare text?: string
  declare keyword?: string | readonly string[]
  declare caseSensitive?: boolean

  /** 上一次往哪个 root 铺过哪一串片段。 */
  #painted?: { host: Element, key: string }

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return

    // 读响应式 property，不回读 DOM 特性
    const api = connectHighlight({
      text: this.text,
      keyword: this.keyword,
      caseSensitive: this.caseSensitive,
    } satisfies HighlightProps, wcNormalize)

    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    this.#paint(root, api)
  }

  /**
   * 把切好的片段铺进 root：命中的建一个 `<mark>`，其余建文本节点。
   * 片段没变就不重铺——每帧重建节点会把用户正在拖的选区弄没。
   */
  #paint(root: HTMLElement, api: HighlightApi): void {
    const key = JSON.stringify(api.segments)
    if (this.#painted?.host === root && this.#painted.key === key)
      return
    this.#painted = { host: root, key }

    const doc = root.ownerDocument
    const frame = doc.createDocumentFragment()
    const markProps = api.getMarkProps() as Record<string, unknown>
    for (const segment of api.segments) {
      if (!segment.matched) {
        frame.appendChild(doc.createTextNode(segment.text))
        continue
      }
      const mark = doc.createElement('mark')
      this.spreader.spread(mark, markProps)
      mark.textContent = segment.text
      frame.appendChild(mark)
    }
    root.replaceChildren(frame)
  }
}
