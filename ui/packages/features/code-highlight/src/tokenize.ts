import type { CodeToken, CodeTokenKind } from '@xihan-ui/core'
import type { LangSpec } from './languages'

/**
 * 单趟扫描的粗粒度词法器。
 *
 * 全程逐字符前进、绝不回溯，因此耗时对长度是线性的——代码块在流式渲染里
 * 每来一个 token 就可能重扫一遍，任何回溯都会在长代码上放大成卡顿。
 * 未闭合的字符串与注释一路吃到结尾并保持它自己的种类，这正是流式要的行为：
 * 半截代码不该因为引号还没配上就整段变色。
 */

/** 超过这个长度就不着色。粗粒度着色的收益抵不过在超长代码上白扫一趟。 */
export const HIGHLIGHT_MAX_LENGTH = 100_000

const PUNCTUATION = new Set('{}[]()<>;,.:?!=+-*/%&|^~@#$'.split(''))

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9'
}

/** 标识符首字符：字母、下划线、美元符，以及一切非 ASCII（中文变量名照样算一个词）。 */
function isIdentStart(ch: string): boolean {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_' || ch === '$' || ch.codePointAt(0)! > 0x7F
}

function isIdentPart(ch: string): boolean {
  return isIdentStart(ch) || isDigit(ch)
}

/** 从 at 处起是不是这个串。 */
function startsWith(code: string, at: number, text: string): boolean {
  return text !== '' && code.startsWith(text, at)
}

/** 吃到行尾（不含换行）。 */
function scanToLineEnd(code: string, from: number): number {
  const next = code.indexOf('\n', from)
  return next === -1 ? code.length : next
}

/** 吃到闭合串之后；没闭合就到结尾。 */
function scanToClose(code: string, from: number, close: string): number {
  const next = code.indexOf(close, from)
  return next === -1 ? code.length : next + close.length
}

/** 吃完一段字符串；没闭合就到结尾。 */
function scanString(code: string, from: number, quote: string, escape: boolean): number {
  let i = from + 1
  while (i < code.length) {
    const ch = code[i]!
    if (escape && ch === '\\') {
      i += 2
      continue
    }
    if (ch === quote)
      return i + 1
    i += 1
  }
  return code.length
}

/** 吃完一个数字：认十六进制、小数、指数与下划线分隔。 */
function scanNumber(code: string, from: number): number {
  let i = from
  if (code[i] === '0' && (code[i + 1] === 'x' || code[i + 1] === 'X'))
    i += 2
  while (i < code.length) {
    const ch = code[i]!
    if (isDigit(ch) || ch === '_' || ch === '.' || (ch >= 'a' && ch <= 'f') || (ch >= 'A' && ch <= 'F')) {
      i += 1
      continue
    }
    // 指数后面允许跟一个符号
    if ((ch === '+' || ch === '-') && (code[i - 1] === 'e' || code[i - 1] === 'E')) {
      i += 1
      continue
    }
    break
  }
  return i
}

export function tokenizeCode(code: string, spec: LangSpec): readonly CodeToken[] {
  const tokens: CodeToken[] = []
  let pending: CodeTokenKind = 'plain'
  let pendingFrom = 0
  let i = 0

  /** 攒着的那段收成一个记号。相邻同类合并，省得一个字符一个 span。 */
  const flush = (upto: number): void => {
    if (upto > pendingFrom)
      tokens.push({ text: code.slice(pendingFrom, upto), kind: pending })
    pendingFrom = upto
  }

  const take = (kind: CodeTokenKind, end: number): void => {
    flush(i)
    tokens.push({ text: code.slice(i, end), kind })
    i = end
    pendingFrom = end
    pending = 'plain'
  }

  while (i < code.length) {
    const ch = code[i]!

    if (spec.blockComment && startsWith(code, i, spec.blockComment[0])) {
      take('comment', scanToClose(code, i + spec.blockComment[0].length, spec.blockComment[1]))
      continue
    }

    const line = spec.lineComment.find(mark => startsWith(code, i, mark))
    if (line !== undefined) {
      take('comment', scanToLineEnd(code, i + line.length))
      continue
    }

    if (spec.quotes.includes(ch)) {
      take('string', scanString(code, i, ch, spec.escape))
      continue
    }

    if (isDigit(ch)) {
      take('number', scanNumber(code, i))
      continue
    }

    if (isIdentStart(ch)) {
      let end = i + 1
      while (end < code.length && isIdentPart(code[end]!)) end += 1
      if (spec.keywords.has(code.slice(i, end))) {
        take('keyword', end)
        continue
      }
      // 普通标识符并进 plain 段，不单独成记号
      i = end
      continue
    }

    if (PUNCTUATION.has(ch)) {
      take('punctuation', i + 1)
      continue
    }

    i += 1
  }

  flush(code.length)
  return tokens
}
