/**
 * 转义 HTML 文本内容里的 & < > " 四个字符。
 * 单引号不在其列：文本节点里它闭合不了任何东西，转了反而与规范的产出对不上。
 * 属性值另有 {@link escapeAttr}，那里单引号必须转。
 */
export function escapeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * 转义属性值，使其无法闭合当前属性或引入新属性。
 * 在文本那套之上补上单引号：属性值也可能是单引号括起来的。
 */
export function escapeAttr(value: string): string {
  return stripControl(escapeText(value).replace(/'/g, '&#39;'))
}

const BACKSLASH_ESCAPE = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g

/** 去掉反斜杠转义，还原被转义的字面字符。 */
export function unescapeBackslash(text: string): string {
  return text.replace(BACKSLASH_ESCAPE, '$1')
}

const NAMED_REFS: Record<string, string> = {
  amp: '&',
  apos: '\'',
  colon: ':',
  gt: '>',
  lpar: '(',
  lt: '<',
  nbsp: ' ',
  newline: '\n',
  quot: '"',
  rpar: ')',
  semi: ';',
  sol: '/',
  tab: '\t',
}

const CHAR_REF = /&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z][a-z0-9]{1,31});?/gi
const SCHEME = /^([a-z][a-z0-9+.-]*):/i
const SAFE_SCHEMES = new Set(['http', 'https', 'mailto', 'tel'])

/** 控制字符。 */
function isControl(code: number): boolean {
  return code <= 0x1F || code === 0x7F || (code >= 0x80 && code <= 0x9F)
}

/**
 * 控制字符、各类空白与零宽字符。
 * 覆盖面必须不窄于 String.prototype.trim 的空白集合。
 */
function isInvisible(code: number): boolean {
  if (isControl(code) || code === 0x20)
    return true
  if (code === 0xA0 || code === 0xAD || code === 0x1680 || code === 0x205F)
    return true
  if (code === 0x3000 || code === 0xFEFF)
    return true
  if (code >= 0x2000 && code <= 0x200F)
    return true
  if (code >= 0x2028 && code <= 0x202F)
    return true
  return code >= 0x2060 && code <= 0x2064
}

function stripControl(input: string): string {
  let out = ''
  for (const ch of input) {
    if (!isControl(ch.codePointAt(0)!))
      out += ch
  }
  return out
}

function stripInvisible(input: string): string {
  let out = ''
  for (const ch of input) {
    if (!isInvisible(ch.codePointAt(0)!))
      out += ch
  }
  return out
}

/** 把数字与具名字符引用还原成字面字符。 */
function decodeCharRefs(input: string): string {
  return input.replace(CHAR_REF, (whole: string, body: string) => {
    if (body[0] !== '#')
      return NAMED_REFS[body.toLowerCase()] ?? whole
    const code = body[1] === 'x' || body[1] === 'X'
      ? Number.parseInt(body.slice(2), 16)
      : Number.parseInt(body.slice(1), 10)
    if (!Number.isFinite(code) || code < 0 || code > 0x10FFFF)
      return whole
    try {
      return String.fromCodePoint(code)
    }
    catch {
      return whole
    }
  })
}

/** 百分号解码，遇到非法序列返回原串。 */
function decodePercent(input: string): string {
  if (!input.includes('%'))
    return input
  try {
    return decodeURIComponent(input)
  }
  catch {
    return input
  }
}

/** 反复解码并剥掉不可见字符，直到不再变化。 */
function normalize(raw: string): string {
  let current = raw
  for (let round = 0; round < 3; round++) {
    const next = stripInvisible(decodeCharRefs(decodePercent(current)))
    if (next === current)
      break
    current = next
  }
  return current
}

/**
 * 校验 URL 协议：放行 http / https / mailto / tel 以及无协议的相对路径与锚点，
 * 其余返回 null。
 *
 * 先定下输出串，再拿输出串本身去校验。校验一个串、返回另一个串的话，
 * 两者在字符集合上的任何差异都是一条绕过路径。
 */
export function safeUrl(raw: string): string | null {
  const out = stripInvisible(raw)
  if (out === '')
    return null
  for (const candidate of [out, normalize(out)]) {
    const scheme = SCHEME.exec(candidate)
    if (scheme && !SAFE_SCHEMES.has(scheme[1]!.toLowerCase()))
      return null
  }
  return out
}
