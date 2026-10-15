/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 值的格式化：数字、百分比、日期与人民币大写，数字一律按十进制精确舍入。

import type { RoundingMode } from './decimal'
import { ExprDate, formatDate } from './date'
import { ExprNumber, multiply, numberFromInteger, parseNumberText, roundToPlaces } from './decimal'
import { Fault } from './issues'

/** 舍入方式：四舍五入（缺省）、四舍六入五成双、向下、向上、截断。 */
export type FormatRounding = 'half-up' | 'half-even' | 'floor' | 'ceil' | 'down'

/**
 * 数字格式：
 * - `decimals`：固定小数位，不足补 0；
 * - 或 `minDecimals` / `maxDecimals`：舍入到最多 `maxDecimals` 位，再去掉末尾的 0，至少保留 `minDecimals` 位；
 * - 都不给时按规范文本输出、不舍入。
 */
export interface NumberFormatSpec {
  readonly kind: 'number'
  readonly decimals?: number
  readonly minDecimals?: number
  readonly maxDecimals?: number
  /** 是否每三位加千分位，缺省不加。 */
  readonly grouping?: boolean
  readonly rounding?: FormatRounding
}

/** 百分比：先乘 100，再按数字格式输出并接上 `%`。 */
export interface PercentFormatSpec extends Omit<NumberFormatSpec, 'kind'> {
  readonly kind: 'percent'
}

/** 日期：按模式输出，占位符见 `FORMAT_DATE`。 */
export interface DateFormatSpec {
  readonly kind: 'date'
  readonly pattern: string
}

/** 人民币大写：舍入到分，用「元」不用「圆」，整数金额以「整」结尾。 */
export interface RmbUpperFormatSpec {
  readonly kind: 'rmb-upper'
  readonly rounding?: FormatRounding
}

/** 格式说明。 */
export type FormatSpec = NumberFormatSpec | PercentFormatSpec | DateFormatSpec | RmbUpperFormatSpec

/** 格式化选项。 */
export interface FormatOptions {
  /** 区域：只决定小数点与千分位符号，数字始终是 ASCII 数字；缺省用 `.` 与 `,`。 */
  readonly locale?: string
  /** 时区：`UTC`、`±HH:mm` 或 IANA 名称，只作用于带偏移的日期文本、JS 数字（毫秒时间戳）与 `Date`。 */
  readonly timeZone?: string
}

const ROUNDINGS: ReadonlySet<string> = new Set(['half-up', 'half-even', 'floor', 'ceil', 'down'])
const DECIMALS_LIMIT = 34
const UPPER_DIGITS = '零壹贰叁肆伍陆柒捌玖'
const UPPER_UNITS = ['', '拾', '佰', '仟']
const UPPER_SECTIONS = ['', '万', '亿', '万亿']
const UPPER_LIMIT = /* @__PURE__ */ ExprNumber.parse('1e16')!
const HUNDRED = /* @__PURE__ */ numberFromInteger(100)
const OFFSET_ZONE = /^([+-])(\d{2}):?(\d{2})$/
const INSTANT_TEXT = /(?:Z|[+-]\d{2}:?\d{2})$/

function invalidSpec(): never {
  throw new TypeError('XH_EXPR_FORMAT_INVALID_SPEC')
}

function invalidValue(): never {
  throw new TypeError('XH_EXPR_FORMAT_INVALID_VALUE')
}

function decimalsOption(value: unknown): number | undefined {
  if (value === undefined)
    return undefined
  return Number.isSafeInteger(value) && (value as number) >= 0 && (value as number) <= DECIMALS_LIMIT ? value as number : invalidSpec()
}

function roundingOption(value: unknown): RoundingMode {
  if (value === undefined)
    return 'half-up'
  return typeof value === 'string' && ROUNDINGS.has(value) ? value as RoundingMode : invalidSpec()
}

function toNumber(value: unknown): ExprNumber {
  if (value instanceof ExprNumber)
    return value
  if (typeof value === 'number')
    return ExprNumber.fromJs(value) ?? invalidValue()
  if (typeof value === 'bigint' || typeof value === 'string') {
    const parsed = parseNumberText(String(value))
    return parsed instanceof ExprNumber ? parsed : invalidValue()
  }
  return invalidValue()
}

