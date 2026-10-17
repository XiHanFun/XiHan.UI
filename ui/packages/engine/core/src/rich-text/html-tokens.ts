/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 不依赖 DOM 的 HTML 切分：开始标签、结束标签与文字；注释、doctype 与处理指令跳过；
// script、style 这类原始文本元素的内容整段作为一个文字单元交出；文字里的字符引用解码。

/** 切分出的一个单元。 */
export type HtmlToken
  = | { readonly kind: 'start', readonly name: string, readonly attrs: ReadonlyMap<string, string>, readonly selfClosing: boolean }
    | { readonly kind: 'end', readonly name: string }
    | { readonly kind: 'text', readonly text: string, readonly raw: boolean }

/** 内容按原始文本处理、直到同名结束标签的元素。 */
const RAW_TEXT = new Set(['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript', 'plaintext'])

/** 常用的具名字符引用。 */
const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: '\'',
  nbsp: ' ',
  ensp: ' ',
  emsp: ' ',
  thinsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  middot: '·',
  bull: '•',
  times: '×',
  divide: '÷',
  yen: '¥',
  euro: '€',
  deg: '°',
  plusmn: '±',
  sect: '§',
  para: '¶',
  laquo: '«',
  raquo: '»',
}

const ENTITY = /&(#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);?/gi

/** 解码文字里的字符引用；认不出的原样保留，码位不合法的换成替换字符。 */
export function decodeEntities(text: string): string {
  if (!text.includes('&'))
    return text
  return text.replace(ENTITY, (whole, body: string) => {
    if (body.startsWith('#')) {
      const code = body[1] === 'x' || body[1] === 'X' ? Number.parseInt(body.slice(2), 16) : Number.parseInt(body.slice(1), 10)
      return Number.isInteger(code) && code > 0 && code <= 0x10FFFF && !(code >= 0xD800 && code <= 0xDFFF) ? String.fromCodePoint(code) : '�'
    }
    if (!whole.endsWith(';'))
      return whole
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole
  })
}

function isNameStart(char: string | undefined): boolean {
  return char !== undefined && /[a-z]/i.test(char)
}

function isSpace(char: string | undefined): boolean {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r' || char === '\f'
}

/** 把 HTML 串切成单元。不合规范的写法尽量按浏览器的宽松方式读，读不懂的 `<` 当作文字。 */
export function tokenizeHtml(html: string): HtmlToken[] {
  const tokens: HtmlToken[] = []
  const length = html.length
  let index = 0
  let text = ''
  const flushText = (): void => {
    if (text !== '') {
      tokens.push({ kind: 'text', text: decodeEntities(text), raw: false })
      text = ''
    }
  }
  const skipPast = (marker: string, from: number): number => {
    const end = html.indexOf(marker, from)
    return end < 0 ? length : end + marker.length
  }

  while (index < length) {
    const char = html[index]
    if (char !== '<') {
      text += char
      index++
      continue
    }
    if (html.startsWith('<!--', index)) {
      flushText()
      index = skipPast('-->', index + 4)
      continue
    }
    if (html.startsWith('<![CDATA[', index)) {
      flushText()
      index = skipPast(']]>', index + 9)
      continue
    }
    if (html[index + 1] === '!' || html[index + 1] === '?') {
      flushText()
      index = skipPast('>', index + 2)
      continue
    }
    if (html[index + 1] === '/' && isNameStart(html[index + 2])) {
      flushText()
      let cursor = index + 2
      while (cursor < length && !isSpace(html[cursor]) && html[cursor] !== '/' && html[cursor] !== '>')
        cursor++
      tokens.push({ kind: 'end', name: html.slice(index + 2, cursor).toLowerCase() })
      index = skipPast('>', cursor)
      continue
    }
    if (!isNameStart(html[index + 1])) {
      text += char
      index++
      continue
    }

    flushText()
    let cursor = index + 1
    while (cursor < length && !isSpace(html[cursor]) && html[cursor] !== '/' && html[cursor] !== '>')
      cursor++
    const name = html.slice(index + 1, cursor).toLowerCase()
    const attrs = new Map<string, string>()
    let selfClosing = false
    for (;;) {
      while (cursor < length && (isSpace(html[cursor]) || (html[cursor] === '/' && html[cursor + 1] !== '>')))
        cursor++
      if (cursor >= length)
        break
      if (html[cursor] === '>') {
        cursor++
        break
      }
      if (html[cursor] === '/' && html[cursor + 1] === '>') {
        selfClosing = true
        cursor += 2
        break
      }
      const nameStart = cursor
      while (cursor < length && !isSpace(html[cursor]) && html[cursor] !== '=' && html[cursor] !== '>' && !(html[cursor] === '/' && html[cursor + 1] === '>'))
        cursor++
      const attrName = html.slice(nameStart, cursor).toLowerCase()
      while (isSpace(html[cursor]))
        cursor++
      let value = ''
      if (html[cursor] === '=') {
        cursor++
        while (isSpace(html[cursor]))
          cursor++
        const quote = html[cursor]
        if (quote === '"' || quote === '\'') {
          const end = html.indexOf(quote, cursor + 1)
          const stop = end < 0 ? length : end
          value = html.slice(cursor + 1, stop)
          cursor = stop + 1
        }
        else {
          const start = cursor
          while (cursor < length && !isSpace(html[cursor]) && html[cursor] !== '>')
            cursor++
          value = html.slice(start, cursor)
        }
      }
      if (attrName !== '' && !attrs.has(attrName))
        attrs.set(attrName, decodeEntities(value))
    }
    index = cursor
    tokens.push({ kind: 'start', name, attrs, selfClosing })

    if (RAW_TEXT.has(name) && !selfClosing) {
      const lower = html.toLowerCase()
      const close = lower.indexOf(`</${name}`, index)
      const stop = close < 0 ? length : close
      if (stop > index)
        tokens.push({ kind: 'text', text: html.slice(index, stop), raw: true })
      tokens.push({ kind: 'end', name })
      index = close < 0 ? length : skipPast('>', close)
    }
  }
  flushText()
  return tokens
}
