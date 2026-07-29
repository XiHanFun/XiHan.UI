import type { LinkDefs } from './refs'
import { escapeAttr, escapeText, safeUrl, unescapeBackslash } from './escape'
import { NO_DEFS, normalizeLabel } from './refs'

const ESCAPABLE = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/
const AUTOLINK_URI = /^<([a-z][a-z0-9+.-]{1,31}:[^\s<>]*)>/i
const AUTOLINK_EMAIL = /^<([^\s<>@]+@[a-z0-9][a-z0-9.-]*\.[a-z]{2,})>/i
const WHITESPACE = /\s/
/** 标点：ASCII 标点与 Unicode 的标点、符号两类。 */
const PUNCTUATION = /[\p{P}\p{S}]/u
const MAX_DEPTH = 8
/** 引用式链接标签的字符数上限。 */
const MAX_REF_LABEL = 999

/** 只在这个位置试探的字符引用写法，尾分号必写。 */
const ENTITY = /&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z][a-z0-9]{1,31});/iy

const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  apos: '\'',
  asymp: '≈',
  bull: '•',
  cent: '¢',
  copy: '©',
  dagger: '†',
  darr: '↓',
  deg: '°',
  divide: '÷',
  emsp: ' ',
  ensp: ' ',
  euro: '€',
  frac12: '½',
  frac14: '¼',
  frac34: '¾',
  ge: '≥',
  gt: '>',
  harr: '↔',
  hellip: '…',
  infin: '∞',
  laquo: '«',
  larr: '←',
  ldquo: '“',
  le: '≤',
  lsquo: '‘',
  lt: '<',
  mdash: '—',
  micro: 'µ',
  middot: '·',
  nbsp: ' ',
  ndash: '–',
  ne: '≠',
  para: '¶',
  plusmn: '±',
  pound: '£',
  quot: '"',
  raquo: '»',
  rarr: '→',
  rdquo: '”',
  reg: '®',
  rsquo: '’',
  sect: '§',
  sup2: '²',
  sup3: '³',
  thinsp: ' ',
  times: '×',
  trade: '™',
  uarr: '↑',
  yen: '¥',
}

interface Match {
  readonly html: string
  readonly end: number
}

interface LinkParts {
  readonly label: string
  readonly dest: string
  readonly title: string
  readonly end: number
}

/** 一段反引号：起点与个数。 */
interface TickRun {
  readonly start: number
  readonly len: number
}

/** 一段文本的扫描缓存：整串只扫一遍，「找到了」和「往后再也找不到」的结论都存起来查表。 */
interface Scanner {
  readonly src: string
  /** `[` 配对的 `]` 下标，不配对返回 -1。 */
  readonly labelClose: (open: number) => number
  /** start 处这段反引号的个数与收尾段起点，配不上返回 null。 */
  readonly codeClose: (start: number) => { count: number, close: number } | null
  /** start 处这段反引号的结束下标（段末的下一位）。 */
  readonly tickRunEnd: (start: number) => number
  /** 从 from 起第一个 ch 的下标，没有返回 -1。 */
  readonly seek: (ch: string, from: number) => number
  /** 裸地址从 start 起扫到的结束下标。 */
  readonly destEnd: (start: number) => number
}

