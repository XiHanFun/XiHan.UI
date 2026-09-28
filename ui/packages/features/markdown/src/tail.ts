/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 生长块的行内容错：流式中一行还没写完，未闭合的行内标记先按闭合处理，不把原始符号露给读者。
//
// 只改生长中那一块的最后一行，只影响这一帧的渲染；块定型或流结束后按原文严格解析。
// 规则：
// - 加粗、斜体、删除线开了没关：在行尾补上对应的收尾符，`**粗` 先显示成粗体；
//   开符号后面还一个字都没有时（`你好 **`）先不显示这个符号。
// - 行内代码开了没关：补上同样长度的反引号；反引号后面还没有字时先不显示。
// - 链接只写到一半：`[文字` 只显示文字，`[文字](半截地址` 也只显示文字，地址等写完再成链接；
//   `![` 起头的图片、`[@` 起头的引用、`[^` 起头的脚注写到一半时整段先不显示。
// - 行尾孤零零的 `$` / `$$` 先不显示；公式本身不做补全：金额里的美元符号补成公式反而更糟。

import { makeDelim } from './inline'
import { blockType } from './scan'

/** 最多补这么多层收尾符，再深的嵌套交给定型后的严格解析。 */
const MAX_CLOSERS = 8

/** 一个还没收尾的开符号：强调符，或行内代码的反引号。 */
interface Opener {
  readonly ch: string
  readonly start: number
  readonly len: number
  /** 这段符号同时也能收尾（词中间的星号），配对时要看三倍数规则。 */
  readonly canClose: boolean
}

interface Bracket {
  readonly start: number
  /** 这对方括号写到一半时要整段藏起来：图片、引用与脚注。 */
  readonly hideAll: boolean
}

/** 从 from 起找恰好 len 个反引号的一段，返回起点；没有返回 -1。 */
function findTicks(line: string, from: number, len: number): number {
  let i = from
  while (i < line.length) {
    if (line[i] !== '`') {
      i++
      continue
    }
    let end = i
    while (line[end] === '`') end++
    if (end - i === len)
      return i
    i = end
  }
  return -1
}

/** 从 `(` 之后找配平的 `)`，返回它的下标；没写完返回 -1。 */
function findParen(line: string, from: number): number {
  let depth = 0
  for (let i = from; i < line.length; i++) {
    const ch = line[i]
    if (ch === '\\') {
      i++
      continue
    }
    if (ch === '(')
      depth++
    else if (ch === ')' && depth-- === 0)
      return i
  }
  return -1
}

/** 这一行里 `$` 起头的公式在本行内有没有闭合。 */
function mathClosed(line: string, start: number): number {
  const display = line[start + 1] === '$'
  const from = start + (display ? 2 : 1)
  for (let i = from; i < line.length; i++) {
    if (line[i] === '\\') {
      i++
      continue
    }
    if (line[i] !== '$')
      continue
    if (!display || line[i + 1] === '$')
      return i + (display ? 2 : 1)
  }
  return -1
}

