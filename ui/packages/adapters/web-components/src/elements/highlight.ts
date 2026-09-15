/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 highlight 相关实现。

import type { Tone } from '@xihan-ui/core'
import type { HighlightApi, HighlightProps } from '@xihan-ui/headless'
import { connectHighlight, highlightAnatomy, highlightMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-highlight>`：Light-DOM 行为宿主，无状态机，把 text 按 keyword 切段铺进 root。
 *
 * 作者写一个空的行内容器作为 root：命中位置按 text 逐字符计算，
 * 切出的片段作者无法自行编写，因此 root 的内容整份由本元素接管，写在其中的内容会被替换。
 *
 * 同一位置有多个关键词都命中时取最长的一个，重叠的命中只切出一段。
 * 关键词全程逐字符比较，不拼进正则：搜索框中输入的 `.` `*` `(` 都是普通字符。
 *
 * 多个关键词只能通过 property 设置（`el.keyword = ['a', 'b']`）：属性中的一个串就是一个关键词，
 * 按空格拆分会使带空格的关键词无法表达。
 *
 * @customElement xh-highlight
 * @attr {string} text - 要显示的整段文本
 * @attr {string} keyword - 一个关键词；一组关键词通过 property 设置
 * @attr {boolean} case-sensitive - 区分大小写，默认不区分
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气，决定命中片段使用哪族颜色
 * @csspart root - 包裹整段文本的容器，承载 data-case-sensitive 与 data-tone
 * @csspart mark - 命中关键词的片段，渲染为 `<mark>`
 */
export class XhHighlightElement extends XhElement {
  static override partContract = { anatomy: highlightAnatomy, meta: highlightMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    text: { converter: STRING_CONVERTER },
    keyword: { converter: STRING_CONVERTER },
    caseSensitive: { type: Boolean, attribute: 'case-sensitive' },
    tone: { converter: STRING_CONVERTER },
  }

  declare text?: string
  declare keyword?: string | readonly string[]
  declare caseSensitive?: boolean
  declare tone?: Tone

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
      tone: this.tone,
    } satisfies HighlightProps, wcNormalize)

    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    this.#paint(root, api)
  }

  /**
   * 把切分的片段铺进 root：命中的建一个 `<mark>`，其余建文本节点。
   * 片段未变时不重铺：每帧重建节点会丢失用户正在拖动的选区。
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
