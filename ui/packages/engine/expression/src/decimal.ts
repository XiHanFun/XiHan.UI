/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 十进制数：34 位有效数字的精确四则运算、舍入、平方根与整数次幂。
import { Fault } from './issues'

/** 有效数字位数上限。 */
export const PRECISION = 34
/** 首位数字的十进制指数上限：绝对值须小于 10^65。 */
export const MAX_ADJUSTED_EXPONENT = 64
/** 最小量子指数：最小非零绝对值为 10^-64。 */
export const MIN_EXPONENT = -64

/**
 * 进位方式：
 * - `half-even`：四舍六入五成双，算术结果的有效位舍入用它。
 * - `half-up`：四舍五入（远离零），`ROUND` 用它。
 * - `floor` / `ceil`：向负无穷 / 正无穷。
 * - `down`：向零截断。
 */
export type RoundingMode = 'half-even' | 'half-up' | 'floor' | 'ceil' | 'down'

const NUMBER_TEXT = /^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i
const NONZERO_DIGIT = /[1-9]/
const LEADING_ZEROS = /^0+/
const EXPONENT_CLAMP = 1_000_000_000

/**
 * 十进制数：值为 `coefficient × 10^exponent`。
 * 规范形式：系数不带末尾的 0，零的系数与指数都是 0；所以两数相等当且仅当两个字段都相等。
 * 系数至多 34 位有效数字，绝对值小于 10^65，最小非零绝对值 10^-64。实例冻结。
 */
export class ExprNumber {
  readonly coefficient: bigint
  readonly exponent: number

  private constructor(coefficient: bigint, exponent: number) {
    this.coefficient = coefficient
    this.exponent = exponent
    Object.freeze(this)
  }

  /** 按十进制文本解析，接受 `-12.5`、`1e3`、`.5`；语法不合法或超出范围时返回 `null`。 */
  static parse(text: string): ExprNumber | null {
    const parsed = parseNumberText(text)
    return parsed instanceof ExprNumber ? parsed : null
  }

  /** 由 JS 数字转换，取其最短往返十进制表示；非有限数或超出范围时返回 `null`。 */
  static fromJs(value: number): ExprNumber | null {
    const converted = numberFromJs(value)
    return converted instanceof ExprNumber ? converted : null
  }

  /** 符号：-1、0 或 1。 */
  get sign(): -1 | 0 | 1 {
    return this.coefficient === 0n ? 0 : this.coefficient < 0n ? -1 : 1
  }

  /** 是否为整数。 */
  get isInteger(): boolean {
    return this.exponent >= 0
  }

  /** 比较大小：小于、等于、大于分别返回 -1、0、1。 */
  compare(other: ExprNumber): -1 | 0 | 1 {
    return compareNumbers(this, other)
  }

  /** 是否与另一个数相等。 */
  equals(other: ExprNumber): boolean {
    return this.coefficient === other.coefficient && this.exponent === other.exponent
  }

  /** 规范文本：不用科学计数法，不带多余的 0，负数带 `-`。 */
  toString(): string {
    const negative = this.coefficient < 0n
    const digits = (negative ? -this.coefficient : this.coefficient).toString()
    let body: string
    if (this.exponent >= 0) {
      body = this.coefficient === 0n ? '0' : digits + '0'.repeat(this.exponent)
    }
    else {
      const point = digits.length + this.exponent
      body = point > 0
        ? `${digits.slice(0, point)}.${digits.slice(point)}`
        : `0.${'0'.repeat(-point)}${digits}`
    }
    return negative ? `-${body}` : body
  }

  /** 转成最接近的 JS 数字。 */
  toJs(): number {
    return Number(this.toString())
  }

  toJSON(): string {
    return this.toString()
  }
}

/** 新建十进制数：构造函数不对外，模块里经它新建，不经 static 块，类才能被摇掉。 */
function construct(coefficient: bigint, exponent: number): ExprNumber {
  return new (ExprNumber as unknown as new (coefficient: bigint, exponent: number) => ExprNumber)(coefficient, exponent)
}

/** 0。 */
export const ZERO: ExprNumber = /* @__PURE__ */ makeNumber(0n, 0)
/** 1。 */
export const ONE: ExprNumber = /* @__PURE__ */ makeNumber(1n, 0)

function makeNumber(coefficient: bigint, exponent: number): ExprNumber {
  return construct(coefficient, exponent)
}

function pow10(power: number): bigint {
  return 10n ** BigInt(power)
}

function digitCount(magnitude: bigint): number {
  return magnitude === 0n ? 1 : magnitude.toString().length
}

function magnitudeOf(value: bigint): bigint {
  return value < 0n ? -value : value
}

