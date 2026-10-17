/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// HTML 串按白名单换成富文本模型，不依赖 DOM：先切分、按浏览器的宽松规则搭出元素树，再逐个元素换成块与行内；
// 不认识的标签去掉标签、保留文字，脚本、样式表、内嵌框架这类连同内容去掉，丢掉的东西逐项记下。

import type { JsonObject } from '../json'
import type { HtmlToken } from './html-tokens'
import type { RichBlock, RichHeading, RichInline, RichList, RichListItem, RichMarks, RichParagraph, RichTextAlign, RichTextDocument } from './types'
import { isPlainObject } from '../json'
import { toSafeLinkHref } from '../url'
import { tokenizeHtml } from './html-tokens'
import { RICH_TEXT_MAX_LIST_DEPTH } from './types'
import { isRichFontFamily, parseCssColor, parseCssFontSize } from './values'

/**
 * 解析时丢掉的一类东西：
 * - element：标签去掉或降级，文字保留（如 `table`、`h4`、超过层数的列表）；
 * - content：连同内容去掉（如 `script`、`img`、`iframe`）；
 * - style：`style` 里不认识或取值不合法的属性（name 为属性名）；
 * - link：没过判定的链接地址，文字保留（name 为协议名）。
 */
export interface RichTextDrop {
  readonly kind: 'element' | 'content' | 'style' | 'link'
  readonly name: string
  readonly count: number
}

/** parseRichTextHtml 的结果。 */
export interface ParseRichTextHtmlResult {
  readonly document: RichTextDocument
  /** 丢掉的东西，按第一次出现的先后排，同类同名合成一条并计数。 */
  readonly dropped: readonly RichTextDrop[]
}

interface ElementNode {
  readonly name: string
  readonly attrs: ReadonlyMap<string, string>
  readonly children: TreeNode[]
}

type TreeNode = ElementNode | { readonly text: string }

const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr', 'keygen'])
/** 连同内容去掉的元素；后五个是文档头部的元信息，不记入丢弃清单。 */
const DROP_CONTENT = new Set(['script', 'style', 'iframe', 'object', 'embed', 'applet', 'img', 'picture', 'svg', 'math', 'video', 'audio', 'canvas', 'source', 'track', 'template', 'noscript', 'noembed', 'noframes', 'frame', 'frameset', 'map', 'area', 'input', 'button', 'select', 'option', 'optgroup', 'textarea', 'datalist', 'output', 'progress', 'meter', 'dialog', 'param', 'head', 'title', 'meta', 'link', 'base'])
const QUIET_DROP = new Set(['head', 'title', 'meta', 'link', 'base'])
/** 当作块容器、自己不留下结构的元素；REPORTED_CONTAINERS 里的另记一条 element。 */
const CONTAINERS = new Set(['p', 'div', 'section', 'article', 'main', 'header', 'footer', 'aside', 'nav', 'address', 'center', 'figure', 'figcaption', 'blockquote', 'pre', 'details', 'summary', 'form', 'fieldset', 'legend', 'dl', 'dt', 'dd', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'colgroup', 'html', 'body', 'hgroup', 'search'])
const REPORTED_CONTAINERS = new Set(['blockquote', 'pre', 'figure', 'details', 'form', 'fieldset', 'dl', 'table'])
const HEADINGS: Readonly<Record<string, 1 | 2 | 3>> = { h1: 1, h2: 2, h3: 3, h4: 3, h5: 3, h6: 3 }
const LISTS = new Set(['ul', 'ol', 'menu'])
/** 只带行内样式、去掉标签不丢信息的元素。 */
const QUIET_INLINE = new Set(['span', 'font', 'a', 'strong', 'b', 'em', 'i', 'cite', 'dfn', 'var', 'u', 'ins', 's', 'strike', 'del', 'sup', 'sub', 'mark', 'code', 'kbd', 'samp', 'tt', 'abbr', 'time', 'label', 'data', 'bdi', 'bdo', 'nobr'])
/** 出现时收尾一个还开着的段落的元素。 */
const CLOSES_PARAGRAPH = new Set([...CONTAINERS, ...LISTS, ...Object.keys(HEADINGS), 'p', 'hr', 'li'])

class Reporter {
  readonly #entries = new Map<string, { kind: RichTextDrop['kind'], name: string, count: number }>()

  add(kind: RichTextDrop['kind'], name: string): void {
    const key = `${kind}\u0000${name}`
    const entry = this.#entries.get(key)
    if (entry === undefined)
      this.#entries.set(key, { kind, name, count: 1 })
    else
      entry.count++
  }