function createScanner(src: string): Scanner {
  let pairs: Map<number, number> | undefined
  let runs: TickRun[] | undefined
  let runAt: Map<number, number> | undefined
  let runsByLen: Map<number, number[]> | undefined
  let destEnds: Int32Array | undefined
  const missing = new Map<string, number>()
  const hits = new Map<string, { from: number, at: number }>()

  /** 用一个栈把全串的方括号配对一遍，反斜杠转义的括号不算。 */
  const buildPairs = (): Map<number, number> => {
    const map = new Map<number, number>()
    const open: number[] = []
    for (let i = 0; i < src.length; i++) {
      const ch = src[i]
      if (ch === '\\')
        i++
      else if (ch === '[')
        open.push(i)
      else if (ch === ']' && open.length > 0)
        map.set(open.pop()!, i)
    }
    return map
  }

  /** 切出全串的反引号段，并按段内个数归组。 */
  const buildRuns = (): void => {
    const list: TickRun[] = []
    const at = new Map<number, number>()
    const byLen = new Map<number, number[]>()
    for (let i = 0; i < src.length; i++) {
      if (src[i] !== '`')
        continue
      let len = 0
      while (src[i + len] === '`') len++
      const index = list.length
      for (let k = 0; k < len; k++) at.set(i + k, index)
      list.push({ start: i, len })
      const peers = byLen.get(len)
      if (peers === undefined)
        byLen.set(len, [index])
      else
        peers.push(index)
      i += len - 1
    }
    runs = list
    runAt = at
    runsByLen = byLen
  }

  /** 从右往左给每个下标算出裸地址的终点：空白与控制符停下，成对的圆括号整对跳过。 */
  const buildDestEnds = (): Int32Array => {
    const len = src.length
    const ends = new Int32Array(len + 1)
    ends[len] = len
    for (let i = len - 1; i >= 0; i--) {
      const ch = src[i]!
      if (ch === '\\' && i + 1 < len)
        ends[i] = ends[i + 2]!
      else if (ch === ')' || WHITESPACE.test(ch) || ch.codePointAt(0)! < 0x20)
        ends[i] = i
      else if (ch === '(')
        ends[i] = src[ends[i + 1]!] === ')' ? ends[ends[i + 1]! + 1]! : ends[i + 1]!
      else
        ends[i] = ends[i + 1]!
    }
    return ends
  }

  /** 有序数组里第一个大于 index 的元素。 */
  const firstAfter = (sorted: readonly number[], index: number): number | undefined => {
    let lo = 0
    let hi = sorted.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (sorted[mid]! <= index)
        lo = mid + 1
      else
        hi = mid
    }
    return sorted[lo]
  }

  return {
    src,

    labelClose(open) {
      pairs ??= buildPairs()
      return pairs.get(open) ?? -1
    },

    codeClose(start) {
      if (runAt === undefined)
        buildRuns()
      const index = runAt!.get(start)
      if (index === undefined)
        return null
      const run = runs![index]!
      const count = run.start + run.len - start
      const peers = runsByLen!.get(count)
      if (peers === undefined)
        return null
      const next = firstAfter(peers, index)
      return next === undefined ? null : { count, close: runs![next]!.start }
    },

    tickRunEnd(start) {
      if (runAt === undefined)
        buildRuns()
      const index = runAt!.get(start)
      if (index === undefined)
        return start + 1
      const run = runs![index]!
      return run.start + run.len
    },

    seek(ch, from) {
      const gone = missing.get(ch)
      if (gone !== undefined && from >= gone)
        return -1
      const hit = hits.get(ch)
      if (hit !== undefined && from >= hit.from && from <= hit.at)
        return hit.at
      const at = src.indexOf(ch, from)
      if (at === -1)
        missing.set(ch, from)
      else
        hits.set(ch, { from, at })
      return at
    },

    destEnd(start) {
      destEnds ??= buildDestEnds()
      return destEnds[start]!
    },
  }
}

/** 匹配行内代码：起止反引号数量相同。 */
function matchCode(sc: Scanner, start: number): { content: string, end: number } | null {
  const found = sc.codeClose(start)
  if (found === null)
    return null
  let content = sc.src.slice(start + found.count, found.close).replace(/\n/g, ' ')
  if (content.length > 2 && content.startsWith(' ') && content.endsWith(' ') && content.trim() !== '')
    content = content.slice(1, -1)
  return { content, end: found.close + found.count }
}

/** 匹配尖括号自动链接，协议不过白名单则不成链接。 */
function matchAutolink(sc: Scanner, start: number): Match | null {
  const rest = sc.src.slice(start)
  const uri = AUTOLINK_URI.exec(rest)
  if (uri) {
    const href = safeUrl(uri[1]!)
    if (href === null)
      return null
    return { html: `<a href="${escapeAttr(href)}">${escapeText(uri[1]!)}</a>`, end: start + uri[0]!.length }
  }
  const mail = AUTOLINK_EMAIL.exec(rest)
  if (mail) {
    const href = safeUrl(`mailto:${mail[1]!}`)
    if (href === null)
      return null
    return { html: `<a href="${escapeAttr(href)}">${escapeText(mail[1]!)}</a>`, end: start + mail[0]!.length }
  }
  return null
}

