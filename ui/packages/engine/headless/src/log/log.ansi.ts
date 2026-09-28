/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// ANSI SGR（Select Graphic Rendition）解析：把带转义序列的一行拆成一段段文字与样式。

import type { LogAnsiColor, LogAnsiSegment } from './log.types'

/** 30–37 / 90–97 对应的八种颜色，按码值次序。 */
const COLORS: readonly LogAnsiColor[] = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']

const ESC = 0x1B
const BEL = 0x07

interface Style {
  fg?: LogAnsiColor
  bright?: boolean
  bold?: boolean
  dim?: boolean
  italic?: boolean
  underline?: boolean
}

function sameStyle(a: Style, b: Style): boolean {
  return a.fg === b.fg && a.bright === b.bright && a.bold === b.bold && a.dim === b.dim
    && a.italic === b.italic && a.underline === b.underline
}

/** 按一串 SGR 参数改写当前样式。认不出的参数照终端惯例忽略。 */
function applySgr(style: Style, params: string): Style {
  const codes = params === '' ? [0] : params.split(/[;:]/).map(code => (code === '' ? 0 : Number(code)))
  let next: Style = { ...style }
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i]!
    if (code === 0) {
      next = {}
    }
    else if (code === 1) {
      next.bold = true
    }
    else if (code === 2) {
      next.dim = true
    }
    else if (code === 3) {
      next.italic = true
    }
    else if (code === 4) {
      next.underline = true
    }
    else if (code === 22) {
      next = { ...next, bold: undefined, dim: undefined }
    }
    else if (code === 23) {
      next.italic = undefined
    }
    else if (code === 24) {
      next.underline = undefined
    }
    else if (code >= 30 && code <= 37) {
      next = { ...next, fg: COLORS[code - 30], bright: undefined }
    }
    else if (code >= 90 && code <= 97) {
      next = { ...next, fg: COLORS[code - 90], bright: true }
    }
    else if (code === 39) {
      next = { ...next, fg: undefined, bright: undefined }
    }
    else if (code === 38 || code === 48) {
      // 256 色（5;n）只认前 16 个：它们就是上面那两组；更高的色号与真彩色（2;r;g;b）没有对应的语义色，不着色
      const mode = codes[i + 1]
      if (mode === 5) {
        const index = codes[i + 2] ?? -1
        if (code === 38 && index >= 0 && index < 16)
          next = { ...next, fg: COLORS[index % 8], bright: index >= 8 ? true : undefined }
        i += 2
      }
      else if (mode === 2) {
        i += 4
      }
    }
    // 背景色（40–47、100–107）与其余属性不着色：日志面的底由皮肤给，按码换底会压掉文字对比
  }
  return next
}

/** 一段转义序列：它在原文里止于哪儿，是 SGR 时带上参数。 */
interface Escape {
  end: number
  sgr?: string
}

/** 读 start 处（一个 ESC）起的一段转义序列。 */
function readEscape(text: string, start: number): Escape {
  const kind = text[start + 1]
  if (kind === '[') {
    // CSI：参数字节之后是一个 0x40–0x7E 的终止字节；只有 m 结尾的是 SGR，其余（清行、挪光标）一律吞掉
    let i = start + 2
    while (i < text.length && /[0-9;:<=>?]/.test(text[i]!)) i++
    const final = text.charCodeAt(i)
    const end = Number.isNaN(final) ? text.length : i + 1
    return final === 0x6D ? { end, sgr: text.slice(start + 2, i) } : { end }
  }
  if (kind === ']') {
    // OSC（改窗口标题之类）：止于 BEL 或 ESC \
    let i = start + 2
    while (i < text.length) {
      const code = text.charCodeAt(i)
      if (code === BEL)
        return { end: i + 1 }
      if (code === ESC && text[i + 1] === '\\')
        return { end: i + 2 }
      i++
    }
    return { end: text.length }
  }
  // 字符集切换（ESC ( B 之类）连同它的参数一个字符；其余单字符转义只占两位
  if (kind === '(' || kind === ')' || kind === '#')
    return { end: Math.min(start + 3, text.length) }
  return { end: Math.min(start + 2, text.length) }
}

/**
 * 把一行带 ANSI 转义的文字拆成若干段，每段带自己的颜色与字形。
 * 颜色只给八种名字（加 bright 标记），由皮肤映射到语义令牌；背景色、256 色的高位与真彩色不着色。
 * 不是 SGR 的转义序列（清行、挪光标、改窗口标题）直接去掉。相邻同样式的文字并成一段，空段不出现。
 */
export function parseAnsi(text: string): readonly LogAnsiSegment[] {
  const out: LogAnsiSegment[] = []
  let style: Style = {}
  let chunk = ''
  const flush = (): void => {
    if (chunk === '')
      return
    const prev = out.at(-1)
    if (prev !== undefined && sameStyle(prev, style))
      out[out.length - 1] = { ...prev, text: prev.text + chunk }
    else
      out.push({ text: chunk, ...style })
    chunk = ''
  }
  let i = 0
  while (i < text.length) {
    if (text.charCodeAt(i) !== ESC) {
      chunk += text[i]
      i++
      continue
    }
    const escape = readEscape(text, i)
    if (escape.sgr !== undefined) {
      flush()
      style = applySgr(style, escape.sgr)
    }
    i = escape.end
  }
  flush()
  return out
}

/** 去掉一行里的全部 ANSI 转义，只留文字：复制、下载与播报用它。 */
export function stripAnsi(text: string): string {
  return parseAnsi(text).map(segment => segment.text).join('')
}