  list(): RichTextDrop[] {
    return [...this.#entries.values()].map(entry => ({ ...entry }))
  }
}

/** 按浏览器的宽松规则搭元素树：空元素不入栈，块元素收尾还开着的段落，新的 li 收尾同一列表里的上一项。 */
function buildTree(tokens: readonly HtmlToken[]): ElementNode {
  const root: ElementNode = { name: '#root', attrs: new Map(), children: [] }
  const stack: ElementNode[] = [root]
  const top = (): ElementNode => stack[stack.length - 1] as ElementNode
  const closeFrom = (index: number): void => {
    stack.length = Math.max(1, index)
  }
  const openIndex = (name: string, stopAt: ReadonlySet<string>): number => {
    for (let index = stack.length - 1; index > 0; index--) {
      const current = (stack[index] as ElementNode).name
      if (current === name)
        return index
      if (stopAt.has(current))
        return -1
    }
    return -1
  }
  const paragraphScope = new Set([...CONTAINERS, ...LISTS, 'li'].filter(name => name !== 'p'))
  const noScope = new Set<string>()

  for (const token of tokens) {
    if (token.kind === 'text') {
      if (!token.raw)
        top().children.push({ text: token.text })
      continue
    }
    if (token.kind === 'end') {
      if (token.name === 'br') {
        top().children.push({ name: 'br', attrs: new Map(), children: [] })
        continue
      }
      const index = openIndex(token.name, noScope)
      if (index > 0)
        closeFrom(index)
      else if (token.name === 'p')
        top().children.push({ name: 'p', attrs: new Map(), children: [] })
      continue
    }
    if (CLOSES_PARAGRAPH.has(token.name)) {
      const index = openIndex('p', paragraphScope)
      if (index > 0)
        closeFrom(index)
    }
    if (token.name === 'li') {
      const index = openIndex('li', LISTS)
      if (index > 0)
        closeFrom(index)
    }
    if (token.name in HEADINGS) {
      for (let index = stack.length - 1; index > 0; index--) {
        if ((stack[index] as ElementNode).name in HEADINGS) {
          closeFrom(index)
          break
        }
      }
    }
    const node: ElementNode = { name: token.name, attrs: token.attrs, children: [] }
    top().children.push(node)
    if (!VOID.has(token.name) && !token.selfClosing)
      stack.push(node)
  }
  return root
}

function sameMarks(a: RichMarks | undefined, b: RichMarks | undefined): boolean {
  const left = Object.entries(a ?? {})
  const right = b ?? {}
  return left.length === Object.keys(right).length && left.every(([key, value]) => right[key as keyof RichMarks] === value)
}

function compactMarks(marks: RichMarks): RichMarks | undefined {
  const entries = Object.entries(marks).filter(([, value]) => value !== undefined && value !== false)
  return entries.length === 0 ? undefined : Object.fromEntries(entries) as RichMarks
}

interface PendingParagraph {
  readonly runs: RichInline[]
  readonly align: RichTextAlign | undefined
  explicit: boolean
}

/** 一段正在收集的块：行内内容攒成段落，遇到块时先收尾段落。 */
class BlockSink {
  readonly blocks: RichBlock[] = []
  #paragraph: PendingParagraph | undefined
  readonly align: RichTextAlign | undefined

  constructor(align: RichTextAlign | undefined) {
    this.align = align
  }

  #current(): PendingParagraph {
    this.#paragraph ??= { runs: [], align: this.align, explicit: false }
    return this.#paragraph
  }

  appendText(text: string, marks: RichMarks, preserve: boolean): void {
    if (text === '')
      return
    const runs = this.#current().runs
    let value = text
    if (!preserve) {
      const previous = runs[runs.length - 1]
      if ((previous === undefined || previous.type === 'break' || (previous.type === 'text' && previous.text.endsWith(' '))) && value.startsWith(' '))
        value = value.slice(1)
      if (value === '')
        return
    }
    const compact = compactMarks(marks)
    const last = runs[runs.length - 1]
    if (last?.type === 'text' && sameMarks(last.marks, compact))
      runs[runs.length - 1] = { ...last, text: last.text + value }
    else
      runs.push(compact === undefined ? { type: 'text', text: value } : { type: 'text', text: value, marks: compact })
  }

  appendInline(run: RichInline): void {
    const paragraph = this.#current()
    if (run.type === 'break') {
      const last = paragraph.runs[paragraph.runs.length - 1]
      if (last?.type === 'text' && last.text.endsWith(' '))
        paragraph.runs[paragraph.runs.length - 1] = { ...last, text: last.text.replace(/ +$/, '') }
      paragraph.explicit = true
    }
    paragraph.runs.push(run)
  }