function rounded(value: ExprNumber, places: number, mode: RoundingMode): ExprNumber {
  const result = roundToPlaces(value, places, mode)
  return result instanceof Fault ? invalidValue() : result
}

function separators(locale: string | undefined): { decimal: string, group: string } {
  if (locale === undefined)
    return { decimal: '.', group: ',' }
  let parts: Intl.NumberFormatPart[]
  try {
    parts = new Intl.NumberFormat(locale, { useGrouping: true }).formatToParts(12345.6)
  }
  catch {
    return invalidSpec()
  }
  return {
    decimal: parts.find(part => part.type === 'decimal')?.value ?? '.',
    group: parts.find(part => part.type === 'group')?.value ?? ',',
  }
}

function groupDigits(digits: string, group: string): string {
  let out = ''
  for (let index = 0; index < digits.length; index += 1) {
    if (index > 0 && (digits.length - index) % 3 === 0)
      out += group
    out += digits[index]
  }
  return out
}

function formatNumberText(value: ExprNumber, spec: Omit<NumberFormatSpec, 'kind'>, locale: string | undefined): string {
  const decimals = decimalsOption(spec.decimals)
  const minDecimals = decimalsOption(spec.minDecimals)
  const maxDecimals = decimalsOption(spec.maxDecimals)
  const mode = roundingOption(spec.rounding)
  if (spec.grouping !== undefined && typeof spec.grouping !== 'boolean')
    invalidSpec()
  if (decimals !== undefined && (minDecimals !== undefined || maxDecimals !== undefined))
    invalidSpec()
  if (minDecimals !== undefined && maxDecimals !== undefined && minDecimals > maxDecimals)
    invalidSpec()
  const places = decimals ?? maxDecimals
  const result = places === undefined ? value : rounded(value, places, mode)
  const text = result.toString()
  const negative = text.startsWith('-')
  const [integerPart = '0', fractionPart = ''] = (negative ? text.slice(1) : text).split('.')
  const pad = decimals ?? minDecimals ?? 0
  const fraction = fractionPart.padEnd(pad, '0')
  const { decimal, group } = separators(locale)
  const integer = spec.grouping === true ? groupDigits(integerPart, group) : integerPart
  return `${negative ? '-' : ''}${integer}${fraction === '' ? '' : decimal + fraction}`
}

function sectionText(section: number): string {
  const digits = String(section).padStart(4, '0')
  let out = ''
  let zero = false
  for (let index = 0; index < 4; index += 1) {
    const digit = Number(digits[index])
    if (digit === 0) {
      zero = out !== ''
      continue
    }
    if (zero)
      out += '零'
    zero = false
    out += UPPER_DIGITS[digit]! + UPPER_UNITS[3 - index]!
  }
  return out
}

function integerUpper(integer: string): string {
  const sections: number[] = []
  for (let end = integer.length; end > 0; end -= 4)
    sections.unshift(Number(integer.slice(Math.max(0, end - 4), end)))
  let out = ''
  let gap = false
  sections.forEach((section, position) => {
    const unit = UPPER_SECTIONS[sections.length - 1 - position]!
    if (section === 0) {
      gap = out !== ''
      return
    }
    if (out !== '' && (gap || section < 1000))
      out += '零'
    gap = false
    out += sectionText(section) + unit
  })
  return out
}

function rmbUpper(value: ExprNumber, spec: RmbUpperFormatSpec): string {
  const amount = rounded(value, 2, roundingOption(spec.rounding))
  const negative = amount.sign < 0
  const text = negative ? amount.toString().slice(1) : amount.toString()
  if (ExprNumber.parse(text)!.compare(UPPER_LIMIT) >= 0)
    throw new TypeError('XH_EXPR_FORMAT_OUT_OF_RANGE')
  const [integerPart = '0', fractionPart = ''] = text.split('.')
  const jiao = Number(fractionPart[0] ?? '0')
  const fen = Number(fractionPart[1] ?? '0')
  const hasInteger = integerPart !== '0'
  let out = hasInteger ? `${integerUpper(integerPart)}元` : ''
  if (jiao === 0 && fen === 0)
    out = hasInteger ? `${out}整` : '零元整'
  else if (jiao === 0)
    out += `${hasInteger ? '零' : ''}${UPPER_DIGITS[fen]}分`
  else
    out += `${UPPER_DIGITS[jiao]}角${fen === 0 ? '' : `${UPPER_DIGITS[fen]}分`}`
  return negative && out !== '零元整' ? `负${out}` : out
}

