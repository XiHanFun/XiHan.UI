/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 数字输入框的两道换算：提交时保留几位小数（precision），失焦时按语言格式化显示（formatOptions）。
// 纯函数，不认识 DOM 与状态机。

import { resolveNumberAnimationPrecision } from '../number-animation/number-animation.format'
import { formatStatisticValue } from '../statistic/statistic.format'

/** 提交位数归一：没给即不取整；给了就取整并夹进 [0, 20]，与数值动画的 precision 同一口径。 */
export function resolveNumberFieldPrecision(precision: number | undefined): number | undefined {
  return precision == null ? undefined : resolveNumberAnimationPrecision(precision)
}

/** 按十进制挪小数点：借科学计数法的字面量换位，不做浮点乘法，1.005 挪两位就是 100.5 而不是 100.49999999999999。 */
function shiftDecimal(value: number, by: number): number {
  const [mantissa, exponent = '0'] = String(value).split('e')
  return Number(`${mantissa}e${Number(exponent) + by}`)
}

/**
 * 按十进制把一个数四舍五入到 digits 位小数，正好一半时远离零进位（-2.5 → -3）。
 * 不直接用 Number#toFixed 取整：1.005 在二进制里略小于 1.005，toFixed(2) 会写成 1.00。非有限数原样返回。
 */
export function roundToPrecision(value: number, digits: number): number {
  if (!Number.isFinite(value))
    return value
  return Math.sign(value) * shiftDecimal(Math.round(shiftDecimal(Math.abs(value), digits)), -digits)
}

/** 按提交位数写出一个数：先四舍五入，再补齐到这么多位小数（12.5 写成 12.50）。 */
export function encodeWithPrecision(value: number, digits: number): string {
  return roundToPrecision(value, digits).toFixed(digits)
}

/** formatOptions 里这几项任何一项写了，显示的位数就以选项为准，不再按 precision 补齐。 */
const DIGIT_OPTION_KEYS = [
  'minimumFractionDigits',
  'maximumFractionDigits',
  'minimumSignificantDigits',
  'maximumSignificantDigits',
  'roundingIncrement',
] as const

/**
 * 失焦时输入框里显示的文字：按语言与 formatOptions 交给 Intl.NumberFormat，与统计数值同一个格式化器。
 * 给了 precision 而选项里没写任何小数位或有效位时，显示的小数位跟 precision 走，与提交的值一样长。
 * 选项或语言标记不合法时 Intl 当场抛 RangeError。
 */
export function formatNumberFieldValue(
  value: number,
  locale: string,
  options: Intl.NumberFormatOptions,
  precision: number | undefined,
): string {
  const own = options as Readonly<Record<string, unknown>>
  const digits = precision !== undefined && DIGIT_OPTION_KEYS.every(key => own[key] === undefined)
    ? { minimumFractionDigits: precision, maximumFractionDigits: precision, ...options }
    : options
  return formatStatisticValue(value, locale, digits)
}
