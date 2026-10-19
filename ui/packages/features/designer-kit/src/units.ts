/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 长度单位换算、显示与纸张预设：在毫米、厘米、英寸、磅与像素之间换算，长度数值的显示与步进，页面设置取常用纸张的纵向尺寸。

import type { Size } from './geometry'

/** 长度单位：毫米、厘米、英寸、磅（1/72 英寸）与像素（按 dpi 折算，缺省为 CSS 像素）。 */
export type LengthUnit = 'mm' | 'cm' | 'in' | 'pt' | 'px'

/** 全部长度单位，与 `LengthUnit` 一一对应；供属性面板列选项取用。 */
export const LENGTH_UNITS: readonly LengthUnit[] = ['mm', 'cm', 'in', 'pt', 'px']

/** 每英寸毫米数。 */
export const MM_PER_INCH = 25.4

/** 每英寸磅数。 */
export const PT_PER_INCH = 72

/** CSS 像素的每英寸像素数。 */
export const CSS_PX_PER_INCH = 96

/** 长度换算的选项。 */
export interface LengthConversionOptions {
  /** 像素换算用的每英寸像素数，缺省 96（CSS 像素）；按打印机分辨率换算时传 203、300 等。 */
  readonly dpi?: number
}

/** 一英寸折成的基准单位数：毫米、厘米、英寸与磅都是整数个基准单位。 */
const BASE_PER_INCH = 18288

/** 一个单位折成多少基准单位。 */
function baseLength(unit: LengthUnit, dpi: number): number {
  switch (unit) {
    case 'mm':
      return BASE_PER_INCH / MM_PER_INCH
    case 'cm':
      return BASE_PER_INCH / MM_PER_INCH * 10
    case 'in':
      return BASE_PER_INCH
    case 'pt':
      return BASE_PER_INCH / PT_PER_INCH
    case 'px':
      return BASE_PER_INCH / dpi
    default:
      throw new RangeError(`[designer-kit] unknown length unit "${String(unit)}"`)
  }
}

/**
 * 在长度单位之间换算，像素按 `dpi` 折算（缺省 96）。同一单位原样返回。
 * dpi 不是正的有限数或单位不认识时抛 RangeError。
 *
 * @example
 * convertLength(210, 'mm', 'px') // 793.7…：A4 宽按 CSS 像素
 * convertLength(12, 'pt', 'mm') // 4.233…
 * convertLength(25.4, 'mm', 'px', { dpi: 203 }) // 203
 */
export function convertLength(value: number, from: LengthUnit, to: LengthUnit, options: LengthConversionOptions = {}): number {
  const dpi = options.dpi ?? CSS_PX_PER_INCH
  if (!Number.isFinite(dpi) || dpi <= 0)
    throw new RangeError(`[designer-kit] dpi must be a positive finite number, got ${dpi}`)
  const fromBase = baseLength(from, dpi)
  const toBase = baseLength(to, dpi)
  return from === to ? value : value * fromBase / toBase
}

/** 长度单位的符号，与 LengthUnit 一一对应；尺寸徽标、标尺这类显示长度的地方取用。 */
export const LENGTH_UNIT_SYMBOLS: Readonly<Record<LengthUnit, string>> = { mm: 'mm', cm: 'cm', in: 'in', pt: 'pt', px: 'px' }

/** formatLength 的选项。 */
export interface FormatLengthOptions {
  /** 最多几位小数，缺省 1；须是 0–20 的整数。 */
  readonly fractionDigits?: number
  /** 写小数点用的 locale，缺省为运行环境的。 */
  readonly locale?: string
}

/** stepLength 的选项。 */
export interface StepLengthOptions {
  readonly min?: number
  readonly max?: number
  /** 取整到几位小数，缺省 1；须是 0–20 的整数。 */
  readonly fractionDigits?: number
}

function checkFractionDigits(digits: number): number {
  if (!Number.isInteger(digits) || digits < 0 || digits > 20)
    throw new RangeError(`[designer-kit] fractionDigits must be an integer between 0 and 20, got ${digits}`)
  return 10 ** digits
}

function checkFinite(name: string, value: number): void {
  if (!Number.isFinite(value))
    throw new RangeError(`[designer-kit] ${name} must be a finite number, got ${value}`)
}

/** 按小数位四舍五入，负零归成零。 */
function roundLength(value: number, factor: number): number {
  return Math.round(value * factor) / factor || 0
}

/**
 * 把长度数值写成文字（不带单位）：按 locale 写小数点，最多 fractionDigits 位小数（缺省 1），不分组，负零写成 0。
 * value 不是有限数或 fractionDigits 不合法时抛 RangeError。
 *
 * @example
 * formatLength(12.345) // '12.3'
 * formatLength(12.36, { locale: 'de-DE' }) // '12,4'
 */
export function formatLength(value: number, options: FormatLengthOptions = {}): string {
  checkFinite('value', value)
  const digits = options.fractionDigits ?? 1
  const rounded = roundLength(value, checkFractionDigits(digits))
  return new Intl.NumberFormat(options.locale, { maximumFractionDigits: digits, useGrouping: false }).format(rounded)
}

/**
 * 长度步进：value 加上 delta，按 fractionDigits 位小数（缺省 1）取整，再夹在 [min, max] 里；用来避开 0.1 + 0.2 这类尾差。
 * 数值不是有限数、fractionDigits 不合法或 min 大于 max 时抛 RangeError。
 *
 * @example
 * stepLength(0.1, 0.2) // 0.3
 * stepLength(3, -5, { min: 1 }) // 1
 */
export function stepLength(value: number, delta: number, options: StepLengthOptions = {}): number {
  checkFinite('value', value)
  checkFinite('delta', delta)
  const { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } = options
  if (min > max)
    throw new RangeError(`[designer-kit] min ${min} is greater than max ${max}`)
  const rounded = roundLength(value + delta, checkFractionDigits(options.fractionDigits ?? 1))
  return Math.min(max, Math.max(min, rounded))
}

/** 纸张预设名：ISO 216 的 A3–A6 与 B4、B5，北美的 Letter 与 Legal。 */
export type PaperPresetName = 'A3' | 'A4' | 'A5' | 'A6' | 'B4' | 'B5' | 'Letter' | 'Legal'

/** 全部纸张预设名，按 `PAPER_PRESETS` 的声明顺序；供页面设置列选项取用。 */
export const PAPER_PRESET_NAMES: readonly PaperPresetName[] = ['A3', 'A4', 'A5', 'A6', 'B4', 'B5', 'Letter', 'Legal']

/** 纸张预设的纵向尺寸，单位 mm；横向时宽高互换。 */
export const PAPER_PRESETS: Readonly<Record<PaperPresetName, Size>> = {
  A3: { width: 297, height: 420 },
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  A6: { width: 105, height: 148 },
  B4: { width: 250, height: 353 },
  B5: { width: 176, height: 250 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
}

/** 是否为纸张预设名，区分大小写。 */
export function isPaperPresetName(value: unknown): value is PaperPresetName {
  return typeof value === 'string' && (PAPER_PRESET_NAMES as readonly string[]).includes(value)
}
