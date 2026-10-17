/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 容错的词法扫描：与解析器同一套词法，遇到错误不中断，给编辑器判断光标所在的词与着色用。
import { isDigit, isNamePart, isNameStart, isWhitespace } from './chars'

/**
 * 词的种类：
 * - `identifier`：名字，含反引号括起的名字与 `true` / `false` / `null`；
 * - `number`、`string`：数字与字符串字面量，未闭合的字符串一直到源码末尾；
 * - `operator`：运算符 `+ - * / % ! < > <= >= == != && || ? :`；
 * - `punctuation`：`( ) [ ] , .`；
 * - `unknown`：不合法的字符，或后面紧跟名字字符、指数不完整的数字。
 */
export type ExpressionTokenKind = 'identifier' | 'number' | 'string' | 'operator' | 'punctuation' | 'unknown'

/** 一个词：区间按源码的 UTF-16 下标，`end` 不含。 */
export interface ExpressionToken {
  readonly kind: ExpressionTokenKind
  readonly start: number
  readonly end: number
}

const DOUBLE_OPERATORS: ReadonlySet<string> = new Set(['==', '!=', '<=', '>=', '&&', '||'])
const SINGLE_OPERATORS = '+-*/%!<>?:'
const PUNCTUATION = '()[],.'

function codeAt(source: string, index: number): number {
  return index < source.length ? source.codePointAt(index)! : -1
}

function widthAt(source: string, index: number): number {
  return codeAt(source, index) > 0xFFFF ? 2 : 1
}

/** 从引号处扫到配对的引号之后；反斜杠连同它后面的一个字符跳过，找不到配对时到源码末尾。 */
function quotedEnd(source: string, start: number, quote: string): number {
  let index = start + 1
  while (index < source.length) {
    const char = source[index]
    if (char === '\\') {
      index += 2
      continue
    }
    index += 1
    if (char === quote)
      return index
  }
  return source.length
}

/** 从数字开头扫到数字之后；返回结束下标与是否合法。 */
function numberEnd(source: string, start: number): { end: number, valid: boolean } {
  let index = start
  while (isDigit(codeAt(source, index)))
    index += 1
  if (source[index] === '.' && isDigit(codeAt(source, index + 1))) {
    index += 1
    while (isDigit(codeAt(source, index)))
      index += 1
  }
  let valid = true
  const marker = source[index]
  if (marker === 'e' || marker === 'E') {
    let cursor = index + 1
    const sign = source[cursor]
    if (sign === '+' || sign === '-')
      cursor += 1
    valid = isDigit(codeAt(source, cursor))
    index = cursor
    while (isDigit(codeAt(source, index)))
      index += 1
  }
  if (isNamePart(codeAt(source, index))) {
    valid = false
    while (isNamePart(codeAt(source, index)))
      index += widthAt(source, index)
  }
  return { end: index, valid }
}

/**
 * 把源码切成词，跳过空白。词法与解析器一致，但遇到错误不中断：
 * 未闭合的字符串与反引号名字一直到源码末尾，不认识的字符单独成一个 `unknown` 词。
 */
export function scanTokens(source: string): readonly ExpressionToken[] {
  const tokens: ExpressionToken[] = []
  const push = (kind: ExpressionTokenKind, start: number, end: number): void => {
    tokens.push(Object.freeze({ kind, start, end }))
  }
  let index = 0
  while (index < source.length) {
    const code = codeAt(source, index)
    if (isWhitespace(code)) {
      index += 1
      continue
    }
    const start = index
    const char = source[index]!
    if (isDigit(code)) {
      const { end, valid } = numberEnd(source, start)
      push(valid ? 'number' : 'unknown', start, end)
      index = end
    }
    else if (char === '\'' || char === '"') {
      index = quotedEnd(source, start, char)
      push('string', start, index)
    }
    else if (char === '`') {
      index = quotedEnd(source, start, char)
      push('identifier', start, index)
    }
    else if (isNameStart(code)) {
      while (isNamePart(codeAt(source, index)))
        index += widthAt(source, index)
      push('identifier', start, index)
    }
    else if (DOUBLE_OPERATORS.has(source.slice(start, start + 2))) {
      index += 2
      push('operator', start, index)
    }
    else if (SINGLE_OPERATORS.includes(char)) {
      index += 1
      push('operator', start, index)
    }
    else if (PUNCTUATION.includes(char)) {
      index += 1
      push('punctuation', start, index)
    }
    else {
      index += widthAt(source, start)
      push('unknown', start, index)
    }
  }
  return Object.freeze(tokens)
}
