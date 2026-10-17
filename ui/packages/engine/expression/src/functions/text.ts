/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 文本函数：拼接、截取、查找、替换、拆分与数字格式化。
import type { ExprValue } from '../value'
import type { FunctionEntry, Runtime } from './entry'
import { isWhitespace } from '../chars'
import { ExprNumber, numberFromInteger, parseNumberText, roundToPlaces } from '../decimal'
import { Fault } from '../issues'
import { ExprList, listItem, listOf, toText, valuesEqual } from '../value'
import { builtin } from './entry'
import { anyNull, integerArg, invalidArgument, limitString, stringArg, typeMismatch } from './helpers'

/** 文本位置与长度实参的上限。 */
const LENGTH_LIMIT = 2_147_483_647
/** `FORMAT_NUMBER` 小数位上限。 */
const FORMAT_PLACES_LIMIT = 34

function codePoints(text: string): string[] {
  return Array.from(text)
}

function mapAscii(text: string, from: number, to: number, shift: number): string {
  let out = ''
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index)
    out += code >= from && code <= to ? String.fromCharCode(code + shift) : text[index]!
  }
  return out
}

/** 去掉首尾空白，空白集合与词法里的空白相同。 */
export function trimText(text: string): string {
  let start = 0
  let end = text.length
  while (start < end && isWhitespace(text.charCodeAt(start)))
    start += 1
  while (end > start && isWhitespace(text.charCodeAt(end - 1)))
    end -= 1
  return text.slice(start, end)
}

/* @__NO_SIDE_EFFECTS__ */
function unaryText(name: string, transform: (text: string) => ExprValue): FunctionEntry {
  return builtin(name, ['text'], 1, 1, (args) => {
    if (anyNull(args))
      return null
    const text = stringArg(args, 0)
    return text instanceof Fault ? text : transform(text)
  })
}

/* @__NO_SIDE_EFFECTS__ */
function pairText(name: string, part: string, test: (text: string, part: string) => boolean): FunctionEntry {
  return builtin(name, ['text', part], 2, 2, (args) => {
    if (anyNull(args))
      return null
    const text = stringArg(args, 0)
    if (text instanceof Fault)
      return text
    const part = stringArg(args, 1)
    return part instanceof Fault ? part : test(text, part)
  })
}

/* @__NO_SIDE_EFFECTS__ */
function sliceText(name: string, pick: (points: string[], count: number) => string[]): FunctionEntry {
  return builtin(name, ['text', 'count'], 2, 2, (args) => {
    if (anyNull(args))
      return null
    const text = stringArg(args, 0)
    if (text instanceof Fault)
      return text
    const count = integerArg(args, 1, 0, LENGTH_LIMIT)
    return count instanceof Fault ? count : pick(codePoints(text), count).join('')
  })
}

function groupDigits(digits: string): string {
  let out = ''
  for (let index = 0; index < digits.length; index += 1) {
    if (index > 0 && (digits.length - index) % 3 === 0)
      out += ','
    out += digits[index]
  }
  return out
}

function formatNumber(value: ExprNumber, places: number, grouping: boolean): string | Fault {
  const rounded = roundToPlaces(value, places, 'half-up')
  if (rounded instanceof Fault)
    return rounded
  const text = rounded.toString()
  const negative = text.startsWith('-')
  const [integerPart = '0', fractionPart = ''] = (negative ? text.slice(1) : text).split('.')
  const integer = grouping ? groupDigits(integerPart) : integerPart
  const fraction = places > 0 ? `.${fractionPart.padEnd(places, '0')}` : ''
  return `${negative ? '-' : ''}${integer}${fraction}`
}

function joinList(list: ExprList, separator: string, runtime: Runtime): string | Fault {
  const entered = runtime.enter()
  if (entered)
    return entered
  try {
    let out = ''
    for (let index = 0; index < list.length; index += 1) {
      const charged = runtime.charge(1)
      if (charged)
        return charged
      const item = listItem(list, index)
      if (item instanceof Fault)
        return item
      const text = toText(item)
      if (text instanceof Fault)
        return new Fault('XH_EXPR_TYPE_MISMATCH', { index: 0, ...text.data })
      out += index > 0 ? separator + text : text
      if (out.length > runtime.maxStringLength)
        return limitString(out, runtime)
    }
    return out
  }
  finally {
    runtime.leave()
  }
}

function listContains(list: ExprList, needle: ExprValue, runtime: Runtime): boolean | Fault {
  for (let index = 0; index < list.length; index += 1) {
    const charged = runtime.charge(1)
    if (charged)
      return charged
    const item = listItem(list, index)
    if (item instanceof Fault)
      return item
    const equal = valuesEqual(item, needle, runtime)
    if (equal !== false)
      return equal
  }
  return false
}

