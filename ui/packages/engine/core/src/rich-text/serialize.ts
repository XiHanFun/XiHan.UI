/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 富文本模型写成 HTML 串（导出、复制到剪贴板用）与纯文字。文字与属性值一律转义，只用解析器认得的标签，
// 写出的 HTML 再经 parseRichTextHtml 读回得到同一份模型。

import type { RichBlock, RichFieldRun, RichInline, RichTextDocument } from './types'
import { planMarks } from './values'

const ESCAPES: Readonly<Record<string, string>> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }

/** 转义文字与属性值里的 HTML 特殊字符。 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, char => ESCAPES[char] as string)
}

function wrapInline(content: string, run: Exclude<RichInline, { type: 'break' }>): string {
  const plan = planMarks(run.marks)
  let html = content
  if (plan.styles.length > 0)
    html = `<span style="${escapeHtml(plan.styles.map(([property, value]) => `${property}: ${value}`).join('; '))}">${html}</span>`
  for (const tag of [...plan.tags].reverse())
    html = `<${tag}>${html}</${tag}>`
  if (plan.href !== undefined)
    html = `<a href="${escapeHtml(plan.href)}">${html}</a>`
  return html
}

function fieldHtml(run: RichFieldRun): string {
  const format = run.format === undefined ? '' : ` data-format="${escapeHtml(JSON.stringify(run.format))}"`
  return `<span data-field="${escapeHtml(run.field)}"${format}>${escapeHtml(run.field)}</span>`
}

function inlineHtml(runs: readonly RichInline[]): string {
  return runs.map((run) => {
    switch (run.type) {
      case 'text':
        return wrapInline(escapeHtml(run.text), run)
      case 'field':
        return wrapInline(fieldHtml(run), run)
      case 'break':
        return '<br>'
      default:
        return ''
    }
  }).join('')
}

function alignAttr(align: string | undefined): string {
  return align === undefined ? '' : ` style="text-align: ${escapeHtml(align)}"`
}

function blocksHtml(blocks: readonly RichBlock[]): string {
  return blocks.map((block) => {
    switch (block.type) {
      case 'paragraph':
        return `<p${alignAttr(block.align)}>${inlineHtml(block.runs)}</p>`
      case 'heading':
        return `<h${block.level}${alignAttr(block.align)}>${inlineHtml(block.runs)}</h${block.level}>`
      case 'list': {
        const tag = block.ordered ? 'ol' : 'ul'
        const start = block.ordered && block.start !== undefined && block.start !== 1 ? ` start="${block.start}"` : ''
        return `<${tag}${start}>${block.items.map(item => `<li>${blocksHtml(item.blocks)}</li>`).join('')}</${tag}>`
      }
      case 'divider':
        return '<hr>'
      default:
        return ''
    }
  }).join('')
}

/**
 * 把富文本模型写成 HTML 串：文字与属性值都转义，样式值只写判定合法的，链接只写 `toSafeLinkHref` 放行的地址；
 * 行内字段写成 `<span data-field="路径">路径</span>`。不认识的块与行内类型跳过。
 */
export function serializeRichTextHtml(document: RichTextDocument): string {
  return blocksHtml(document.blocks)
}

/** richTextPlainText 的选项。 */
export interface RichTextPlainTextOptions {
  /** 行内字段的文字，缺省写成 `{路径}`。 */
  readonly field?: (run: RichFieldRun) => string
}

function inlineText(runs: readonly RichInline[], field: (run: RichFieldRun) => string): string {
  return runs.map(run => (run.type === 'text' ? run.text : run.type === 'field' ? field(run) : run.type === 'break' ? '\n' : '')).join('')
}

function blocksText(blocks: readonly RichBlock[], indent: string, field: (run: RichFieldRun) => string): string[] {
  return blocks.flatMap((block) => {
    switch (block.type) {
      case 'paragraph':
      case 'heading':
        return [indent + inlineText(block.runs, field).replace(/\n/g, `\n${indent}`)]
      case 'list':
        return block.items.flatMap((item, index) => {
          const marker = block.ordered ? `${(block.start ?? 1) + index}. ` : '• '
          const lines = blocksText(item.blocks, `${indent}  `, field)
          if (lines.length === 0)
            return [`${indent}${marker}`]
          return [`${indent}${marker}${(lines[0] as string).slice(indent.length + 2)}`, ...lines.slice(1)]
        })
      case 'divider':
        return [`${indent}———`]
      default:
        return []
    }
  })
}

/** 富文本的纯文字：块之间换行，列表项前加「• 」或序号，嵌套一层缩进两格，分隔线写成「———」。 */
export function richTextPlainText(document: RichTextDocument, options: RichTextPlainTextOptions = {}): string {
  const field = options.field ?? (run => `{${run.field}}`)
  return blocksText(document.blocks, '', field).join('\n')
}
