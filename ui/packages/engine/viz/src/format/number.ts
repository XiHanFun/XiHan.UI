/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 数字格式：以 Intl.NumberFormat 为底，按参数缓存；刻度格式按步长推导小数位；百分比用最大余数法取整，合计不走样。

import { invalidArgument } from '../errors'

export interface NumberFormatSpec {
  readonly style?: 'decimal' | 'percent' | 'currency' | 'unit'
  /** compact 即紧凑记数：zh-CN 得到「1.2万」「3.4亿」，en 得到「12K」「340M」。 */
  readonly notation?: 'standard' | 'compact' | 'scientific' | 'engineering'
  /** ISO 4217 货币代码，style 为 currency 时必填。 */
  readonly currency?: string
  /** Intl 支持的单位名（如 `kilobyte`、`percent`），style 为 unit 时必填。 */
  readonly unit?: string
  /** 缺省 'auto'：单独格式化时用 Intl 的缺省精度，刻度格式按步长推导。 */
  readonly precision?: 'auto' | { readonly type: 'fixed' | 'significant', readonly digits: number }
  readonly signDisplay?: 'auto' | 'always' | 'exceptZero' | 'never'
}

const CACHE_LIMIT = 256
const cache = new Map<string, Intl.NumberFormat>()

/** 取缓存的 Intl.NumberFormat；构造失败（语言标签或货币代码不合法）转成 VizError。 */
function numberFormat(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(options)}`
  let format = cache.get(key)
  if (!format) {
    try {
      format = new Intl.NumberFormat(locale, options)
    }
    catch (error) {
      throw invalidArgument('数字格式参数不合法', { locale, options, reason: (error as Error).message })
    }
    if (cache.size >= CACHE_LIMIT)
      cache.clear()
    cache.set(key, format)
  }
  return format
}

function baseOptions(spec: NumberFormatSpec): Intl.NumberFormatOptions {
  const style = spec.style ?? 'decimal'
  if (style === 'currency' && !spec.currency)
    throw invalidArgument('货币格式缺少 currency', { spec })
  if (style === 'unit' && !spec.unit)
    throw invalidArgument('单位格式缺少 unit', { spec })
  const options: Intl.NumberFormatOptions = { style }
  if (spec.notation)
    options.notation = spec.notation
  if (style === 'currency')
    options.currency = spec.currency
  if (style === 'unit')
    options.unit = spec.unit
  if (spec.signDisplay)
    options.signDisplay = spec.signDisplay
  return options
}

function checkDigits(digits: number, max: number): number {
  if (!Number.isInteger(digits) || digits < 0 || digits > max)
    throw invalidArgument(`精度位数必须是 0–${max} 的整数`, { digits })
  return digits
}

function precisionOptions(precision: NumberFormatSpec['precision']): Intl.NumberFormatOptions {
  if (!precision || precision === 'auto')
    return {}
  if (precision.type === 'fixed') {
    const digits = checkDigits(precision.digits, 20)
    return { minimumFractionDigits: digits, maximumFractionDigits: digits }
  }
  const digits = checkDigits(precision.digits, 21)
  if (digits === 0)
    throw invalidArgument('有效数字位数至少为 1', { digits })
  return { maximumSignificantDigits: digits }
}

/** 按语言与格式参数返回数字格式函数。 */
export function createNumberFormat(locale: string, spec: NumberFormatSpec = {}): (value: number) => string {
  const format = numberFormat(locale, { ...baseOptions(spec), ...precisionOptions(spec.precision) })
  return value => format.format(value)
}

/**
 * 步长最低一位非零数字所在的 10 的幂：2500 → 2，0.025 → −3，5 → 0。
 * 刻度要写到这一位才能彼此区分；步长不必是 1、2、5 × 10 的幂（作者给的刻度可以是 2.5 的倍数）。
 */
function leastDigitPower(step: number): number {
  const x = Math.abs(step)
  let power = Math.floor(Math.log10(x) + 1e-9)
  for (let i = 0; i < 20; i++, power--) {
    const q = power >= 0 ? x / 10 ** power : x * 10 ** -power
    if (Math.abs(q - Math.round(q)) < 1e-6)
      return power
  }
  return power
}

/**
 * 刻度标签的格式：精度由刻度步长推导，同一根轴上的标签小数位一致（0.0、0.5、1.0）。
 * 百分比先乘 100 再推导；紧凑与科学记数按每个值写到步长最低一位所需的有效数字，12500 不会被写成「13K」。
 * 显式给了 precision 时按它格式化。
 */
export function tickFormat(step: number, locale: string, spec: NumberFormatSpec = {}): (value: number) => string {
  if (spec.precision && spec.precision !== 'auto')
    return createNumberFormat(locale, spec)
  const base = baseOptions(spec)
  const magnitude = Math.abs(step) * (base.style === 'percent' ? 100 : 1)
  if (!(magnitude > 0) || !Number.isFinite(magnitude))
    return createNumberFormat(locale, spec)

  const notation = spec.notation ?? 'standard'
  if (notation === 'standard') {
    const digits = Math.min(20, Math.max(0, -leastDigitPower(magnitude)))
    const format = numberFormat(locale, { ...base, minimumFractionDigits: digits, maximumFractionDigits: digits })
    return value => format.format(value)
  }
  const stepPower = leastDigitPower(magnitude)
  return (value) => {
    const scaled = Math.abs(value) * (base.style === 'percent' ? 100 : 1)
    if (scaled === 0 || !Number.isFinite(scaled))
      return numberFormat(locale, base).format(value)
    const significant = Math.min(21, Math.max(1, Math.floor(Math.log10(scaled) + 1e-9) - stepPower + 1))
    return numberFormat(locale, { ...base, maximumSignificantDigits: significant }).format(value)
  }
}

/**
 * 最大余数法取整：把 values 按比例缩放到合计 total，保留 digits 位小数，并保证取整后的合计仍是 total。
 * 先全部向下取整，再把差额逐个分给余数最大的项（余数相同先给靠前的项）。
 * 典型用法：三个 33.33…% 取整成 33、33、34，饼图标签合计恰为 100%。
 */
export function roundToTotal(values: readonly number[], total: number, digits: number): number[] {
  checkDigits(digits, 15)
  if (!Number.isFinite(total))
    throw invalidArgument('合计必须是有限数', { total })
  for (const [i, value] of values.entries()) {
    if (!(value >= 0) || !Number.isFinite(value))
      throw invalidArgument('参与取整的值必须是非负有限数', { index: i, value })
  }
  const sum = values.reduce((a, b) => a + b, 0)
  if (sum === 0)
    return values.map(() => 0)
  const scale = 10 ** digits
  const units = Math.round(total * scale)
  const exact = values.map(value => (value / sum) * units)
  const floors = exact.map(Math.floor)
  let remaining = units - floors.reduce((a, b) => a + b, 0)
  const order = exact
    .map((value, i) => ({ i, remainder: value - (floors[i] as number) }))
    .sort((a, b) => b.remainder - a.remainder || a.i - b.i)
  for (const { i } of order) {
    if (remaining <= 0)
      break
    floors[i] = (floors[i] as number) + 1
    remaining--
  }
  return floors.map(unit => unit / scale)
}