/** 圈出圆括号里的目标地址：地址是 [from, to)，end 是收尾之后的下标。 */
function scanDestination(sc: Scanner, start: number): { from: number, to: number, end: number } | null {
  if (sc.src[start] === '<') {
    const close = sc.seek('>', start + 1)
    if (close === -1)
      return null
    const angle = sc.seek('<', start + 1)
    const newline = sc.seek('\n', start + 1)
    if ((angle !== -1 && angle < close) || (newline !== -1 && newline < close))
      return null
    return { from: start + 1, to: close, end: close + 1 }
  }
  const to = sc.destEnd(start)
  return { from: start, to, end: to }
}

/** 匹配 `[标签](地址 "标题")`，标签的右方括号由调用方给出。 */
function matchInlineLink(sc: Scanner, start: number, labelEnd: number): LinkParts | null {
  const src = sc.src
  if (src[labelEnd + 1] !== '(')
    return null
  let i = labelEnd + 2
  while (i < src.length && WHITESPACE.test(src[i]!)) i++
  const destination = scanDestination(sc, i)
  if (destination === null)
    return null
  i = destination.end
  const beforeTitle = i
  let titleFrom = 0
  let titleTo = 0
  while (i < src.length && WHITESPACE.test(src[i]!)) i++
  if (i > beforeTitle && (src[i] === '"' || src[i] === '\'')) {
    const close = sc.seek(src[i]!, i + 1)
    if (close === -1)
      return null
    titleFrom = i + 1
    titleTo = close
    i = close + 1
    while (i < src.length && WHITESPACE.test(src[i]!)) i++
  }
  if (src[i] !== ')')
    return null
  return {
    label: src.slice(start + 1, labelEnd),
    dest: unescapeBackslash(src.slice(destination.from, destination.to)),
    title: titleTo === 0 ? '' : unescapeBackslash(src.slice(titleFrom, titleTo)),
    end: i + 1,
  }
}

/** 匹配引用式链接的三种写法：`[标签][键]`、`[标签][]`、`[标签]`，键去定义表里查。 */
function matchRefLink(sc: Scanner, start: number, labelEnd: number, defs: LinkDefs): LinkParts | null {
  if (defs.size === 0 || labelEnd - start - 1 > MAX_REF_LABEL)
    return null
  const label = sc.src.slice(start + 1, labelEnd)
  let key = label
  let end = labelEnd + 1
  if (sc.src[labelEnd + 1] === '[') {
    const keyEnd = sc.labelClose(labelEnd + 1)
    if (keyEnd === -1 || keyEnd - labelEnd - 2 > MAX_REF_LABEL)
      return null
    const written = sc.src.slice(labelEnd + 2, keyEnd)
    key = written === '' ? label : written
    end = keyEnd + 1
  }
  const def = defs.get(normalizeLabel(unescapeBackslash(key)))
  return def === undefined ? null : { label, dest: def.dest, title: def.title, end }
}

/** 匹配一处链接：先按行内写法试，不成再按引用写法试。 */
function matchLink(sc: Scanner, start: number, defs: LinkDefs): LinkParts | null {
  const labelEnd = sc.labelClose(start)
  if (labelEnd === -1)
    return null
  return matchInlineLink(sc, start, labelEnd) ?? matchRefLink(sc, start, labelEnd, defs)
}

/** 拼 title 属性，没标题就不拼。 */
function titleAttr(title: string): string {
  return title === '' ? '' : ` title="${escapeAttr(title)}"`
}

function renderImage(link: LinkParts): string | null {
  const src = safeUrl(link.dest)
  return src === null
    ? null
    : `<img src="${escapeAttr(src)}" alt="${escapeAttr(unescapeBackslash(link.label))}"${titleAttr(link.title)}>`
}

/** 数字字符引用转字面字符，越界与代理区码位一律转成替换符。 */
function decodeNumeric(body: string): string {
  const hex = body[1] === 'x' || body[1] === 'X'
  const code = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10)
  if (!Number.isFinite(code) || code === 0 || code > 0x10FFFF || (code >= 0xD800 && code <= 0xDFFF))
    return '�'
  return String.fromCodePoint(code)
}

