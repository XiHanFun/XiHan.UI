/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 行内挂点的查找：已消毒的 html 里只放占位节点，适配器把作者的引用角标、公式节点挂进去。

import type { MarkdownBlock, MarkdownInlineMount } from './markdown-stream.types'
import { markdownStreamAnatomy } from './markdown-stream.anatomy'
import { MARKDOWN_INLINE_ATTR } from './markdown-stream.types'

const blockSelector = markdownStreamAnatomy.build().block.selector

/**
 * 在 content 部件下按块的先后找出每个行内挂点。块节点是 content 的直接子节点、与块列表一一对应；
 * 被作者接管的块没有铺 html，也就没有占位节点。下标越界或解析不出的占位节点跳过。
 *
 * 只在挂载之后调用：占位节点是 html 铺进去之后才有的。
 */
export function queryMarkdownInlines(content: HTMLElement, blocks: readonly MarkdownBlock[]): MarkdownInlineMount[] {
  const out: MarkdownInlineMount[] = []
  const nodes = [...content.children].filter(node => node.matches(blockSelector))
  nodes.forEach((node, at) => {
    const block = blocks[at]
    const inlines = block?.inlines
    if (block === undefined || inlines === undefined)
      return
    for (const element of node.querySelectorAll<HTMLElement>(`[${MARKDOWN_INLINE_ATTR}]`)) {
      const index = Number(element.getAttribute(MARKDOWN_INLINE_ATTR))
      const inline = inlines[index]
      if (!Number.isInteger(index) || inline === undefined)
        continue
      out.push({ key: `${block.key}:${index}`, element, block, index, inline })
    }
  })
  return out
}

/** 两次查找的结果是否指向同一批节点，适配器据此跳过无谓的重渲。 */
export function sameMarkdownInlines(a: readonly MarkdownInlineMount[], b: readonly MarkdownInlineMount[]): boolean {
  return a.length === b.length && a.every((mount, i) => mount.element === b[i]!.element && mount.inline === b[i]!.inline)
}
