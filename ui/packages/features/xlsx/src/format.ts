/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 格式说明换成 Excel 数字格式代码；格式说明与 @xihan-ui/expression 的 formatValue 规格同形。

/** 舍入方式，与 formatValue 一致。 */
export type XlsxFormatRounding = 'half-up' | 'half-even' | 'floor' | 'ceil' | 'down'

interface NumericSpec {
  readonly decimals?: number
  readonly minDecimals?: number
  readonly maxDecimals?: number
  readonly grouping?: boolean
  readonly rounding?: XlsxFormatRounding
}

/** 格式说明，与 formatValue 的规格同形：数字、百分比、日期模式、人民币大写、数字字形。 */
export type XlsxFormatSpec
  = | ({ readonly kind: 'number' } & NumericSpec)
    | ({ readonly kind: 'percent' } & NumericSpec)
    | { readonly kind: 'date', readonly pattern: string }
    | { readonly kind: 'rmb-upper', readonly rounding?: XlsxFormatRounding }
    | { readonly kind: 'numeral', readonly style: 'roman-upper' | 'roman-lower' | 'cn-lower' | 'cn-upper' }

type DateRole = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'

interface DatePart {
  readonly code: string
  readonly role: DateRole | null
}

const DATE_TOKENS: readonly (readonly [string, string, DateRole])[] = [
  ['yyyy', 'yyyy', 'year'],
  ['SSS', '000', 'millisecond'],
  ['yy', 'yy', 'year'],
  ['MM', 'mm', 'month'],
  ['dd', 'dd', 'day'],
  ['HH', 'hh', 'hour'],
  ['mm', 'mm', 'minute'],
  ['ss', 'ss', 'second'],
  ['M', 'm', 'month'],
  ['d', 'd', 'day'],
  ['H', 'h', 'hour'],
  ['m', 'm', 'minute'],
  ['s', 's', 'second'],
]

const PLAIN_LITERALS = new Set(['-', '/', ':', ' ', ','])

function quote(text: string): string {
  return [...text].every(char => PLAIN_LITERALS.has(char)) ? text : `"${text.replace(/"/g, '\\"')}"`
}

function numericCode(spec: NumericSpec, percent: boolean): string | null {
  const integer = spec.grouping ? '#,##0' : '0'
  const suffix = percent ? '%' : ''
  let fraction: string
  if (spec.decimals !== undefined) {
    fraction = '0'.repeat(spec.decimals)
  }
  else if (spec.maxDecimals !== undefined) {
    const min = spec.minDecimals ?? 0
    fraction = min >= 1 ? '0'.repeat(min) + '#'.repeat(Math.max(0, spec.maxDecimals - min)) : '0'.repeat(spec.maxDecimals)
  }
  else {
    return percent || spec.grouping ? null : 'General'
  }
  return `${integer}${fraction === '' ? '' : `.${fraction}`}${suffix}`
}

/** 拆出模式串的占位符与字面文本：单引号括起的内容原样，'' 是一个单引号。 */
function dateParts(pattern: string): DatePart[] {
  const parts: DatePart[] = []
  let literal = ''
  const flush = (): void => {
    if (literal !== '') {
      parts.push({ code: literal, role: null })
      literal = ''
    }
  }
  let index = 0
  while (index < pattern.length) {
    const char = pattern[index]!
    if (char === '\'') {
      if (pattern[index + 1] === '\'') {
        literal += '\''
        index += 2
        continue
      }
      index++
      while (index < pattern.length) {
        if (pattern[index] === '\'' && pattern[index + 1] === '\'') {
          literal += '\''
          index += 2
          continue
        }
        if (pattern[index] === '\'')
          break
        literal += pattern[index]
        index++
      }
      index++
      continue
    }
    const token = DATE_TOKENS.find(([name]) => pattern.startsWith(name, index))
    if (token) {
      flush()
      parts.push({ code: token[1], role: token[2] })
      index += token[0].length
    }
    else {
      literal += char
      index++
    }
  }
  flush()
  return parts
}

/** 相邻的占位符（跳过字面文本）。 */
function neighbour(parts: readonly DatePart[], index: number, step: 1 | -1): DatePart | undefined {
  for (let i = index + step; i >= 0 && i < parts.length; i += step) {
    if (parts[i]!.role !== null)
      return parts[i]
  }
  return undefined
}

function dateCode(pattern: string): string | null {
  const parts = dateParts(pattern)
  let out = ''
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!
    if (part.role === null) {
      if (part.code !== '.' || parts[i + 1]?.role !== 'millisecond')
        out += quote(part.code)
      continue
    }
    if (part.role === 'minute' || part.role === 'month') {
      const before = neighbour(parts, i, -1)
      const after = neighbour(parts, i, 1)
      const readsAsMinute = before?.role === 'hour' || (after?.role === 'second' && after.code === 'ss')
      if (readsAsMinute !== (part.role === 'minute'))
        return null
    }
    if (part.role === 'millisecond') {
      const dot = parts[i - 1]
      const second = parts[i - 2]
      if (dot?.role !== null || dot.code !== '.' || second?.role !== 'second' || second.code !== 'ss')
        return null
      out += '.000'
      continue
    }
    out += part.code
  }
  return out
}

/**
 * 格式说明换成 Excel 数字格式代码；Excel 表达不了时返回 null，调用方用 formatValue 的结果写成文本单元格。
 * - 数字与百分比：decimals 写成固定位数；给了 maxDecimals 时，minDecimals ≥ 1 写成 min 个 0 加 (max − min) 个 #，
 *   minDecimals 为 0 或没给时按 maxDecimals 写成固定位数；grouping 写千分位；都不给（不舍入）时数字为 General，
 *   百分比或带千分位的数字返回 null。
 * - Excel 显示时一律四舍五入取整；rounding 不是 half-up 时，调用方先用十进制运算把值舍入好，再写成数字单元格。
 * - 日期：占位符换成 Excel 写法（MM → mm、HH → hh、SSS → 000），其余文字写成字面文本。Excel 的 mm 只有紧挨 h / hh
 *   之后或紧挨 ss 之前才是分钟，其余位置都是月份；分钟或月份落在会被 Excel 读错的位置，或毫秒不紧跟在 ss. 之后时返回 null。
 * - 人民币大写与数字字形（罗马数字、中文数字）：返回 null。
 */
export function formatCode(spec: XlsxFormatSpec): string | null {
  switch (spec.kind) {
    case 'number':
      return numericCode(spec, false)
    case 'percent':
      return numericCode(spec, true)
    case 'date':
      return dateCode(spec.pattern)
    case 'rmb-upper':
    case 'numeral':
      return null
  }
}
