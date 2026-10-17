/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 文字度量：TextMeasurer 协议以接口注入；确定性估算器让服务端与首帧算出同一份布局；折行与省略只经度量器量宽。

import type { FontSpec, TextMeasurer, TextSize } from './types'
import { invalidArgument } from '../errors'

export { createCanvasMeasurer } from './canvas-measurer'
export type { CanvasMeasurer } from './canvas-measurer'
export type { FontSpec, TextMeasurer, TextSize } from './types'

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
  /** 字间距（px），与 CSS letter-spacing 一样加在每个字符之后，可为负；缺省 0。 */
  readonly letterSpacing?: number
}

/** 在度量器量出的宽度上，按字符数加上字间距。 */
function withLetterSpacing(measurer: TextMeasurer, letterSpacing: number): TextMeasurer {
  return {
    get version() {
      return measurer.version
    },
    measure(text: string, font: FontSpec): TextSize {
      const size = measurer.measure(text, font)
      return { ...size, width: size.width + letterSpacing * Array.from(text).length }
    },
  }
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

/** 一段带字体的文字。 */
export interface TextRun {
  readonly text: string
  readonly font: FontSpec
  /** 字间距（px），加在这一段的每个字符之后，可为负；缺省 0。 */
  readonly letterSpacing?: number
}

/** 一行里同一段文字的一截。 */
export interface WrappedRunSegment {
  /** 所在段的下标。 */
  readonly run: number
  /** 在该段文字里的起止下标（UTF-16，左闭右开）。 */
  readonly start: number
  readonly end: number
  readonly text: string
  /** 距行首的横向位置（px）。 */
  readonly x: number
  readonly width: number
}

/** 折出的一行。 */
export interface WrappedRunLine {
  /** 至少一截；空行是一截长度为 0 的文字，指明这一行用哪一段的字体。 */
  readonly segments: readonly WrappedRunSegment[]
  readonly width: number
  /** 各截量出的最大上伸与下伸（px）。 */
  readonly ascent: number
  readonly descent: number
}

export interface WrapRunsOptions {
  /** auto：中日韩文字逐字可断、拉丁文按词断，单词本身过长时逐字断；char：任意两个字符之间都可断。 */
  readonly breakMode?: 'auto' | 'char'
}

/** 段落里的一个字符（码点）与它的出处。 */
interface RunChar {
  readonly char: string
  readonly run: number
  /** 在所在段文字里的下标（UTF-16）。 */
  readonly offset: number
}

/** 一个不含换行的段落；空段落用 anchor 定字体：结束它的换行所在处，最后一段没有换行时是段落起点。 */
interface RunParagraph {
  readonly chars: RunChar[]
  anchor: { readonly run: number, readonly offset: number }
}

/** 按显式换行把几段文字切成段落；`\r\n` 当一个换行。 */
function splitParagraphs(runs: readonly TextRun[]): RunParagraph[] {
  const paragraphs: RunParagraph[] = [{ chars: [], anchor: { run: 0, offset: 0 } }]
  runs.forEach((run, index) => {
    let offset = 0
    for (const char of run.text) {
      const current = paragraphs[paragraphs.length - 1] as RunParagraph
      if (char === '\n') {
        const last = current.chars[current.chars.length - 1]
        if (last?.char === '\r')
          current.chars.pop()
        if (current.chars.length === 0)
          current.anchor = { run: index, offset }
        paragraphs.push({ chars: [], anchor: { run: index, offset: offset + 1 } })
      }
      else {
        current.chars.push({ char, run: index, offset })
      }
      offset += char.length
    }
  })
  return paragraphs
}

/**
 * 多样式折行：几段各带字体与字间距的文字连成一串，按与 wrapText 相同的规则贪心折行——
 * 中日韩文字逐字可断、拉丁文按词断（单词跨两段样式时不拆开）、收尾标点不落到行首、单词比一行还宽时逐字断、
 * 显式换行强制断行，行首行尾的空白去掉。每行给出各截的出处、横向位置与宽度，以及这一行的最大上下伸；
 * 行高怎么算由调用方决定。
 */
export function wrapRuns(runs: readonly TextRun[], maxWidth: number, measurer: TextMeasurer, options: WrapRunsOptions = {}): WrappedRunLine[] {
  checkWidth(maxWidth)
  runs.forEach((run, index) => {
    if (run.letterSpacing !== undefined && !Number.isFinite(run.letterSpacing))
      throw invalidArgument('letterSpacing 必须是有限数', { run: index, letterSpacing: run.letterSpacing })
  })
  if (runs.length === 0)
    return []
  const { breakMode = 'auto' } = options
  const measureRun = (run: number, text: string): TextSize => {
    const spec = runs[run] as TextRun
    const size = measurer.measure(text, spec.font)
    const spacing = spec.letterSpacing ?? 0
    return spacing === 0 ? size : { ...size, width: size.width + spacing * Array.from(text).length }
  }
  const lines: WrappedRunLine[] = []

  for (const { chars, anchor } of splitParagraphs(runs)) {
    /** 字符区间按所在段分组，返回每组的段下标与文字。 */
    const groups = (from: number, to: number): { run: number, first: number, text: string }[] => {
      const result: { run: number, first: number, text: string }[] = []
      for (let index = from; index < to; index++) {
        const item = chars[index] as RunChar
        const last = result[result.length - 1]
        if (last !== undefined && last.run === item.run)
          last.text += item.char
        else
          result.push({ run: item.run, first: index, text: item.char })
      }
      return result
    }
    const width = (from: number, to: number): number => groups(from, to).reduce((sum, group) => sum + measureRun(group.run, group.text).width, 0)
    const hasContent = (from: number, to: number): boolean => chars.slice(from, to).some(item => item.char.trim() !== '')

    let start = 0
    let end = 0
    const push = (): void => {
      let from = start
      let to = end
      while (from < to && (chars[from] as RunChar).char.trim() === '')
        from++
      while (to > from && (chars[to - 1] as RunChar).char.trim() === '')
        to--
      if (from === to) {
        const at = chars[start] ?? anchor
        const size = measureRun(at.run, '')
        lines.push({ segments: [{ run: at.run, start: at.offset, end: at.offset, text: '', x: 0, width: 0 }], width: 0, ascent: size.ascent, descent: size.descent })
      }
      else {
        let x = 0
        let ascent = 0
        let descent = 0
        const segments = groups(from, to).map((group) => {
          const size = measureRun(group.run, group.text)
          const offset = (chars[group.first] as RunChar).offset
          const segment: WrappedRunSegment = { run: group.run, start: offset, end: offset + group.text.length, text: group.text, x, width: size.width }
          x += size.width
          ascent = Math.max(ascent, size.ascent)
          descent = Math.max(descent, size.descent)
          return segment
        })
        lines.push({ segments, width: x, ascent, descent })
      }
      start = end
    }

    let cursor = 0
    for (const token of tokenize(chars.map(item => item.char).join(''), breakMode)) {
      const tokenStart = cursor
      const tokenEnd = cursor + Array.from(token).length
      cursor = tokenEnd
      if (token === ' ') {
        if (end > start)
          end = tokenEnd
        else
          start = end = tokenEnd
        continue
      }
      if (width(start, tokenEnd) <= maxWidth) {
        end = tokenEnd
        continue
      }
      if (hasContent(start, end))
        push()
      else
        start = end = tokenStart
      if (width(tokenStart, tokenEnd) <= maxWidth) {
        end = tokenEnd
        continue
      }
      // 单元本身比一行还宽：逐字断开
      for (let index = tokenStart; index < tokenEnd; index++) {
        if (end > start && width(start, index + 1) > maxWidth)
          push()
        end = index + 1
      }
    }
    push()
  }
  return lines
}

/**
 * 折行：贪心地把单元放进 maxWidth 宽的行；显式换行符强制断行，行首行尾的空格去掉。
 * 超过 maxLines 时，余下的文字并进最后一行再截断加「…」。字间距计入每行宽度。断行规则与 wrapRuns 是同一份。
 */
export function wrapText(text: string, maxWidth: number, font: FontSpec, measurer: TextMeasurer, options: WrapOptions = {}): string[] {
  checkWidth(maxWidth)
  const { maxLines = Number.POSITIVE_INFINITY, breakMode = 'auto', letterSpacing = 0 } = options
  if (!(maxLines >= 1))
    throw invalidArgument('maxLines 至少为 1', { maxLines })
  if (!Number.isFinite(letterSpacing))
    throw invalidArgument('letterSpacing 必须是有限数', { letterSpacing })
  const lines = wrapRuns([{ text, font, letterSpacing }], maxWidth, measurer, { breakMode })
    .map(line => line.segments.map(segment => segment.text).join(''))

  if (lines.length <= maxLines)
    return lines
  const metered = letterSpacing === 0 ? measurer : withLetterSpacing(measurer, letterSpacing)
  const kept = lines.slice(0, maxLines - 1)
  // 余下的行接回一行：两侧都是拉丁文时补回被折掉的空格
  const rest = lines.slice(maxLines - 1).reduce((joined, next) => {
    const tail = Array.from(joined).pop()
    const head = Array.from(next)[0]
    const spaced = breakMode === 'auto' && tail !== undefined && head !== undefined
      && !isWide(tail.codePointAt(0) as number) && !isWide(head.codePointAt(0) as number)
    return joined + (spaced ? ' ' : '') + next
  })
  kept.push(ellipsize(rest, maxWidth, font, metered))
  return kept
}
