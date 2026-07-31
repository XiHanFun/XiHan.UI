import type { LinkDefs } from './refs'
import { fenceLang } from './blocks'
import { escapeAttr, escapeText } from './escape'
import { renderInline } from './inline'
import { NO_DEFS, splitDefinitions } from './refs'
import { blockType, CODE_INDENT, FENCE_OPEN, LIST_ITEM, splitRow, stripColumns, topLevelRanges } from './scan'

const HEADING = /^ {0,3}(#{1,6})(?![^ \t])(.*)$/
const CLOSING_HASHES = /\s+#+$/
const ORDERED_MARKER = /^(\d{1,9})[.)]$/
const MAX_DEPTH = 6
/** 一张表补齐后允许的单元格总数上限，超过则不补空单元格。 */
const MAX_TABLE_CELLS = 50_000
const ALIGN_STYLE: Record<string, string> = {
  center: ' style="text-align:center"',
  left: ' style="text-align:left"',
  right: ' style="text-align:right"',
}

/** 取块源文本里的行，去掉末尾的空行。 */
function contentLines(src: string): string[] {
  const lines = src.split('\n')
  while (lines.length > 0 && lines[lines.length - 1]!.trim() === '') lines.pop()
  return lines
}

function renderCode(src: string): string {
  const lines = src.split('\n')
  const marker = FENCE_OPEN.exec(lines[0]!)![1]!
  const closing = new RegExp(`^ {0,3}\\${marker[0]!}{${marker.length},}\\s*$`)
  const body = lines.slice(1)
  if (body.length > 0 && closing.test(body[body.length - 1]!))
    body.pop()
  const lang = fenceLang(src)
  const attr = lang === undefined ? '' : ` class="language-${escapeAttr(lang)}"`
  return `<pre><code${attr}>${escapeText(body.join('\n'))}\n</code></pre>`
}

/** 缩进代码块：剥掉四列缩进，剩下的整段照原样escape。没有语言标注。 */
function renderIndentedCode(src: string): string {
  const body = contentLines(src).map(line => stripColumns(line, CODE_INDENT)).join('\n')
  return `<pre><code>${escapeText(body)}\n</code></pre>`
}

function renderMath(src: string): string {
  return `<p>${escapeText(contentLines(src).join('\n'))}</p>`
}

function renderHeading(src: string, defs: LinkDefs): string {
  const match = HEADING.exec(src.split('\n')[0]!)
  if (match === null)
    return `<p>${renderInline(src, defs)}</p>`
  const level = match[1]!.length
  const text = (match[2] ?? '').trim().replace(CLOSING_HASHES, '')
  return `<h${level}>${renderInline(text, defs)}</h${level}>`
}

function renderQuote(src: string, defs: LinkDefs, depth: number): string {
  const inner = contentLines(src)
    .map(line => line.replace(/^ {0,3}> ?/, ''))
    .join('\n')
  return `<blockquote>\n${renderBlocks(inner, defs, depth + 1)}\n</blockquote>`
}

/** 去掉最多 count 个前导空格。 */
function stripIndent(line: string, count: number): string {
  let i = 0
  while (i < count && line[i] === ' ') i++
  return line.slice(i)
}

/**
 * 一个列表项，连 `<li>` 一起产出。
 * 松列表里内容整块排布，`<li>` 与内容之间要换行；紧列表里首段的文字紧跟 `<li>`，
 * 其后若还有块（典型是嵌套列表）各自另起一行。收尾的 `</li>` 只要出现过块级内容就换行。
 */
function renderItem(src: string, defs: LinkDefs, depth: number, tight: boolean): string {
  if (src.trim() === '')
    return '<li></li>'
  if (!tight)
    return `<li>\n${renderBlocks(src, defs, depth + 1)}\n</li>`

  const lines = src.split('\n')
  const parts: string[] = []
  let blocky = false
  topLevelRanges(src).forEach((range, index) => {
    const block = lines.slice(range.startLine, range.endLine).join('\n')
    const paragraph = blockType(block) === 'paragraph'
    const html = paragraph ? renderInline(block.trim(), defs) : renderBlockHtml(block, defs, depth + 1)
    if (index === 0 && paragraph) {
      parts.push(html)
      return
    }
    blocky = true
    parts.push(`\n${html}`)
  })
  return `<li>${parts.join('')}${blocky ? '\n' : ''}</li>`
}

/** 这一项里有没有不属于任何块的空行：项之间隔了空行，或项内部空行分块。 */
function itemIsLoose(item: readonly string[], last: boolean): boolean {
  const lines = [...item]
  while (lines.length > 0 && lines[lines.length - 1]!.trim() === '') lines.pop()
  if (!last && lines.length < item.length)
    return true
  const inBlock = new Set<number>()
  for (const range of topLevelRanges(lines.join('\n'))) {
    for (let i = range.startLine; i < range.endLine; i++) inBlock.add(i)
  }
  return lines.some((line, i) => line.trim() === '' && !inBlock.has(i))
}

