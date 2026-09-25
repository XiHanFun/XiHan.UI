/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 文字度量：TextMeasurer 协议以接口注入；确定性估算器让服务端与首帧算出同一份布局；折行与省略只经度量器量宽。

import { invalidArgument } from '../errors'

export interface FontSpec {
  readonly family: string
  /** 字号（px）。 */
  readonly size: number
  readonly weight: number
  /** 行高（px）。 */
  readonly lineHeight: number
}

export interface TextSize {
  readonly width: number
  readonly ascent: number
  readonly descent: number
}

/**
 * 文字度量器。version 在度量结果可能变化时（精确度量器就绪、字体加载完成）递增，
 * 依赖度量的布局据此重算。
 */
export interface TextMeasurer {
  readonly version: number
  readonly measure: (text: string, font: FontSpec) => TextSize
}

/** 全角字符（中日韩文字、全角标点、表情）。 */
function isWide(code: number): boolean {
  return (code >= 0x1100 && code <= 0x115F)
    || (code >= 0x2E80 && code <= 0xA4CF)
    || (code >= 0xAC00 && code <= 0xD7A3)
    || (code >= 0xF900 && code <= 0xFAFF)
    || (code >= 0xFE30 && code <= 0xFE4F)
    || (code >= 0xFF00 && code <= 0xFF60)
    || (code >= 0xFFE0 && code <= 0xFFE6)
    || code >= 0x1F000
}

const NARROW = new Set('il.,:;|!\'`'.split(''))
const WIDE = new Set('mwMW@'.split(''))

/** 按字符类估出的宽度（em）。 */
function emWidth(char: string): number {
  const code = char.codePointAt(0) as number
  if (isWide(code))
    return 1
  if (char === ' ')
    return 0.28
  if (NARROW.has(char))
    return 0.28
  if (WIDE.has(char))
    return 0.85
  if (char >= '0' && char <= '9')
    return 0.6
  if (char >= 'A' && char <= 'Z')
    return 0.68
  return 0.55
}

/**
 * 确定性估算器：按字符类累加宽度——全角 1em，数字 0.6em（配合等宽数字），大写 0.68em，
 * 小写与其余字符 0.55em，窄字符（i l . , : ;）与空格 0.28em，宽字符（m w M W）0.85em。
 * 字重不参与估算。上伸取字号的 0.8，下伸取 0.2。
 */
export function createEstimatingMeasurer(): TextMeasurer {
  return Object.freeze({
    version: 0,
    measure(text: string, font: FontSpec): TextSize {
      let em = 0
      for (const char of text)
        em += emWidth(char)
      return { width: em * font.size, ascent: font.size * 0.8, descent: font.size * 0.2 }
    },
  })
}

/** 不放在行首的收尾标点（避头）。 */
const CLOSING = new Set('，。、；：！？）」』】〕〉》”’,.;:!?)]}%'.split(''))

function checkWidth(maxWidth: number): void {
  if (!(maxWidth >= 0))
    throw invalidArgument('最大宽度必须是非负数', { maxWidth })
}

/** 把文字截到 maxWidth 以内，截断时末尾换成「…」；连「…」都放不下时返回空串。 */
export function ellipsize(text: string, maxWidth: number, font: FontSpec, measurer: TextMeasurer): string {
  checkWidth(maxWidth)
  if (measurer.measure(text, font).width <= maxWidth)
    return text
  const chars = Array.from(text)
  let low = 0
  let high = chars.length
  // 最长的前缀，使「前缀 + …」放得下
  while (low < high) {
    const mid = (low + high + 1) >>> 1
    const candidate = `${chars.slice(0, mid).join('').trimEnd()}…`
    if (measurer.measure(candidate, font).width <= maxWidth)
      low = mid
    else
      high = mid - 1
  }
  const result = `${chars.slice(0, low).join('').trimEnd()}…`
  return measurer.measure(result, font).width <= maxWidth ? result : ''
}

export interface WrapOptions {
  /** 最多几行；超出时最后一行截断加「…」。缺省不限。 */
  readonly maxLines?: number
  /** auto：中日韩文字逐字可断、拉丁文按词断，单词本身过长时逐字断；char：任意两个字符之间都可断。 */
  readonly breakMode?: 'auto' | 'char'
}

/** 把一段不含换行的文字切成可断的单元。 */
function tokenize(paragraph: string, mode: 'auto' | 'char'): string[] {
  const chars = Array.from(paragraph)
  if (mode === 'char')
    return chars
  const tokens: string[] = []
  let word = ''
  const flush = (): void => {
    if (word) {
      tokens.push(word)
      word = ''
    }
  }
  for (const char of chars) {
    if (char === ' ') {
      flush()
      tokens.push(char)
    }
    else if (isWide(char.codePointAt(0) as number)) {
      flush()
      tokens.push(char)
    }
    else {
      word += char
    }
  }
  flush()
  // 避头：收尾标点并到前一个单元上，不单独落到行首
  const merged: string[] = []
  for (const token of tokens) {
    const previous = merged[merged.length - 1]
    if (previous !== undefined && previous !== ' ' && CLOSING.has(Array.from(token)[0] as string))
      merged[merged.length - 1] = previous + token
    else
      merged.push(token)
  }
  return merged
}

/**
 * 折行：贪心地把单元放进 maxWidth 宽的行；显式换行符强制断行，行首行尾的空格去掉。
 * 超过 maxLines 时，余下的文字并进最后一行再截断加「…」。
 */
export function wrapText(text: string, maxWidth: number, font: FontSpec, measurer: TextMeasurer, options: WrapOptions = {}): string[] {
  checkWidth(maxWidth)
  const { maxLines = Number.POSITIVE_INFINITY, breakMode = 'auto' } = options
  if (!(maxLines >= 1))
    throw invalidArgument('maxLines 至少为 1', { maxLines })
  const width = (s: string): number => measurer.measure(s, font).width
  const lines: string[] = []

  for (const paragraph of text.split(/\r?\n/)) {
    let line = ''
    const push = (): void => {
      lines.push(line.trim())
      line = ''
    }
    for (const token of tokenize(paragraph, breakMode)) {
      if (token === ' ') {
        if (line !== '')
          line += token
        continue
      }
      if (width(line + token) <= maxWidth) {
        line += token
        continue
      }
      if (line.trim() !== '')
        push()
      else
        line = ''
      if (width(token) <= maxWidth) {
        line = token
        continue
      }
      // 单元本身比一行还宽：逐字断开
      for (const char of Array.from(token)) {
        if (line !== '' && width(line + char) > maxWidth)
          push()
        line += char
      }
    }
    push()
  }

  if (lines.length <= maxLines)
    return lines
  const kept = lines.slice(0, maxLines - 1)
  // 余下的行接回一行：两侧都是拉丁文时补回被折掉的空格
  const rest = lines.slice(maxLines - 1).reduce((joined, next) => {
    const tail = Array.from(joined).pop()
    const head = Array.from(next)[0]
    const spaced = breakMode === 'auto' && tail !== undefined && head !== undefined
      && !isWide(tail.codePointAt(0) as number) && !isWide(head.codePointAt(0) as number)
    return joined + (spaced ? ' ' : '') + next
  })
  kept.push(ellipsize(rest, maxWidth, font, measurer))
  return kept
}
