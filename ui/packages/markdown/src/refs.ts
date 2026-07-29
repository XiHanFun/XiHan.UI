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

const DEF_OPEN = /^ {0,3}\[/
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

/** 取定义里的目标地址，尖括号写法与裸写都认。 */
function scanDest(line: string, start: number): { value: string, end: number } | null {
  if (line[start] === '<') {
    const close = line.indexOf('>', start + 1)
    if (close === -1 || line.slice(start + 1, close).includes('<'))
      return null
    return { value: line.slice(start + 1, close), end: close + 1 }
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

/** 取定义里的引号标题，反斜杠转义的引号不算收尾。 */
function scanTitle(line: string, start: number): { value: string, end: number } | null {
  const quote = line[start]
  if (quote !== '"' && quote !== '\'')
    return null
  let i = start + 1
  while (i < line.length) {
    if (line[i] === '\\') {
      i += 2
      continue
    }
    if (line[i] === quote)
      return { value: line.slice(start + 1, i), end: i + 1 }
    i++
  }
  return null
}

/** 解析一行 `[标签]: 地址 "标题"`；不是完整定义返回 null。 */
function parseDefLine(line: string): LinkDefEntry | null {
  if (!DEF_OPEN.test(line))
    return null
  const open = line.indexOf('[')
  const close = closeLabel(line, open)
  if (close === -1 || line[close + 1] !== ':')
    return null
  const label = normalizeLabel(unescapeBackslash(line.slice(open + 1, close)))
  if (label === '')
    return null
  const dest = scanDest(line, skipSpaces(line, close + 2))
  if (dest === null)
    return null
  let i = skipSpaces(line, dest.end)
  let title = ''
  if (i < line.length) {
    if (i === dest.end)
      return null
    const parsed = scanTitle(line, i)
    if (parsed === null)
      return null
    title = unescapeBackslash(parsed.value)
    i = skipSpaces(line, parsed.end)
    if (i < line.length)
      return null
  }
  return [label, { dest: unescapeBackslash(dest.value), title }]
}

/** 摘掉块首连续的定义行，返回这些定义与剩下的正文。 */
export function splitDefinitions(src: string): { defs: readonly LinkDefEntry[], rest: string } {
  const lines = src.split('\n')
  const defs: LinkDefEntry[] = []
  let i = 0
  while (i < lines.length) {
    const entry = parseDefLine(lines[i]!)
    if (entry === null)
      break
    defs.push(entry)
    i++
  }
  return { defs, rest: lines.slice(i).join('\n') }
}

/** 取一个顶层块里的引用定义；只有段落块可能带定义。 */
export function blockDefinitions(src: string): readonly LinkDefEntry[] {
  return blockType(src) === 'paragraph' ? splitDefinitions(src).defs : []
}