  pushBlock(block: RichBlock): void {
    this.flush()
    this.blocks.push(block)
  }

  flush(): void {
    const paragraph = this.#paragraph
    this.#paragraph = undefined
    if (paragraph === undefined)
      return
    const runs = paragraph.runs.filter(run => run.type !== 'text' || run.text !== '')
    const last = runs[runs.length - 1]
    if (last?.type === 'text' && last.text.endsWith(' ')) {
      const trimmed = last.text.replace(/ +$/, '')
      if (trimmed === '')
        runs.pop()
      else
        runs[runs.length - 1] = { ...last, text: trimmed }
    }
    if (runs[runs.length - 1]?.type === 'break')
      runs.pop()
    if (runs.length === 0 && !paragraph.explicit)
      return
    this.blocks.push(paragraph.align === undefined ? { type: 'paragraph', runs } : { type: 'paragraph', runs, align: paragraph.align })
  }
}

interface Walk {
  readonly reporter: Reporter
  readonly depth: number
  readonly preserve: boolean
}

function styleDeclarations(style: string | undefined): [string, string][] {
  if (style === undefined)
    return []
  return style.split(';').flatMap((declaration) => {
    const colon = declaration.indexOf(':')
    if (colon < 0)
      return []
    const property = declaration.slice(0, colon).trim().toLowerCase()
    const value = declaration.slice(colon + 1).replace(/!important\s*$/i, '').trim()
    return property === '' ? [] : [[property, value] as [string, string]]
  })
}

function alignValue(value: string): RichTextAlign | undefined {
  switch (value.trim().toLowerCase()) {
    case 'left':
    case 'start':
      return 'left'
    case 'center':
      return 'center'
    case 'right':
    case 'end':
      return 'right'
    case 'justify':
      return 'justify'
    default:
      return undefined
  }
}

/** 块的对齐：`style` 的 text-align 或旧写法的 align 属性；center 元素居中。 */
function alignOf(node: ElementNode, inherited: RichTextAlign | undefined, reporter: Reporter): RichTextAlign | undefined {
  let align = node.name === 'center' ? 'center' : inherited
  const attribute = node.attrs.get('align')
  if (attribute !== undefined)
    align = alignValue(attribute) ?? align
  for (const [property, value] of styleDeclarations(node.attrs.get('style'))) {
    if (property !== 'text-align')
      continue
    const parsed = alignValue(value)
    if (parsed === undefined)
      reporter.add('style', property)
    else
      align = parsed
  }
  return align
}

function schemeOf(href: string): string {
  return /^([a-z][a-z0-9+.-]*):/i.exec(href.trim())?.[1]?.toLowerCase() ?? href.trim().slice(0, 16)
}