function zoneParts(epochMilliseconds: number, timeZone: string | undefined): ExprDate {
  const offset = timeZone === undefined || timeZone === 'UTC' ? 0 : fixedOffset(timeZone)
  if (offset !== null)
    return ExprDate.fromEpochMilliseconds(epochMilliseconds + offset) ?? invalidValue()
  let parts: Intl.DateTimeFormatPart[]
  try {
    parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).formatToParts(new Date(epochMilliseconds))
  }
  catch {
    return invalidSpec()
  }
  const read = (type: Intl.DateTimeFormatPartTypes): number => Number(parts.find(part => part.type === type)?.value)
  const millisecond = ((epochMilliseconds % 1000) + 1000) % 1000
  return ExprDate.fromParts(read('year'), read('month'), read('day'), read('hour'), read('minute'), read('second'), millisecond) ?? invalidValue()
}

function fixedOffset(timeZone: string): number | null {
  const match = OFFSET_ZONE.exec(timeZone)
  if (match === null)
    return null
  const [, sign, hours = '0', minutes = '0'] = match
  const total = (Number(hours) * 60 + Number(minutes)) * 60_000
  return sign === '-' ? -total : total
}

function instantOf(text: string): number | null {
  if (!INSTANT_TEXT.test(text))
    return null
  const epoch = Date.parse(text)
  return Number.isFinite(epoch) ? epoch : null
}

function toDate(value: unknown, timeZone: string | undefined): ExprDate {
  if (value instanceof ExprDate)
    return value
  if (value instanceof Date)
    return Number.isFinite(value.getTime()) ? zoneParts(value.getTime(), timeZone) : invalidValue()
  if (typeof value === 'number')
    return Number.isFinite(value) ? zoneParts(value, timeZone) : invalidValue()
  if (typeof value === 'string') {
    const instant = timeZone === undefined ? null : instantOf(value)
    if (instant !== null)
      return zoneParts(instant, timeZone)
    return ExprDate.parse(value) ?? invalidValue()
  }
  return invalidValue()
}

/**
 * 按格式说明把值转成文本；`null` 与 `undefined` 得到空串。
 * 数字类接受 `ExprNumber`、有限的 JS 数字、`bigint` 与十进制文本，按十进制精确舍入；
 * 日期类接受 `ExprDate`、日期文本、毫秒时间戳与 `Date`：不带偏移的文本按墙钟时间原样输出，
 * 带偏移的文本在给了 `timeZone` 时换算到该时区，时间戳与 `Date` 换算到 `timeZone`（缺省 UTC）。
 * 格式说明不合法抛 `TypeError('XH_EXPR_FORMAT_INVALID_SPEC')`，值不合法抛 `TypeError('XH_EXPR_FORMAT_INVALID_VALUE')`，
 * 人民币大写的金额绝对值达到一亿亿时抛 `TypeError('XH_EXPR_FORMAT_OUT_OF_RANGE')`。
 */
export function formatValue(value: unknown, spec: FormatSpec, options: FormatOptions = {}): string {
  if (typeof spec !== 'object' || spec === null)
    invalidSpec()
  if (value === null || value === undefined)
    return ''
  switch (spec.kind) {
    case 'number':
      return formatNumberText(toNumber(value), spec, options.locale)
    case 'percent': {
      const scaled = multiply(toNumber(value), HUNDRED)
      return `${formatNumberText(scaled instanceof Fault ? invalidValue() : scaled, spec, options.locale)}%`
    }
    case 'date':
      if (typeof spec.pattern !== 'string' || spec.pattern === '')
        invalidSpec()
      return formatDate(toDate(value, options.timeZone), spec.pattern)
    case 'rmb-upper':
      return rmbUpper(toNumber(value), spec)
    default:
      return invalidSpec()
  }
}