/** 去掉非负整数的末 `drop` 位并按方式进位；`negative` 表示原值为负。 */
function roundDigits(magnitude: bigint, drop: number, mode: RoundingMode, negative: boolean): bigint {
  if (drop <= 0 || magnitude === 0n)
    return magnitude
  let quotient: bigint
  let half: -1 | 0 | 1
  let inexact: boolean
  if (drop > digitCount(magnitude)) {
    quotient = 0n
    half = -1
    inexact = true
  }
  else {
    const divisor = pow10(drop)
    quotient = magnitude / divisor
    const twice = (magnitude % divisor) * 2n
    inexact = twice !== 0n
    half = twice < divisor ? -1 : twice === divisor ? 0 : 1
  }
  let up: boolean
  switch (mode) {
    case 'half-even':
      up = half > 0 || (half === 0 && (quotient & 1n) === 1n)
      break
    case 'half-up':
      up = half >= 0
      break
    case 'floor':
      up = negative && inexact
      break
    case 'ceil':
      up = !negative && inexact
      break
    case 'down':
      up = false
      break
  }
  return up ? quotient + 1n : quotient
}

/** 把精确结果舍入成规范的十进制数：34 位有效数字、最小量子 10^-64，超出上限返回溢出故障。 */
export function finalize(coefficient: bigint, exponent: number, mode: RoundingMode = 'half-even'): ExprNumber | Fault {
  if (coefficient === 0n)
    return ZERO
  const negative = coefficient < 0n
  let magnitude = negative ? -coefficient : coefficient
  let scale = exponent
  const drop = Math.max(digitCount(magnitude) - PRECISION, MIN_EXPONENT - scale, 0)
  if (drop > 0) {
    magnitude = roundDigits(magnitude, drop, mode, negative)
    scale += drop
  }
  if (magnitude === 0n)
    return ZERO
  while (magnitude % 10n === 0n) {
    magnitude /= 10n
    scale += 1
  }
  if (scale + digitCount(magnitude) - 1 > MAX_ADJUSTED_EXPONENT)
    return new Fault('XH_EXPR_NUMBER_OVERFLOW')
  return construct(negative ? -magnitude : magnitude, scale)
}

/** 解析十进制文本；语法不合法返回 `null`，超出范围返回溢出故障。 */
export function parseNumberText(text: string): ExprNumber | Fault | null {
  const match = NUMBER_TEXT.exec(text)
  if (match === null)
    return null
  const [, sign = '', integerPart = '', fractionPart = '', exponentPart] = match
  if (integerPart === '' && fractionPart === '')
    return null
  let exponent = 0
  if (exponentPart !== undefined) {
    const parsed = Number(exponentPart)
    exponent = Math.max(-EXPONENT_CLAMP, Math.min(EXPONENT_CLAMP, parsed))
  }
  exponent -= fractionPart.length
  const significant = (integerPart + fractionPart).replace(LEADING_ZEROS, '')
  if (significant === '')
    return ZERO
  const keep = PRECISION + 3
  let coefficient: bigint
  if (significant.length > keep) {
    coefficient = BigInt(significant.slice(0, keep))
    exponent += significant.length - keep
    if (NONZERO_DIGIT.test(significant.slice(keep))) {
      coefficient = coefficient * 10n + 1n
      exponent -= 1
    }
  }
  else {
    coefficient = BigInt(significant)
  }
  return finalize(sign === '-' ? -coefficient : coefficient, exponent)
}

/** 由 JS 数字转换：非有限数返回不支持故障，超出范围返回溢出故障。 */
export function numberFromJs(value: number): ExprNumber | Fault {
  if (!Number.isFinite(value))
    return new Fault('XH_EXPR_UNSUPPORTED_VALUE')
  if (value === 0)
    return ZERO
  return parseNumberText(String(value)) ?? new Fault('XH_EXPR_UNSUPPORTED_VALUE')
}

/** 由安全整数构造。 */
export function numberFromInteger(value: number): ExprNumber {
  return finalize(BigInt(value), 0) as ExprNumber
}

/** 比较两个数的大小。 */
export function compareNumbers(a: ExprNumber, b: ExprNumber): -1 | 0 | 1 {
  if (a.sign !== b.sign)
    return a.sign < b.sign ? -1 : 1
  if (a.sign === 0)
    return 0
  const scale = Math.min(a.exponent, b.exponent)
  const left = a.coefficient * pow10(a.exponent - scale)
  const right = b.coefficient * pow10(b.exponent - scale)
  return left < right ? -1 : left > right ? 1 : 0
}

/** 取反。 */
export function negate(value: ExprNumber): ExprNumber {
  return value.coefficient === 0n ? value : construct(-value.coefficient, value.exponent)
}

/** 绝对值。 */
export function absolute(value: ExprNumber): ExprNumber {
  return value.coefficient < 0n ? construct(-value.coefficient, value.exponent) : value
}

/** 加法。 */
export function add(a: ExprNumber, b: ExprNumber): ExprNumber | Fault {
  const scale = Math.min(a.exponent, b.exponent)
  return finalize(a.coefficient * pow10(a.exponent - scale) + b.coefficient * pow10(b.exponent - scale), scale)
}

