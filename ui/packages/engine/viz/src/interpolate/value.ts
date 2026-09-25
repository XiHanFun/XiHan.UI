/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 数值、日期、数组、对象与嵌数字字符串的插值；piecewise 串联多段，quantize 等距取样。

import { invalidArgument } from '../errors'

/** 插值器：t = 0 得起点，t = 1 得终点；数值类插值器在区间外线性外推。 */
export type Interpolator<T> = (t: number) => T

export function interpolateNumber(a: number, b: number): Interpolator<number> {
  return t => a * (1 - t) + b * t
}

/** 数值插值后取整，适合像素与计数。 */
export function interpolateRound(a: number, b: number): Interpolator<number> {
  return t => Math.round(a * (1 - t) + b * t)
}

/** 按时间值插值，每次返回新的 Date。 */
export function interpolateDate(a: Date, b: Date): Interpolator<Date> {
  const x = +a
  const y = +b
  return t => new Date(x * (1 - t) + y * t)
}

/** 值可以插值的形状：数、日期、字符串、数组与普通对象，逐层递归。 */
export type Interpolatable = number | Date | string | readonly Interpolatable[] | { readonly [key: string]: Interpolatable }

/** 按 b 的长度逐项插值：两边都有的项插值，只在 b 里有的项保持 b 的值。 */
export function interpolateArray<T extends Interpolatable>(a: readonly T[], b: readonly T[]): Interpolator<T[]> {
  const parts = b.map((value, i) => (i < a.length ? interpolate(a[i] as T, value) : () => value))
  return t => parts.map(part => part(t)) as T[]
}

/** 按 b 的键逐个插值：两边都有的键插值，只在 b 里有的键保持 b 的值。 */
export function interpolateObject<T extends { readonly [key: string]: Interpolatable }>(a: T, b: T): Interpolator<T> {
  const parts = Object.keys(b).map((key) => {
    const target = b[key] as Interpolatable
    return [key, key in a ? interpolate(a[key] as Interpolatable, target) : () => target] as const
  })
  return (t) => {
    const out: Record<string, Interpolatable> = {}
    for (const [key, part] of parts)
      out[key] = part(t)
    return out as T
  }
}

const NUMBER_IN_TEXT = /[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi

/**
 * 嵌数字字符串的插值：以 b 为模板，b 里的第 i 个数与 a 里的第 i 个数插值，其余文字取 b。
 * `translate(0, 10)` → `translate(20, 30)` 的中点是 `translate(10, 20)`。
 */
export function interpolateString(a: string, b: string): Interpolator<string> {
  const from = [...a.matchAll(NUMBER_IN_TEXT)].map(m => Number(m[0]))
  const pieces: string[] = []
  const numbers: Array<Interpolator<number>> = []
  let cursor = 0
  for (const matched of b.matchAll(NUMBER_IN_TEXT)) {
    const index = matched.index ?? 0
    pieces.push(b.slice(cursor, index))
    const target = Number(matched[0])
    const i = numbers.length
    numbers.push(i < from.length ? interpolateNumber(from[i] as number, target) : () => target)
    cursor = index + matched[0].length
  }
  const tail = b.slice(cursor)
  if (numbers.length === 0)
    return () => b
  return (t) => {
    let out = ''
    numbers.forEach((part, i) => {
      out += (pieces[i] as string) + String(part(t))
    })
    return out + tail
  }
}

/** 按终点的类型选插值方式；两端类型不一致时报错。颜色字符串按普通字符串处理，颜色插值用 interpolateOklab / interpolateOklch。 */
export function interpolate<T extends Interpolatable>(a: T, b: T): Interpolator<T> {
  if (typeof b === 'number' && typeof a === 'number')
    return interpolateNumber(a, b) as Interpolator<T>
  if (b instanceof Date && a instanceof Date)
    return interpolateDate(a, b) as Interpolator<T>
  if (typeof b === 'string' && typeof a === 'string')
    return interpolateString(a, b) as Interpolator<T>
  if (Array.isArray(b) && Array.isArray(a))
    return interpolateArray(a, b) as unknown as Interpolator<T>
  if (typeof b === 'object' && b !== null && typeof a === 'object' && a !== null && !Array.isArray(a) && !Array.isArray(b) && !(a instanceof Date) && !(b instanceof Date))
    return interpolateObject(a as { readonly [key: string]: Interpolatable }, b as { readonly [key: string]: Interpolatable }) as unknown as Interpolator<T>
  throw invalidArgument('插值两端的类型不一致', { a, b })
}

/** 把多个值串成一条插值：t 均分成 n − 1 段，每段用 factory 在相邻两值之间插值。 */
export function piecewise<T>(factory: (a: T, b: T) => Interpolator<T>, values: readonly T[]): Interpolator<T> {
  if (values.length < 2)
    throw invalidArgument('piecewise 至少需要两个值', { count: values.length })
  const segments = values.slice(1).map((value, i) => factory(values[i] as T, value))
  const n = segments.length
  return (t) => {
    const i = Math.max(0, Math.min(n - 1, Math.floor(t * n)))
    return (segments[i] as Interpolator<T>)(t * n - i)
  }
}

/** 在 [0, 1] 上等距取 n 个样本（含两端）。 */
export function quantize<T>(interpolator: Interpolator<T>, n: number): T[] {
  if (!Number.isInteger(n) || n < 2)
    throw invalidArgument('取样个数必须是不小于 2 的整数', { n })
  return Array.from({ length: n }, (_, i) => interpolator(i / (n - 1)))
}