/** 匹配 start 处的字符引用，认不出返回 null。 */
function matchEntity(src: string, start: number): { value: string, end: number } | null {
  ENTITY.lastIndex = start
  const found = ENTITY.exec(src)
  if (found === null)
    return null
  const body = found[1]!
  const value = body[0] === '#' ? decodeNumeric(body) : NAMED_ENTITIES[body]
  return value === undefined ? null : { value, end: start + found[0]!.length }
}

/** 一段强调标记：还没被吃掉的标记字符数，以及要吐在这段两侧的标签。 */
interface DelimRun {
  readonly ch: string
  /** 这段的原始长度，配对的三倍数规则按它算。 */
  readonly origin: number
  count: number
  readonly canOpen: boolean
  readonly canClose: boolean
  /** 这段在输出块数组里的槽位。 */
  slot: number
  pre: string
  post: string
  /** 已被别的配对越过，不再参与配对。 */
  dead: boolean
}

function isWhitespaceAt(src: string, index: number): boolean {
  return index < 0 || index >= src.length || WHITESPACE.test(src[index]!)
}

function isPunctuationAt(src: string, index: number): boolean {
  return index >= 0 && index < src.length && PUNCTUATION.test(src[index]!)
}

/** 建一段强调标记，两侧字符决定它能开、能闭还是两者都不能。 */
function makeDelim(src: string, start: number, end: number): DelimRun {
  const beforeSpace = isWhitespaceAt(src, start - 1)
  const beforePunct = isPunctuationAt(src, start - 1)
  const afterSpace = isWhitespaceAt(src, end)
  const afterPunct = isPunctuationAt(src, end)
  const left = !afterSpace && (!afterPunct || beforeSpace || beforePunct)
  const right = !beforeSpace && (!beforePunct || afterSpace || afterPunct)
  const ch = src[start]!
  return {
    ch,
    origin: end - start,
    count: end - start,
    canOpen: ch === '_' ? left && (!right || beforePunct) : left,
    canClose: ch === '_' ? right && (!left || afterPunct) : right,
    slot: 0,
    pre: '',
    post: '',
    dead: false,
  }
}

/** 这一对能不能配：同一种标记，且两侧长度之和不是三的倍数（除非两边都是）。 */
function canPair(opener: DelimRun, closer: DelimRun): boolean {
  if (opener.dead || opener.count === 0 || opener.ch !== closer.ch || !opener.canOpen)
    return false
  if (!closer.canOpen && !opener.canClose)
    return true
  if ((opener.origin + closer.origin) % 3 !== 0)
    return true
  return opener.origin % 3 === 0 && closer.origin % 3 === 0
}

function emphasisTags(ch: string, count: number): readonly [string, string] {
  if (ch === '~')
    return ['<del>', '</del>']
  return count === 2 ? ['<strong>', '</strong>'] : ['<em>', '</em>']
}

/**
 * 逐个收尾标记往回找最近的可用起始标记，配上就各吃掉一到两个字符并记下标签，
 * 被跨过的标记作废，找不到起始标记的位置记下来不再重复回溯。
 */
function processEmphasis(delims: readonly DelimRun[]): void {
  const bottoms = new Map<string, number>()
  let closerIndex = 0
  while (closerIndex < delims.length) {
    const closer = delims[closerIndex]!
    if (closer.dead || !closer.canClose || closer.count === 0) {
      closerIndex++
      continue
    }
    const key = `${closer.ch}${closer.origin % 3}${closer.canOpen ? 1 : 0}`
    const bottom = bottoms.get(key) ?? -1
    let openerIndex = closerIndex - 1
    while (openerIndex > bottom && !canPair(delims[openerIndex]!, closer)) openerIndex--
    if (openerIndex <= bottom) {
      bottoms.set(key, closerIndex - 1)
      if (!closer.canOpen)
        closer.dead = true
      closerIndex++
      continue
    }
    const opener = delims[openerIndex]!
    const count = closer.ch === '~' || (closer.count >= 2 && opener.count >= 2) ? 2 : 1
    const [open, close] = emphasisTags(closer.ch, count)
    opener.count -= count
    closer.count -= count
    opener.post = open + opener.post
    closer.pre += close
    for (let k = openerIndex + 1; k < closerIndex; k++) delims[k]!.dead = true
  }
}

interface Parsed {
  readonly html: string
  /** 这段里出没出过链接，链接不许套链接要靠它判。 */
  readonly hasLink: boolean
}