/** 元素带来的行内样式：标签本身的语义加上 `style` 里认得的属性。 */
function marksOf(node: ElementNode, base: RichMarks, reporter: Reporter): RichMarks {
  const marks: { -readonly [K in keyof RichMarks]: RichMarks[K] } = { ...base }
  switch (node.name) {
    case 'strong':
    case 'b':
      marks.bold = true
      break
    case 'em':
    case 'i':
    case 'cite':
    case 'dfn':
    case 'var':
      marks.italic = true
      break
    case 'u':
    case 'ins':
      marks.underline = true
      break
    case 's':
    case 'strike':
    case 'del':
      marks.lineThrough = true
      break
    case 'sup':
      marks.superscript = true
      marks.subscript = undefined
      break
    case 'sub':
      marks.subscript = true
      marks.superscript = undefined
      break
    case 'mark':
      marks.background = parseCssColor(node.attrs.get('data-color') ?? '') ?? '#FFFF00'
      break
    case 'code':
    case 'kbd':
    case 'samp':
    case 'tt':
      marks.fontFamily ??= 'monospace'
      break
    case 'a': {
      const href = node.attrs.get('href')
      if (href !== undefined) {
        const safe = toSafeLinkHref(href)
        if (safe === undefined)
          reporter.add('link', schemeOf(href))
        else
          marks.link = safe
      }
      break
    }
    case 'font': {
      const color = node.attrs.get('color')
      if (color !== undefined) {
        const parsed = parseCssColor(color)
        if (parsed === undefined)
          reporter.add('style', 'color')
        else
          marks.color = parsed
      }
      const face = node.attrs.get('face')
      if (face !== undefined && isRichFontFamily(face))
        marks.fontFamily = face.trim()
      break
    }
  }
  for (const [property, value] of styleDeclarations(node.attrs.get('style'))) {
    const lower = value.toLowerCase()
    switch (property) {
      case 'color':
      case 'background-color':
      case 'background': {
        const parsed = parseCssColor(value)
        if (parsed === undefined)
          reporter.add('style', property)
        else if (property === 'color')
          marks.color = parsed
        else
          marks.background = parsed
        break
      }
      case 'font-weight': {
        const weight = Number(lower)
        if (lower === 'bold' || lower === 'bolder' || weight >= 600)
          marks.bold = true
        else if (lower === 'normal' || lower === 'lighter' || weight > 0)
          marks.bold = undefined
        else
          reporter.add('style', property)
        break
      }
      case 'font-style':
        if (lower === 'italic' || lower.startsWith('oblique'))
          marks.italic = true
        else if (lower === 'normal')
          marks.italic = undefined
        else
          reporter.add('style', property)
        break
      case 'text-decoration':
      case 'text-decoration-line':
        if (lower.includes('none')) {
          marks.underline = undefined
          marks.lineThrough = undefined
        }
        if (lower.includes('underline'))
          marks.underline = true
        if (lower.includes('line-through'))
          marks.lineThrough = true
        break
      case 'vertical-align':
        if (lower === 'super') {
          marks.superscript = true
          marks.subscript = undefined
        }
        else if (lower === 'sub') {
          marks.subscript = true
          marks.superscript = undefined
        }
        else if (lower === 'baseline') {
          marks.superscript = undefined
          marks.subscript = undefined
        }
        else {
          reporter.add('style', property)
        }
        break
      case 'font-size': {
        const size = parseCssFontSize(value)
        if (size === undefined)
          reporter.add('style', property)
        else
          marks.fontSize = size
        break
      }
      case 'font-family':
        if (isRichFontFamily(value))
          marks.fontFamily = value.trim()
        else
          reporter.add('style', property)
        break
      case 'text-align':
        break
      default:
        reporter.add('style', property)
    }
  }
  return marks
}

function textOf(text: string, preserve: boolean): string {
  return preserve ? text : text.replace(/[ \t\n\r\f]+/g, ' ')
}

function emptyParagraph(align: RichTextAlign | undefined): RichParagraph {
  return align === undefined ? { type: 'paragraph', runs: [] } : { type: 'paragraph', runs: [], align }
}

function walk(nodes: readonly TreeNode[], marks: RichMarks, sink: BlockSink, context: Walk): void {
  for (const node of nodes) {
    if ('text' in node) {
      if (context.preserve) {
        node.text.split(/\r?\n/).forEach((line, index) => {
          if (index > 0)
            sink.appendInline({ type: 'break' })
          sink.appendText(line, marks, true)
        })
      }
      else {
        sink.appendText(textOf(node.text, false), marks, false)
      }
      continue
    }
    walkElement(node, marks, sink, context)
  }
}

function walkElement(node: ElementNode, marks: RichMarks, sink: BlockSink, context: Walk): void {
  const { reporter } = context
  const name = node.name
  if (DROP_CONTENT.has(name)) {
    if (!QUIET_DROP.has(name))
      reporter.add('content', name)
    return
  }
  if (name === 'br') {
    sink.appendInline({ type: 'break' })
    return
  }
  if (name === 'hr') {
    sink.pushBlock({ type: 'divider' })
    return
  }
  const field = name === 'span' ? node.attrs.get('data-field')?.trim() : undefined
  if (field !== undefined && field !== '') {
    const fieldMarks = compactMarks(marksOf(node, marks, reporter))
    let format: unknown
    try {
      format = JSON.parse(node.attrs.get('data-format') ?? 'null')
    }
    catch {
      format = undefined
    }
    sink.appendInline({
      type: 'field',
      field,
      ...(isPlainObject(format) ? { format: format as JsonObject } : {}),
      ...(fieldMarks === undefined ? {} : { marks: fieldMarks }),
    })
    return
  }
  if (name in HEADINGS) {
    if (HEADINGS[name] === 3 && name !== 'h3')
      reporter.add('element', name)
    sink.flush()
    const inner = new BlockSink(alignOf(node, sink.align, reporter))
    walk(node.children, marksOf(node, marks, reporter), inner, context)
    inner.flush()
    for (const block of inner.blocks) {
      if (block.type === 'paragraph') {
        const heading: RichHeading = { type: 'heading', level: HEADINGS[name] as 1 | 2 | 3, runs: block.runs }
        sink.pushBlock(block.align === undefined ? heading : { ...heading, align: block.align })
      }
      else {
        sink.pushBlock(block)
      }
    }
    return
  }
  if (LISTS.has(name)) {
    sink.flush()
    walkList(node, marks, sink, context)
    return
  }
  if (CONTAINERS.has(name) || name === 'li') {
    if (REPORTED_CONTAINERS.has(name) || name === 'li')
      reporter.add('element', name)
    sink.flush()
    const inner = new BlockSink(alignOf(node, sink.align, reporter))
    const preserve = context.preserve || name === 'pre'
    walk(node.children, marksOf(node, marks, reporter), inner, preserve === context.preserve ? context : { ...context, preserve })
    inner.flush()
    if (inner.blocks.length === 0 && name === 'p')
      inner.blocks.push(emptyParagraph(inner.align))
    for (const block of inner.blocks)
      sink.pushBlock(block)
    return
  }
  if (!QUIET_INLINE.has(name) && name !== 'html' && name !== 'body')
    reporter.add('element', name)
  walk(node.children, marksOf(node, marks, reporter), sink, context)
}

