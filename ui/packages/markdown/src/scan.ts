/** 一个顶层块在源文本里占的行区间，左闭右开。 */
export interface BlockRange {
  readonly startLine: number
  readonly endLine: number
}

export type BlockType = 'code' | 'indented-code' | 'math' | 'heading' | 'setext' | 'thematic' | 'quote' | 'list' | 'table' | 'paragraph'

/**
 * Setext 下划线：整行只有等号或只有短横。
 * 缩进只认 0~3 列——第 4 列起是段落的续行，不是下划线。
 */
export const SETEXT_UNDERLINE = /^ {0,3}(?:=+|-+)[ \t]*$/

/**
 * 看着像链接引用定义的行。
 * 判据**故意保守**：权威解析在 refs 那边（那边还要拿地址与标题），这里只回答
 * 「下划线上面那几行算不算段落正文」。拿不准就按正文算，行为与从前一致。
 */
const LINK_DEF_LINE = /^ {0,3}\[[^\]\n]*\]:/

/** 缩进到这么多列就是代码块。 */
export const CODE_INDENT = 4

/** 行首缩进占几列。制表符走 4 列制表位，不按一个字符算。 */
export function indentWidth(line: string): number {
  let width = 0
  for (const ch of line) {
    if (ch === ' ')
      width += 1
    else if (ch === '\t')
      width += CODE_INDENT - (width % CODE_INDENT)
    else
      break
  }
  return width
}

/**
 * 剥掉行首 count 列缩进。
 * 制表符可能跨过要剥的边界（`  \tfoo` 剥 4 列时，那个制表符只该被吃掉一半），
 * 跨过的部分补回等量空格，不能整个吞掉。
 */
export function stripColumns(line: string, count: number): string {
  let width = 0
  let i = 0
  while (i < line.length && width < count) {
    const ch = line[i]!
    if (ch === ' ') {
      width += 1
      i += 1
      continue
    }
    if (ch !== '\t')
      break
    const next = width + CODE_INDENT - (width % CODE_INDENT)
    if (next > count)
      return ' '.repeat(next - count) + line.slice(i + 1)
    width = next
    i += 1
  }
  return line.slice(i)
}

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
  // 缩进够深就是代码，围栏、标题、引用、列表标记一律不再解释——它们自己都只认 0~3 列缩进
  if (indentWidth(line) >= CODE_INDENT && !BLANK_LINE.test(line))
    return 'indented-code'
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
  if (lines.length === 0)
    return 'paragraph'
  const first = typeAt(lines, 0)
  // 末行是下划线、且它上面确实是一段文字，整块才是 Setext 标题；
  // 只有下划线一行时它就是分隔线，另一种块顺手以 `---` 收尾也不算
  if (first === 'paragraph' && lines.length >= 2 && SETEXT_UNDERLINE.test(lines[lines.length - 1]!))
    return 'setext'
  return first
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

/**
 * 缩进代码块吃到缩进不够深的非空行为止。
 * 中间的空行算块的一部分，末尾的不算——它们不属于任何块。
 */
function scanIndentedCode(lines: readonly string[], start: number): number {
  let i = start + 1
  let end = start + 1
  while (i < lines.length) {
    const line = lines[i]!
    if (BLANK_LINE.test(line)) {
      i += 1
      continue
    }
    if (indentWidth(line) < CODE_INDENT)
      break
    i += 1
    end = i
  }
  return end
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
    // 连着几个空行都跳过，由空行之后的第一行非空行说了算：
    // 「两个空行结束列表」那条规则规范早就删了，留着会把一张松列表拦腰切成两张
    let j = i
    while (j < lines.length && BLANK_LINE.test(lines[j]!)) j++
    const next = lines[j]
    if (next === undefined || breaksList(next))
      return i
    if (!LIST_ITEM.test(next) && !/^ {2,}\S/.test(next))
      return i
    i = j + 1
  }
  return i
}

/**
 * 列表项能不能打断一个段落。
 * 只放行「标记后有内容」且「有序序号是 1」的那一种：否则段落里一句以「14.」开头的
 * 续行就会被切成一张从 14 起算的有序列表，而它本来只是句子的一部分。
 */
export function listInterruptsParagraph(line: string): boolean {
  const item = LIST_ITEM.exec(line)
  if (item === null)
    return false
  // 标记后什么都没有的项不打断：单独一行 `-` 接在段落后面仍算段落续行
  if (line.slice(item[0]!.length).trim() === '')
    return false
  const marker = item[2]!
  const digits = marker.slice(0, -1)
  // 无序标记没有序号这一说，一律放行
  return digits === '' || /^0*1$/.test(digits)
}

/** 段落吃到空行或另一种块的起始行为止；撞上 Setext 下划线则连它一起收，整块升成标题。 */
function scanParagraph(lines: readonly string[], start: number): number {
  let i = start + 1
  while (i < lines.length) {
    const line = lines[i]!
    if (BLANK_LINE.test(line))
      return i
    // 下划线优先于分隔线与空列表项：`---` 接在段落后面是二级标题，不是一条横线。
    // 但上面几行全是链接引用定义时没有段落可升级，那条下划线只是普通正文
    if (SETEXT_UNDERLINE.test(line)) {
      let onlyDefs = true
      for (let k = start; k < i && onlyDefs; k++) onlyDefs = LINK_DEF_LINE.test(lines[k]!)
      if (!onlyDefs)
        return i + 1
      i++
      continue
    }
    const type = typeAt(lines, i)
    // 缩进代码块打断不了段落：段落续行随手缩进几格仍是这一段的正文
    if (type === 'indented-code') {
      i++
      continue
    }
    // 打断不了段落的列表项按续行处理，不在这儿收尾
    if (type === 'list' && !listInterruptsParagraph(line)) {
      i++
      continue
    }
    if (type !== 'paragraph')
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
      case 'indented-code':
        i = scanIndentedCode(lines, i)
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