/** 文本函数：长度、截取按 Unicode 码点计，大小写只转换 ASCII 字母。 */
export const TEXT_FUNCTIONS: readonly FunctionEntry[] = [
  builtin('CONCAT', ['value'], 1, null, (args, runtime) => {
    let out = ''
    for (let index = 0; index < args.length; index += 1) {
      const text = toText(args[index]!)
      if (text instanceof Fault)
        return new Fault('XH_EXPR_TYPE_MISMATCH', { ...text.data, index })
      out += text
      if (out.length > runtime.maxStringLength)
        return limitString(out, runtime)
    }
    return out
  }),
  builtin('TEXT', ['value'], 1, 1, (args) => {
    const text = toText(args[0]!)
    return text instanceof Fault ? new Fault('XH_EXPR_TYPE_MISMATCH', { ...text.data, index: 0 }) : text
  }),
  unaryText('LEN', text => numberFromInteger(codePoints(text).length)),
  unaryText('UPPER', text => mapAscii(text, 0x61, 0x7A, -32)),
  unaryText('LOWER', text => mapAscii(text, 0x41, 0x5A, 32)),
  unaryText('TRIM', trimText),
  sliceText('LEFT', (points, count) => points.slice(0, count)),
  sliceText('RIGHT', (points, count) => (count === 0 ? [] : points.slice(-count))),
  builtin('MID', ['text', 'start', 'length'], 3, 3, (args) => {
    if (anyNull(args))
      return null
    const text = stringArg(args, 0)
    if (text instanceof Fault)
      return text
    const start = integerArg(args, 1, 1, LENGTH_LIMIT)
    if (start instanceof Fault)
      return start
    const length = integerArg(args, 2, 0, LENGTH_LIMIT)
    return length instanceof Fault ? length : codePoints(text).slice(start - 1, start - 1 + length).join('')
  }),
  builtin('CONTAINS', ['source', 'search'], 2, 2, (args, runtime) => {
    const [haystack = null, needle = null] = args
    if (haystack instanceof ExprList)
      return listContains(haystack, needle, runtime)
    if (haystack === null || needle === null)
      return null
    if (typeof haystack !== 'string')
      return typeMismatch(0, haystack)
    return typeof needle === 'string' ? haystack.includes(needle) : typeMismatch(1, needle)
  }),
  pairText('STARTS_WITH', 'prefix', (text, part) => text.startsWith(part)),
  pairText('ENDS_WITH', 'suffix', (text, part) => text.endsWith(part)),
  builtin('REPLACE', ['text', 'search', 'replacement'], 3, 3, (args, runtime) => {
    if (anyNull(args))
      return null
    const text = stringArg(args, 0)
    if (text instanceof Fault)
      return text
    const search = stringArg(args, 1)
    if (search instanceof Fault)
      return search
    const replacement = stringArg(args, 2)
    if (replacement instanceof Fault)
      return replacement
    if (search === '')
      return invalidArgument(1)
    const parts = text.split(search)
    const length = text.length + (parts.length - 1) * (replacement.length - search.length)
    if (length > runtime.maxStringLength)
      return new Fault('XH_EXPR_STRING_TOO_LONG', { max: runtime.maxStringLength })
    return parts.join(replacement)
  }),
  builtin('SPLIT', ['text', 'separator'], 2, 2, (args, runtime) => {
    if (anyNull(args))
      return null
    const text = stringArg(args, 0)
    if (text instanceof Fault)
      return text
    const separator = stringArg(args, 1)
    if (separator instanceof Fault)
      return separator
    if (separator === '')
      return invalidArgument(1)
    const parts = text.split(separator)
    const charged = runtime.charge(parts.length)
    return charged ?? listOf(parts)
  }),
  builtin('JOIN', ['list', 'separator'], 1, 2, (args, runtime) => {
    if (anyNull(args))
      return null
    const list = args[0]!
    if (!(list instanceof ExprList))
      return typeMismatch(0, list)
    const separator = args.length > 1 ? stringArg(args, 1) : ''
    return separator instanceof Fault ? separator : joinList(list, separator, runtime)
  }),
  builtin('FORMAT_NUMBER', ['number', 'decimals', 'grouping'], 2, 3, (args) => {
    if (anyNull(args))
      return null
    const value = args[0]!
    if (!(value instanceof ExprNumber))
      return typeMismatch(0, value)
    const places = integerArg(args, 1, 0, FORMAT_PLACES_LIMIT)
    if (places instanceof Fault)
      return places
    const grouping = args.length > 2 ? args[2]! : false
    if (typeof grouping !== 'boolean')
      return typeMismatch(2, grouping)
    return formatNumber(value, places, grouping)
  }),
  builtin('TO_NUMBER', ['value'], 1, 1, (args) => {
    const value = args[0]!
    if (value === null || value instanceof ExprNumber)
      return value
    if (typeof value !== 'string')
      return typeMismatch(0, value)
    return parseNumberText(trimText(value))
  }),
]
