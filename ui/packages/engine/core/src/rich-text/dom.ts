/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/core/rich-text-dom —— 按富文本模型生成 DOM：只用 createElement、文字节点与 setAttribute，
// 不拼 HTML 串；样式只写判定合法的值，链接只写 toSafeLinkHref 放行的地址，不认识的块与行内类型跳过。

import type { RichBlock, RichFieldRun, RichInline, RichTextDocument } from './types'
import { isRichAlign, planMarks } from './values'

/** renderRichText 的选项。 */
export interface RenderRichTextOptions {
  /** 行内字段显示的文字，缺省写成 `{路径}`。 */
  readonly field?: (run: RichFieldRun) => string
}

function inline(doc: Document, run: Exclude<RichInline, { type: 'break' }>, text: string): Node {
  const plan = planMarks(run.marks)
  let node: Node = doc.createTextNode(text)
  if (plan.styles.length > 0) {
    const span = doc.createElement('span')
    for (const [property, value] of plan.styles)
      span.style.setProperty(property, value)
    span.append(node)
    node = span
  }
  for (const tag of [...plan.tags].reverse()) {
    const element = doc.createElement(tag)
    element.append(node)
    node = element
  }
  if (plan.href !== undefined) {
    const link = doc.createElement('a')
    link.setAttribute('href', plan.href)
    link.append(node)
    node = link
  }
  return node
}

function appendRuns(doc: Document, parent: HTMLElement, runs: readonly RichInline[], field: (run: RichFieldRun) => string): void {
  for (const run of runs) {
    switch (run.type) {
      case 'text':
        parent.append(inline(doc, run, run.text))
        break
      case 'field':
        parent.append(inline(doc, run, field(run)))
        break
      case 'break':
        parent.append(doc.createElement('br'))
        break
    }
  }
  if (parent.childNodes.length === 0)
    parent.append(doc.createElement('br'))
}

function textBlock(doc: Document, tag: 'p' | 'h1' | 'h2' | 'h3', runs: readonly RichInline[], align: unknown, field: (run: RichFieldRun) => string): HTMLElement {
  const element = doc.createElement(tag)
  if (isRichAlign(align))
    element.style.setProperty('text-align', align)
  appendRuns(doc, element, runs, field)
  return element
}

function appendBlocks(doc: Document, parent: Node, blocks: readonly RichBlock[], field: (run: RichFieldRun) => string): void {
  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
        parent.appendChild(textBlock(doc, 'p', block.runs, block.align, field))
        break
      case 'heading':
        if (block.level === 1 || block.level === 2 || block.level === 3)
          parent.appendChild(textBlock(doc, `h${block.level}`, block.runs, block.align, field))
        break
      case 'list': {
        const list = doc.createElement(block.ordered ? 'ol' : 'ul')
        if (block.ordered && Number.isInteger(block.start) && block.start !== 1)
          list.setAttribute('start', String(block.start))
        for (const item of block.items) {
          const li = doc.createElement('li')
          appendBlocks(doc, li, item.blocks, field)
          list.append(li)
        }
        parent.appendChild(list)
        break
      }
      case 'divider':
        parent.appendChild(doc.createElement('hr'))
        break
    }
  }
}

/**
 * 按富文本模型生成 DOM 片段：段落 `p`、标题 `h1`–`h3`、列表 `ul`/`ol` 与 `li`、分隔线 `hr`、换行 `br`；
 * 粗体、斜体、下划线、删除线、上下标用语义标签，颜色、底色、字号（pt）与字体写在 span 的 style 上，
 * 链接写成带 href 的 `a`。空段落放一个 `br` 占住一行。
 *
 * @example
 * container.replaceChildren(renderRichText(document, model, { field: run => String(data[run.field] ?? '') }))
 */
export function renderRichText(doc: Document, document: RichTextDocument, options: RenderRichTextOptions = {}): DocumentFragment {
  const field = options.field ?? (run => `{${run.field}}`)
  const fragment = doc.createDocumentFragment()
  appendBlocks(doc, fragment, document.blocks, field)
  return fragment
}
