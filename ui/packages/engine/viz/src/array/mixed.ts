/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 类型混杂的值：缺失判定、跨类型全序与身份编码，供排序、分组、去重与 in 匹配共用。

/** 字符串比较函数，返回负数、0 或正数；可直接传 `Intl.Collator` 的 `compare`。 */
export type StringCollator = (a: string, b: string) => number

/** 比较字符串时使用的排序规则；缺省按 UTF-16 码元。 */
export interface CollateOptions {
  readonly collate?: StringCollator
}

/**
 * 值是否缺失：null、undefined、NaN 与无效的 Date 是缺失值。
 * 空字符串、0 与 false 都不是缺失值。
 */
export function isMissing(value: unknown): boolean {
  if (value === null || value === undefined)
    return true
  if (typeof value === 'number')
    return Number.isNaN(value)
  if (value instanceof Date)
    return Number.isNaN(value.getTime())
  return false
}

function typeRank(value: unknown): number {
  switch (typeof value) {
    case 'boolean':
      return 0
    case 'number':
      return 1
    case 'string':
      return 3
    default:
      return value instanceof Date ? 2 : 4
  }
}

function sign(n: number): -1 | 0 | 1 {
  return n < 0 ? -1 : n > 0 ? 1 : 0
}

/**
 * 比较两个值，返回 -1、0 或 1。
 * 缺失值大于一切非缺失值；不同类型按 boolean < number < Date < string < 其它排；
 * 同类型时数值按大小，Date 按时刻，字符串按 collate，布尔值 false < true，其它值相等。
 */
export function compareMixed(a: unknown, b: unknown, options: CollateOptions = {}): -1 | 0 | 1 {
  const am = isMissing(a)
  const bm = isMissing(b)
  if (am || bm)
    return am === bm ? 0 : am ? 1 : -1
  const ra = typeRank(a)
  const rb = typeRank(b)
  if (ra !== rb)
    return ra < rb ? -1 : 1
  switch (ra) {
    case 0:
      return a === b ? 0 : a ? 1 : -1
    case 1:
      return sign((a as number) - (b as number))
    case 2:
      return sign((a as Date).getTime() - (b as Date).getTime())
    case 3:
      if (options.collate)
        return sign(options.collate(a as string, b as string))
      return a === b ? 0 : (a as string) < (b as string) ? -1 : 1
    default:
      return 0
  }
}

function encodeOther(value: unknown): string {
  if (typeof value === 'bigint')
    return `#${value.toString()}n`
  try {
    return `?${JSON.stringify(value)}`
  }
  catch {
    return `?${String(value)}`
  }
}

/**
 * 值的身份编码：编码相同即视为同一个值。
 * 缺失值共用一个编码；-0 与 0 相同；Date 按时刻；字符串 '1' 与数值 1 不同。
 */
export function valueKey(value: unknown): string {
  if (isMissing(value))
    return '_'
  switch (typeof value) {
    case 'boolean':
      return value ? 'b1' : 'b0'
    case 'number':
      return `#${String(value)}`
    case 'string':
      return `$${value}`
    default:
      return value instanceof Date ? `@${value.getTime()}` : encodeOther(value)
  }
}

/** 一组身份编码合成的组合编码，次序不同即不同。 */
export function tupleKey(keys: readonly string[]): string {
  return JSON.stringify(keys)
}
