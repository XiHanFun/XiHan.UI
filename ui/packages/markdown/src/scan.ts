/** 一个顶层块在源文本里占的行区间，左闭右开。 */
export interface BlockRange {
  readonly startLine: number
  readonly endLine: number
}

export type BlockType = 'code' | 'math' | 'heading' | 'thematic' | 'quote' | 'list' | 'table' | 'paragraph'

/** 围栏起始行：``` 或 ~~~ 起步，捕获围栏与信息串；反引号围栏后整行不得再有反引号。 */
export const FENCE_OPEN = /^ {0,3}(?=(?:`{3,}[^`\n]*|~{3}[^\n]*)(?:\n|$))(`{3,}|~{3,})[ \t]*(\S*)/
export const MATH_FENCE = /^ {0,3}\$\$/
export const LIST_ITEM = /^( {0,7})([-*+]|\d{1,9}[.)])(?:\s+|$)/
const BLANK_LINE = /^\s*$/
const ATX_HEADING = /^ {0,3}#{1,6}(?:\s|$)/
/** 分隔线：三个星号、三个以上短横或下划线、或标记之间带空格的写法。 */
const THEMATIC_BREAK = /^ {0,3}(?:\*{3}|-{3,}|_{3,}|(?:([*\-_])[ \t]+){2,}\1)[ \t]*$/
const BLOCK_QUOTE = /^ {0,3}>/
/** 表格分隔行的单元格：可带对齐冒号的一串短横。 */
const DELIM_CELL = /^:?-+:?$/

/** 按未转义的竖线切一行表格单元格。 */
export function splitRow(line: string): string[] {
  const cells: string[] = []
  let cell = ''
  let text = line.trim()
  if (text.startsWith('|'))
    text = text.slice(1)
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!
    if (ch === '\\' && text[i + 1] === '|') {
      cell += '|'
      i++
      continue
    }
    if (ch === '|') {
      cells.push(cell.trim())
      cell = ''
      continue
    }
    cell += ch
  }
  if (cell.trim() !== '' || cells.length === 0)
    cells.push(cell.trim())
  return cells
}

/** 该行是否是表头：本行含竖线，下一行是列数相同的分隔行。 */
function isTableHead(lines: readonly string[], index: number): boolean {
  const head = lines[index]
  const delim = lines[index + 1]
  if (head === undefined || delim === undefined || !head.includes('|'))
    return false
  const cells = splitRow(delim)
  return cells.length === splitRow(head).length && cells.every(cell => DELIM_CELL.test(cell))
}

/** 列表项的标记种类：无序取标记字符，有序取分隔符。 */
function markerKey(item: RegExpExecArray): string {
  const marker = item[2]!
  return marker[marker.length - 1]!
}

/** 判断某一行起头的块属于哪种类型。 */
function typeAt(lines: readonly string[], index: number): BlockType {
  const line = lines[index]!
  if (FENCE_OPEN.test(line))
    return 'code'
  if (MATH_FENCE.test(line))
    return 'math'
  if (THEMATIC_BREAK.test(line))
    return 'thematic'
  if (ATX_HEADING.test(line))
    return 'heading'
  if (BLOCK_QUOTE.test(line))
    return 'quote'
  if (LIST_ITEM.test(line))
    return 'list'
  if (isTableHead(lines, index))
    return 'table'
  return 'paragraph'
}

/** 判断一段块源文本属于哪种类型。 */
export function blockType(src: string): BlockType {
  const lines = src.split('\n')
  return lines.length === 0 ? 'paragraph' : typeAt(lines, 0)
}

/** 找围栏的闭合行，返回其下一行的下标；没闭合则返回末尾。 */
function scanFence(lines: readonly string[], start: number): number {
  const marker = FENCE_OPEN.exec(lines[start]!)![1]!
  const closing = new RegExp(`^ {0,3}\\${marker[0]!}{${marker.length},}\\s*$`)
  for (let i = start + 1; i < lines.length; i++) {
    if (closing.test(lines[i]!))
      return i + 1
  }
  return lines.length
}

/** 找 $$ 段的结束行下一行；没闭合则返回末尾。 */
function scanMath(lines: readonly string[], start: number): number {
  const first = lines[start]!.trim()
  if (first.length > 2 && first.endsWith('$$'))
    return start + 1
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i]!.includes('$$'))
      return i + 1
  }
  return lines.length
}

/** 一路吃到空行为止。 */
function scanUntilBlank(lines: readonly string[], start: number): number {
  let i = start + 1
  while (i < lines.length && !BLANK_LINE.test(lines[i]!)) i++
  return i
}

/** 该行前面有几个空格。 */
function indentOf(line: string): number {
  let i = 0
  while (line[i] === ' ') i++
  return i
}

/** 该行是否起了一个不必隔空行就能打断上一块的块；quoteBreaks 决定引用算不算。 */
function interrupts(line: string, quoteBreaks: boolean): boolean {
  if (FENCE_OPEN.test(line) || MATH_FENCE.test(line) || THEMATIC_BREAK.test(line) || ATX_HEADING.test(line))
    return true
  return quoteBreaks && BLOCK_QUOTE.test(line)
}

/** 引用吃到空行为止；不带 > 的行起了别的块也收尾。 */
function scanQuote(lines: readonly string[], start: number): number {
  let i = start + 1
  while (i < lines.length && !BLANK_LINE.test(lines[i]!)) {
    const line = lines[i]!
    if (!BLOCK_QUOTE.test(line) && interrupts(line, false))
      return i
    i++
  }
  return i
}

/** 列表吃到空行为止；空行后紧跟列表项或缩进行则继续。换标记符或起了别的块另算。 */
function scanList(lines: readonly string[], start: number): number {
  const first = LIST_ITEM.exec(lines[start]!)!
  const key = markerKey(first)
  const baseIndent = first[1]!.length
  /** 该行是否另起一张列表。 */
  const breaksList = (line: string): boolean => {
    const item = LIST_ITEM.exec(line)
    return item !== null && item[1]!.length <= baseIndent + 1 && markerKey(item) !== key
  }
  /** 该行是否在列表缩进之外起了别的块。 */
  const breaksBlock = (line: string): boolean => indentOf(line) <= baseIndent && interrupts(line, true)
  let i = start + 1
  while (i < lines.length) {
    const line = lines[i]!
    if (!BLANK_LINE.test(line)) {
      if (breaksList(line) || breaksBlock(line))
        return i
      i++
      continue
    }
    const next = lines[i + 1]
    if (next === undefined || BLANK_LINE.test(next) || breaksList(next))
      return i
    if (!LIST_ITEM.test(next) && !/^ {2,}\S/.test(next))
      return i
    i += 2
  }
  return i
}

/** 段落吃到空行或另一种块的起始行为止。 */
function scanParagraph(lines: readonly string[], start: number): number {
  let i = start + 1
  while (i < lines.length) {
    if (BLANK_LINE.test(lines[i]!) || typeAt(lines, i) !== 'paragraph')
      return i
    i++
  }
  return i
}

/** 按顶层块把源文本切成行区间，块之间的空行不属于任何块。 */
export function topLevelRanges(src: string): readonly BlockRange[] {
  const lines = src.split('\n')
  const out: BlockRange[] = []
  let i = 0
  while (i < lines.length) {
    if (BLANK_LINE.test(lines[i]!)) {
      i++
      continue
    }
    const startLine = i
    switch (typeAt(lines, i)) {
      case 'code':
        i = scanFence(lines, i)
        break
      case 'math':
        i = scanMath(lines, i)
        break
      case 'heading':
      case 'thematic':
        i += 1
        break
      case 'quote':
        i = scanQuote(lines, i)
        break
      case 'list':
        i = scanList(lines, i)
        break
      case 'paragraph':
        i = scanParagraph(lines, i)
        break
      default:
        i = scanUntilBlank(lines, i)
        break
    }
    out.push({ startLine, endLine: i })
  }
  return out
}
