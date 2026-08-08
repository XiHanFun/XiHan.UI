// SVG 标记扫描器：把源文本读成 { tag, attrs, children } 树。
// 属性名逐字保留（stroke-linecap 不会被切成 linecap），值先解实体再交给白名单。
import { fail, IconPipelineError } from './error.mjs'

/** 属性名与标签名的合法字符：首字符字母或 _ :，其后可含连字符、点、数字。 */
const NAME_RE = /^[a-z_:][\w:.-]*$/i

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: '\'',
}

/** 源里出现在标签名/属性名之后、用来断词的字符。 */
function isSpace(ch) {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f'
}

function lineOf(source, index) {
  let line = 1
  for (let i = 0; i < index && i < source.length; i++) {
    if (source[i] === '\n')
      line++
  }
  return line
}

/** 把 &amp; &#10; &#x41; 之类还原成字符；未知实体报错。 */
function decodeEntities(text, where) {
  return text.replace(/&(#x?[\da-f]+|[a-z]+);/gi, (whole, body) => {
    if (body[0] === '#') {
      const hex = body[1] === 'x' || body[1] === 'X'
      const code = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10)
      if (!Number.isFinite(code) || code < 0 || code > 0x10FFFF)
        fail(where, `无法识别的字符引用 ${whole}`)
      return String.fromCodePoint(code)
    }
    const ch = NAMED_ENTITIES[body]
    if (ch === undefined)
      fail(where, `无法识别的实体 ${whole}`)
    return ch
  })
}

/**
 * 解析一份 SVG 源。
 *
 * 返回根元素节点；元素形如 { tag, attrs: Map, children: [] }，文本形如 { text }。
 * 注释、CDATA 壳、XML 声明、DOCTYPE 一律丢弃并记进 notes。
 */
export function parseSvg(source, file = '<source>') {
  const notes = []
  const stack = []
  let root = null
  let pos = 0

  const where = () => `${file}:${lineOf(source, pos)}`

  function pushText(raw) {
    const parent = stack[stack.length - 1]
    if (raw.trim() === '') {
      return
    }
    if (!parent)
      fail(where(), '根元素之外出现文本')
    parent.children.push({ text: decodeEntities(raw, where()) })
  }

  function readName() {
    const start = pos
    while (pos < source.length) {
      const ch = source[pos]
      if (isSpace(ch) || ch === '>' || ch === '/' || ch === '=')
        break
      pos++
    }
    const name = source.slice(start, pos)
    if (!NAME_RE.test(name))
      fail(where(), `非法的名字 ${JSON.stringify(name)}`)
    return name
  }

  function skipSpace() {
    while (pos < source.length && isSpace(source[pos]))
      pos++
  }

  function readOpenTag() {
    pos++ // <
    const tag = readName()
    const attrs = new Map()
    for (;;) {
      skipSpace()
      if (pos >= source.length)
        fail(where(), `标签 <${tag}> 没有闭合`)
      if (source[pos] === '>') {
        pos++
        return { tag, attrs, selfClosing: false }
      }
      if (source[pos] === '/') {
        pos++
        skipSpace()
        if (source[pos] !== '>')
          fail(where(), `标签 <${tag}> 的 / 后面不是 >`)
        pos++
        return { tag, attrs, selfClosing: true }
      }
      const name = readName()
      if (attrs.has(name))
        fail(where(), `<${tag}> 上重复的属性 ${name}`)
      skipSpace()
      if (source[pos] !== '=')
        fail(where(), `属性 ${name} 缺少取值（不接受布尔式属性）`)
      pos++
      skipSpace()
      const quote = source[pos]
      if (quote !== '"' && quote !== '\'')
        fail(where(), `属性 ${name} 的取值必须加引号`)
      pos++
      const end = source.indexOf(quote, pos)
      if (end < 0)
        fail(where(), `属性 ${name} 的引号没有闭合`)
      const raw = source.slice(pos, end)
      pos = end + 1
      attrs.set(name, decodeEntities(raw, where()))
    }
  }

  function readCloseTag() {
    pos += 2 // </
    const tag = readName()
    skipSpace()
    if (source[pos] !== '>')
      fail(where(), `</${tag}> 没有闭合`)
    pos++
    const open = stack.pop()
    if (!open)
      fail(where(), `多余的 </${tag}>`)
    if (open.tag !== tag)
      fail(where(), `</${tag}> 与 <${open.tag}> 不配对`)
  }

  function skipUntil(marker, label) {
    const end = source.indexOf(marker, pos)
    if (end < 0)
      fail(where(), `${label} 没有闭合`)
    const inner = source.slice(pos, end)
    pos = end + marker.length
    return inner
  }

  while (pos < source.length) {
    const lt = source.indexOf('<', pos)
    if (lt < 0) {
      pushText(source.slice(pos))
      pos = source.length
      break
    }
    if (lt > pos) {
      const text = source.slice(pos, lt)
      pos = lt
      pushText(text)
    }

    if (source.startsWith('<!--', pos)) {
      pos += 4
      skipUntil('-->', '注释')
      notes.push('丢弃注释')
    }
    else if (source.startsWith('<![CDATA[', pos)) {
      pos += 9
      const inner = skipUntil(']]>', 'CDATA')
      notes.push('脱去 CDATA 壳')
      const parent = stack[stack.length - 1]
      if (inner.trim() !== '') {
        if (!parent)
          fail(where(), '根元素之外出现文本')
        parent.children.push({ text: inner })
      }
    }
    else if (source.startsWith('<?', pos)) {
      pos += 2
      skipUntil('?>', 'XML 声明')
      notes.push('丢弃 XML 声明')
    }
    else if (source.startsWith('<!', pos)) {
      pos += 2
      // DOCTYPE 可能带内部子集，先跳过 [ ... ] 再找收尾的 >
      const bracket = source.indexOf('[', pos)
      const gt = source.indexOf('>', pos)
      if (gt < 0)
        fail(where(), 'DOCTYPE 没有闭合')
      if (bracket >= 0 && bracket < gt) {
        pos = bracket + 1
        skipUntil(']', 'DOCTYPE 内部子集')
        skipUntil('>', 'DOCTYPE')
      }
      else {
        pos = gt + 1
      }
      notes.push('丢弃 DOCTYPE')
    }
    else if (source.startsWith('</', pos)) {
      readCloseTag()
    }
    else {
      const opened = readOpenTag()
      const node = { tag: opened.tag, attrs: opened.attrs, children: [] }
      const parent = stack[stack.length - 1]
      if (parent) {
        parent.children.push(node)
      }
      else if (root) {
        fail(where(), '源里出现了第二个根元素')
      }
      else {
        root = node
      }
      if (!opened.selfClosing)
        stack.push(node)
    }
  }

  if (stack.length > 0)
    fail(`${file}:${lineOf(source, source.length)}`, `标签 <${stack[stack.length - 1].tag}> 没有闭合`)
  if (!root)
    throw new IconPipelineError(`${file}：源里没有元素`)

  return { root, notes }
}