function renderList(src: string, defs: LinkDefs, depth: number): string {
  const lines = contentLines(src)
  const first = LIST_ITEM.exec(lines[0]!)!
  const baseIndent = first[1]!.length
  const ordered = ORDERED_MARKER.test(first[2]!)
  const items: string[][] = []
  let indent = first[0]!.length
  for (const line of lines) {
    const item = LIST_ITEM.exec(line)
    if (item && item[1]!.length <= baseIndent + 1) {
      indent = item[0]!.length
      items.push([line.slice(indent)])
      continue
    }
    if (items.length > 0)
      items[items.length - 1]!.push(stripIndent(line, indent))
  }
  const tight = !items.some((item, i) => itemIsLoose(item, i === items.length - 1))
  const body = items.map(item => renderItem(item.join('\n'), defs, depth, tight)).join('\n')
  if (!ordered)
    return `<ul>\n${body}\n</ul>`
  const start = Number.parseInt(ORDERED_MARKER.exec(first[2]!)![1]!, 10)
  return `<ol${start === 1 ? '' : ` start="${start}"`}>\n${body}\n</ol>`
}

function alignOf(spec: string): string {
  const text = spec.trim()
  if (text.startsWith(':') && text.endsWith(':'))
    return 'center'
  if (text.endsWith(':'))
    return 'right'
  return text.startsWith(':') ? 'left' : ''
}

function renderTable(src: string, defs: LinkDefs): string {
  const lines = contentLines(src)
  const head = splitRow(lines[0]!)
  const aligns = splitRow(lines[1]!).map(alignOf)
  const attrOf = (index: number): string => ALIGN_STYLE[aligns[index] ?? ''] ?? ''
  const headCells = head.map((cell, i) => `<th${attrOf(i)}>${renderInline(cell, defs)}</th>`).join('')
  const bodyLines = lines.slice(2)
  // 补齐后的单元格总数不超上限才补空单元格，超了就只出写了的那些并在 table 上留标记
  const pads = head.length * (bodyLines.length + 1) <= MAX_TABLE_CELLS
    ? head.map((_, i) => `<td${attrOf(i)}></td>`)
    : undefined
  const rows = bodyLines.map((line) => {
    // 多出表头的单元格丢掉，缺的补空
    const cells = splitRow(line)
    const width = Math.min(head.length, cells.length)
    let body = ''
    for (let i = 0; i < width; i++)
      body += `<td${attrOf(i)}>${renderInline(cells[i]!, defs)}</td>`
    if (pads !== undefined) {
      for (let i = width; i < head.length; i++)
        body += pads[i]!
    }
    return `<tr>${body}</tr>`
  })
  const body = rows.length === 0 ? '' : `\n<tbody>\n${rows.join('\n')}\n</tbody>`
  const mark = pads === undefined ? ' data-cells-omitted="true"' : ''
  return `<table${mark}>\n<thead>\n<tr>${headCells}</tr>\n</thead>${body}\n</table>`
}

/** 段落转 HTML；顶层段落开头的引用定义行不进正文，只剩定义时不产出标签。 */
function renderParagraph(src: string, defs: LinkDefs, depth: number): string {
  // 逐行剥行首空白：段落续行的缩进不进正文。行尾空白留着，硬换行靠的就是它
  const text = contentLines(src).map(line => line.replace(/^[ \t]+/, '')).join('\n')
  const body = depth === 0 ? splitDefinitions(text).rest : text
  return body === '' ? '' : `<p>${renderInline(body, defs)}</p>`
}

/** 一个顶层块转 HTML。 */
export function renderBlockHtml(src: string, defs: LinkDefs = NO_DEFS, depth = 0): string {
  if (depth > MAX_DEPTH)
    return `<p>${escapeText(src)}</p>`
  switch (blockType(src)) {
    case 'code':
      return renderCode(src)
    case 'indented-code':
      return renderIndentedCode(src)
    case 'math':
      return renderMath(src)
    case 'heading':
      return renderHeading(src, defs)
    case 'thematic':
      return '<hr>'
    case 'quote':
      return renderQuote(src, defs, depth)
    case 'list':
      return renderList(src, defs, depth)
    case 'table':
      return renderTable(src, defs)
    default:
      return renderParagraph(src, defs, depth)
  }
}

/** 一段可能含多个块的文本转 HTML。 */
export function renderBlocks(src: string, defs: LinkDefs = NO_DEFS, depth = 0): string {
  const lines = src.split('\n')
  return topLevelRanges(src)
    .map(range => renderBlockHtml(lines.slice(range.startLine, range.endLine).join('\n'), defs, depth))
    .join('\n')
}