/** 修一行：返回补全后用来渲染的文本。 */
function tolerateLine(line: string): string {
  const openers: Opener[] = []
  const brackets: Bracket[] = []
  /** 链接地址写到一半：[文字](半截 —— 渲染时只留文字。 */
  let halfLink: { open: number, close: number, hideAll: boolean } | null = null
  /** 从这里往后整段不显示。 */
  let cutAt = line.length

  let i = 0
  while (i < line.length) {
    const ch = line[i]!
    if (ch === '\\') {
      i += 2
      continue
    }
    if (ch === '`') {
      let end = i
      while (line[end] === '`') end++
      const close = findTicks(line, end, end - i)
      if (close !== -1) {
        i = close + (end - i)
        continue
      }
      // 没关的行内代码按一个开符号记下：后面有字就补上收尾，还没字就先藏起它
      openers.push({ ch: '`', start: i, len: end - i, canClose: false })
      break
    }
    if (ch === '$') {
      const close = mathClosed(line, i)
      if (close !== -1) {
        i = close
        continue
      }
      const run = line[i + 1] === '$' ? 2 : 1
      if (line.slice(i + run).trim() === '') {
        cutAt = i
        break
      }
      i += run
      continue
    }
    if (ch === '[') {
      const hideAll = line[i - 1] === '!' || line[i + 1] === '@' || line[i + 1] === '^'
      brackets.push({ start: line[i - 1] === '!' ? i - 1 : i, hideAll })
      i++
      continue
    }
    if (ch === ']') {
      const open = brackets.pop()
      if (open !== undefined && line[i + 1] === '(') {
        const close = findParen(line, i + 2)
        if (close === -1) {
          halfLink = { open: open.start, close: i, hideAll: open.hideAll }
          break
        }
        i = close + 1
        continue
      }
      i++
      continue
    }
    if (ch === '*' || ch === '_' || ch === '~') {
      let end = i
      while (line[end] === ch) end++
      const len = end - i
      if (ch !== '~' || len === 2) {
        const delim = makeDelim(line, i, end)
        let top = openers.length - 1
        while (top >= 0 && openers[top]!.ch !== ch) top--
        const opener = top === -1 ? undefined : openers[top]!
        // 与内联解析同一条三倍数规则：两侧都能开也能收时，长度和是 3 的倍数的不配
        const pairable = opener !== undefined && delim.canClose
          && !((delim.canOpen || opener.canClose) && (opener.len + len) % 3 === 0 && !(opener.len % 3 === 0 && len % 3 === 0))
        if (pairable) {
          openers.splice(top)
        }
        else if (delim.canOpen) {
          openers.push({ ch, start: i, len, canClose: delim.canClose })
        }
        else if (line.slice(end).trim() === '' && (i === 0 || /\s/.test(line[i - 1]!))) {
          // 行尾一段前面是空白的符号：还没来得及写字的开符号，先不显示
          cutAt = i
          break
        }
      }
      i = end
      continue
    }
    i++
  }

  let out = line
  let limit = cutAt
  if (halfLink !== null) {
    // 地址写到一半：只留方括号里的文字，图片、引用与脚注整段先藏
    const { open, hideAll } = halfLink
    const label = hideAll ? '' : line.slice(open + 1, halfLink.close)
    out = line.slice(0, open) + label
    limit = out.length
    // 去掉了左方括号，标签里的开符号跟着前移一位
    for (let k = 0; k < openers.length; k++) {
      const opener = openers[k]!
      if (opener.start > open)
        openers[k] = { ...opener, start: opener.start - 1 }
    }
  }
  else {
    // 没配上右方括号的左方括号：图片、引用与脚注从那里起先藏，普通方括号只藏符号本身
    for (const bracket of [...brackets].reverse()) {
      if (bracket.start >= limit)
        continue
      if (bracket.hideAll) {
        limit = bracket.start
        continue
      }
      out = out.slice(0, bracket.start) + out.slice(bracket.start + 1)
      limit -= 1
      for (let k = 0; k < openers.length; k++) {
        const opener = openers[k]!
        if (opener.start > bracket.start)
          openers[k] = { ...opener, start: opener.start - 1 }
      }
    }
  }
  out = out.slice(0, limit)

  // 开符号后面还没有字：先不显示它
  const live = openers.filter(opener => opener.start < out.length)
  while (live.length > 0) {
    const last = live.at(-1)!
    if (out.slice(last.start + last.len).trim() !== '')
      break
    out = out.slice(0, last.start)
    live.pop()
  }

  out = out.trimEnd()
  const closers = live.slice(-MAX_CLOSERS).reverse().map(opener => opener.ch.repeat(opener.len)).join('')
  return out + closers
}

/** 生长块的渲染用文本：代码与公式块原样，其余只修最后一行。 */
export function tolerateTail(src: string): string {
  const type = blockType(src)
  if (type === 'code' || type === 'indented-code' || type === 'math')
    return src
  const at = src.lastIndexOf('\n')
  const last = src.slice(at + 1)
  const fixed = tolerateLine(last)
  return fixed === last ? src : src.slice(0, at + 1) + fixed
}
