import { unescapeBackslash } from './escape'
import { blockType } from './scan'

/** 一条引用式链接定义的目标与标题。 */
export interface LinkDef {
  readonly dest: string
  readonly title: string
}

/** 归一化标签到定义的映射。 */
export type LinkDefs = ReadonlyMap<string, LinkDef>

/** 一条定义的标签与内容。 */
export type LinkDefEntry = readonly [label: string, def: LinkDef]

/** 没有任何定义时用的空表。 */
export const NO_DEFS: LinkDefs = new Map<string, LinkDef>()

const WHITESPACE_RUN = /\s+/g

/** 归一化引用标签：去首尾空白、内部空白折叠成一个空格、转小写。 */
export function normalizeLabel(label: string): string {
  return label.trim().replace(WHITESPACE_RUN, ' ').toLowerCase()
}

/** 跳过空格与制表符，返回停下的下标。 */
function skipSpaces(line: string, start: number): number {
  let i = start
  while (line[i] === ' ' || line[i] === '\t') i++
  return i
}

/**
 * 跳过空白，最多跨过一个换行。
 * 跨到第二个换行（也就是撞上空行）返回 null——空行终结一条定义，
 * 标签、地址、标题可以各占一行，但中间不许空着。
 */
function skipSpacesOverOneBreak(src: string, start: number): number | null {
  const first = skipSpaces(src, start)
  if (src[first] !== '\n')
    return first
  const second = skipSpaces(src, first + 1)
  return src[second] === '\n' ? null : second
}

/** 本行余下只剩空白时返回下一行的起点（到头则返回长度），否则返回 null。 */
function endOfBlankRest(src: string, start: number): number | null {
  const i = skipSpaces(src, start)
  if (i >= src.length)
    return src.length
  return src[i] === '\n' ? i + 1 : null
}

/** 这段文字里夹着空行。定义的任何一段都不许跨空行。 */
function hasBlankLine(text: string): boolean {
  return /\n[ \t]*\n/.test(text)
}

/** 找标签的右方括号，反斜杠转义的方括号不算；找不到返回 -1。 */
function closeLabel(line: string, open: number): number {
  let i = open + 1
  while (i < line.length) {
    if (line[i] === '\\') {
      i += 2
      continue
    }
    if (line[i] === ']')
      return i
    i++
  }
  return -1
}

/** 取定义里的目标地址，尖括号写法与裸写都认。地址自身不许跨行。 */
function scanDest(line: string, start: number): { value: string, end: number } | null {
  if (line[start] === '<') {
    const close = line.indexOf('>', start + 1)
    if (close === -1)
      return null
    const inner = line.slice(start + 1, close)
    if (inner.includes('<') || inner.includes('\n'))
      return null
    return { value: inner, end: close + 1 }
  }
  let i = start
  while (i < line.length) {
    const ch = line[i]!
    if (ch === '\\' && i + 1 < line.length) {
      i += 2
      continue
    }
    if (/\s/.test(ch) || ch.codePointAt(0)! < 0x20)
      break
    i++
  }
  return i === start ? null : { value: line.slice(start, i), end: i }
}

/**
 * 取定义里的标题，三种括法都认：双引号、单引号、圆括号。
 * 反斜杠转义的收尾符不算收尾；标题可以跨行，但不许跨空行。
 */
function scanTitle(line: string, start: number): { value: string, end: number } | null {
  const open = line[start]
  if (open !== '"' && open !== '\'' && open !== '(')
    return null
  const close = open === '(' ? ')' : open
  let i = start + 1
  while (i < line.length) {
    if (line[i] === '\\') {
      i += 2
      continue
    }
    if (line[i] === close) {
      const value = line.slice(start + 1, i)
      return hasBlankLine(value) ? null : { value, end: i + 1 }
    }
    i++
  }
  return null
}

/**
 * 从 start 处解析一条 `[标签]: 地址 "标题"`，读到哪儿一并返回。
 *
 * 三段可以各占一行——`[标签]:` 换行写地址、地址换行写标题都成立，
 * 所以整条定义只能按游标跨行读，不能按行读。段与段之间不许夹空行。
 * 标题解析不成时**退回没有标题的那份**：`[foo]: /url 'title` 里那半截引号
 * 不是标题，但前面的地址仍要看它本行余下是不是空的才算数。
 */
function parseDefinitionAt(src: string, start: number): { entry: LinkDefEntry, end: number } | null {
  let i = start
  let indent = 0
  while (src[i] === ' ' && indent < 3) {
    i += 1
    indent += 1
  }
  if (src[i] !== '[')
    return null

  const close = closeLabel(src, i)
  if (close === -1 || src[close + 1] !== ':')
    return null
  const rawLabel = src.slice(i + 1, close)
  if (hasBlankLine(rawLabel))
    return null
  const label = normalizeLabel(unescapeBackslash(rawLabel))
  if (label === '')
    return null

  const destStart = skipSpacesOverOneBreak(src, close + 2)
  if (destStart === null)
    return null
  const dest = scanDest(src, destStart)
  if (dest === null)
    return null
  const def = { dest: unescapeBackslash(dest.value), title: '' }

  const titleStart = skipSpacesOverOneBreak(src, dest.end)
  // 地址与标题之间必须隔着空白，紧挨着的引号不是标题
  if (titleStart !== null && titleStart > dest.end) {
    const title = scanTitle(src, titleStart)
    const after = title === null ? null : endOfBlankRest(src, title.end)
    if (title !== null && after !== null)
      return { entry: [label, { ...def, title: unescapeBackslash(title.value) }], end: after }
  }

  const end = endOfBlankRest(src, dest.end)
  return end === null ? null : { entry: [label, def], end }
}

/** 摘掉块首连续的定义，返回这些定义与剩下的正文。 */
export function splitDefinitions(src: string): { defs: readonly LinkDefEntry[], rest: string } {
  const defs: LinkDefEntry[] = []
  let i = 0
  while (i < src.length) {
    const parsed = parseDefinitionAt(src, i)
    if (parsed === null)
      break
    defs.push(parsed.entry)
    i = parsed.end
  }
  return { defs, rest: src.slice(i) }
}

/** 取一个顶层块里的引用定义；只有段落块可能带定义。 */
export function blockDefinitions(src: string): readonly LinkDefEntry[] {
  return blockType(src) === 'paragraph' ? splitDefinitions(src).defs : []
}