/** 行内语法转 HTML：文本先转义再插标记，强调标记攒到最后统一配对。 */
function parseInline(src: string, defs: LinkDefs, depth: number): Parsed {
  if (depth > MAX_DEPTH)
    return { html: escapeText(src), hasLink: false }
  const sc = createScanner(src)
  const parts: string[] = []
  const delims: DelimRun[] = []
  let hasLink = false
  let text = ''
  // text 结尾的连续空格数，攒字符时顺手维护
  let spaces = 0
  let i = 0
  const flush = (): void => {
    if (text !== '') {
      parts.push(escapeText(text))
      text = ''
    }
    spaces = 0
  }
  const emit = (html: string): void => {
    flush()
    parts.push(html)
  }
  const hardBreak = (): void => {
    let end = text.length
    while (end > 0 && text[end - 1] === ' ') end--
    if (end < text.length)
      text = text.slice(0, end)
    emit('<br>\n')
  }
  while (i < src.length) {
    const ch = src[i]!
    if (ch === '\\') {
      const next = src[i + 1]
      if (next === '\n') {
        hardBreak()
        i += 2
        continue
      }
      if (next !== undefined && ESCAPABLE.test(next)) {
        text += next
        spaces = next === ' ' ? spaces + 1 : 0
        i += 2
        continue
      }
    }
    if (ch === '\n') {
      if (spaces >= 2) {
        hardBreak()
      }
      else {
        text += '\n'
        spaces = 0
      }
      i++
      continue
    }
    if (ch === '&') {
      const entity = matchEntity(src, i)
      if (entity !== null) {
        text += entity.value
        spaces = 0
        i = entity.end
        continue
      }
    }
    if (ch === '`') {
      const code = matchCode(sc, i)
      if (code) {
        emit(`<code>${escapeText(code.content)}</code>`)
        i = code.end
        continue
      }
      // 配不上收尾：整段反引号按字面量收下，扫描从整段之后继续
      const runEnd = sc.tickRunEnd(i)
      text += src.slice(i, runEnd)
      spaces = 0
      i = runEnd
      continue
    }
    if (ch === '<') {
      const auto = matchAutolink(sc, i)
      if (auto) {
        emit(auto.html)
        hasLink = true
        i = auto.end
        continue
      }
    }
    if (ch === '!' && src[i + 1] === '[') {
      const link = matchLink(sc, i + 1, defs)
      const html = link === null ? null : renderImage(link)
      if (html !== null && link !== null) {
        emit(html)
        i = link.end
        continue
      }
    }
    if (ch === '[') {
      const link = matchLink(sc, i, defs)
      const href = link === null ? null : safeUrl(link.dest)
      if (link !== null && href !== null) {
        const inner = parseInline(link.label, defs, depth + 1)
        if (inner.hasLink) {
          // 链接不许套链接：外层退回字面方括号，里层那条链接照常留着
          emit(`[${inner.html}]`)
          hasLink = true
          i = sc.labelClose(i) + 1
          continue
        }
        emit(`<a href="${escapeAttr(href)}"${titleAttr(link.title)}>${inner.html}</a>`)
        hasLink = true
        i = link.end
        continue
      }
    }
    if (ch === '*' || ch === '_' || ch === '~') {
      let end = i
      while (src[end] === ch) end++
      // 波浪号只认成对的两个，其余长度整段当字面量
      if (ch !== '~' || end - i === 2) {
        const delim = makeDelim(src, i, end)
        if (delim.canOpen || delim.canClose) {
          flush()
          delim.slot = parts.length
          parts.push('')
          delims.push(delim)
          i = end
          continue
        }
      }
      text += src.slice(i, end)
      spaces = 0
      i = end
      continue
    }
    text += ch
    spaces = ch === ' ' ? spaces + 1 : 0
    i++
  }
  flush()
  processEmphasis(delims)
  for (const delim of delims)
    parts[delim.slot] = delim.pre + delim.ch.repeat(delim.count) + delim.post
  return { html: parts.join(''), hasLink }
}

/** 行内语法转 HTML。 */
export function renderInline(src: string, defs: LinkDefs = NO_DEFS, depth = 0): string {
  return parseInline(src, defs, depth).html
}