function walkList(node: ElementNode, marks: RichMarks, sink: BlockSink, context: Walk): void {
  const depth = context.depth + 1
  const listMarks = marksOf(node, marks, context.reporter)
  const items: RichListItem[] = []
  let loose: BlockSink | undefined
  const flushLoose = (): void => {
    if (loose === undefined)
      return
    loose.flush()
    if (loose.blocks.length > 0)
      items.push({ blocks: loose.blocks })
    loose = undefined
  }
  for (const child of node.children) {
    if (!('text' in child) && child.name === 'li') {
      flushLoose()
      const inner = new BlockSink(alignOf(child, undefined, context.reporter))
      walk(child.children, marksOf(child, listMarks, context.reporter), inner, { ...context, depth })
      inner.flush()
      items.push({ blocks: inner.blocks.length > 0 ? inner.blocks : [emptyParagraph(inner.align)] })
      continue
    }
    if ('text' in child && child.text.trim() === '')
      continue
    loose ??= new BlockSink(undefined)
    walk([child], listMarks, loose, { ...context, depth })
  }
  flushLoose()
  if (depth > RICH_TEXT_MAX_LIST_DEPTH) {
    context.reporter.add('element', node.name)
    for (const item of items) {
      for (const block of item.blocks)
        sink.pushBlock(block)
    }
    return
  }
  const ordered = node.name === 'ol'
  const start = Number(node.attrs.get('start'))
  const list: RichList = ordered && Number.isInteger(start) && start >= 0 && start <= 999_999 && start !== 1
    ? { type: 'list', ordered, start, items }
    : { type: 'list', ordered, items }
  sink.pushBlock(list)
}

/**
 * 把一段 HTML 按白名单换成富文本模型，不依赖 DOM，浏览器与 Node.js 里都能用。
 *
 * - 块：`p`、`div` 一类容器成为段落，`h1`–`h3` 成为标题（`h4`–`h6` 降成三级标题），`ul`、`ol` 成为列表
 *   （超过三层的展平到上一层），`hr` 成为分隔线；表格、引用、`pre` 等去掉结构、保留文字。
 * - 行内：`strong`/`b`、`em`/`i`、`u`、`s`/`del`、`sup`、`sub`、`mark`、`code`、`a`、`font`，以及 `style` 里的
 *   color、background-color、font-weight、font-style、text-decoration、vertical-align、font-size（px、pt）、
 *   font-family 与块的 text-align；`span` 带 `data-field` 时成为行内字段。
 * - 链接只留 `toSafeLinkHref` 放行的地址；script、style、iframe、img 等连同内容去掉。
 *
 * 空白按 HTML 的规则合并，段落首尾与换行两侧的空格去掉。丢掉的东西都记在 `dropped` 里。
 *
 * @example
 * parseRichTextHtml('<p>你好，<strong>世界</strong></p><script>x()</script>')
 * // { document: { blocks: [{ type: 'paragraph', runs: [{ type: 'text', text: '你好，' }, { type: 'text', text: '世界', marks: { bold: true } }] }] },
 * //   dropped: [{ kind: 'content', name: 'script', count: 1 }] }
 */
export function parseRichTextHtml(html: string): ParseRichTextHtmlResult {
  const reporter = new Reporter()
  const root = buildTree(tokenizeHtml(html))
  const sink = new BlockSink(undefined)
  walk(root.children, {}, sink, { reporter, depth: 0, preserve: false })
  sink.flush()
  return { document: { blocks: sink.blocks }, dropped: reporter.list() }
}