/** 减法。 */
export function subtract(a: ExprNumber, b: ExprNumber): ExprNumber | Fault {
  return add(a, negate(b))
}

/** 乘法。 */
export function multiply(a: ExprNumber, b: ExprNumber): ExprNumber | Fault {
  return finalize(a.coefficient * b.coefficient, a.exponent + b.exponent)
}

/** 除法：商按 34 位有效数字四舍六入五成双；除数为 0 返回故障。 */
export function divide(a: ExprNumber, b: ExprNumber): ExprNumber | Fault {
  return divideParts(a.coefficient, a.exponent, b.coefficient, b.exponent)
}

function divideParts(dividend: bigint, dividendExponent: number, divisor: bigint, divisorExponent: number): ExprNumber | Fault {
  if (divisor === 0n)
    return new Fault('XH_EXPR_DIVISION_BY_ZERO')
  if (dividend === 0n)
    return ZERO
  const top = magnitudeOf(dividend)
  const bottom = magnitudeOf(divisor)
  const shift = Math.max(0, PRECISION + 2 + digitCount(bottom) - digitCount(top))
  const scaled = top * pow10(shift)
  let quotient = scaled / bottom
  let exponent = dividendExponent - divisorExponent - shift
  if (scaled % bottom !== 0n) {
    quotient = quotient * 10n + 1n
    exponent -= 1
  }
  const negative = (dividend < 0n) !== (divisor < 0n)
  return finalize(negative ? -quotient : quotient, exponent)
}

/** 取余：截断除法的余数，符号随被除数；除数为 0 返回故障。 */
export function remainder(a: ExprNumber, b: ExprNumber): ExprNumber | Fault {
  if (b.coefficient === 0n)
    return new Fault('XH_EXPR_DIVISION_BY_ZERO')
  const scale = Math.min(a.exponent, b.exponent)
  const left = a.coefficient * pow10(a.exponent - scale)
  const right = b.coefficient * pow10(b.exponent - scale)
  return finalize(left % right, scale)
}

/** 舍入到小数点后 `places` 位（负数表示整数位），按给定方式进位。 */
export function roundToPlaces(value: ExprNumber, places: number, mode: RoundingMode): ExprNumber | Fault {
  const target = -places
  if (value.exponent >= target)
    return value
  const negative = value.coefficient < 0n
  const magnitude = roundDigits(magnitudeOf(value.coefficient), target - value.exponent, mode, negative)
  return finalize(negative ? -magnitude : magnitude, target)
}

function integerSqrt(value: bigint): bigint {
  if (value < 2n)
    return value
  let current = 1n << BigInt((value.toString(2).length + 1) >> 1)
  for (;;) {
    const next = (current + value / current) >> 1n
    if (next >= current)
      return current
    current = next
  }
}

/** 平方根，按 34 位有效数字四舍六入五成双；负数返回不合法实参故障。 */
export function squareRoot(value: ExprNumber): ExprNumber | Fault {
  if (value.coefficient < 0n)
    return new Fault('XH_EXPR_INVALID_ARGUMENT', { index: 0 })
  if (value.coefficient === 0n)
    return ZERO
  let coefficient = value.coefficient
  let exponent = value.exponent
  if (exponent % 2 !== 0) {
    coefficient *= 10n
    exponent -= 1
  }
  const shift = Math.max(0, Math.ceil((2 * (PRECISION + 2) - digitCount(coefficient)) / 2))
  const scaled = coefficient * pow10(2 * shift)
  let root = integerSqrt(scaled)
  let rootExponent = exponent / 2 - shift
  if (root * root !== scaled) {
    root = root * 10n + 1n
    rootExponent -= 1
  }
  return finalize(root, rootExponent)
}

/** 整数次幂：先求精确值再舍入一次；`|power|` 由调用方限定。 */
export function integerPower(base: ExprNumber, power: number): ExprNumber | Fault {
  if (power === 0)
    return ONE
  if (base.coefficient === 0n)
    return power > 0 ? ZERO : new Fault('XH_EXPR_DIVISION_BY_ZERO')
  const count = Math.abs(power)
  const adjusted = base.exponent + digitCount(magnitudeOf(base.coefficient)) - 1
  if (power > 0) {
    if (adjusted * count > MAX_ADJUSTED_EXPONENT)
      return new Fault('XH_EXPR_NUMBER_OVERFLOW')
    if ((adjusted + 1) * count <= MIN_EXPONENT - 1)
      return ZERO
    return finalize(base.coefficient ** BigInt(count), base.exponent * count)
  }
  if (-(adjusted + 1) * count >= MAX_ADJUSTED_EXPONENT + 1)
    return new Fault('XH_EXPR_NUMBER_OVERFLOW')
  if (-adjusted * count <= MIN_EXPONENT - 1)
    return ZERO
  return divideParts(1n, 0, base.coefficient ** BigInt(count), base.exponent * count)
}
