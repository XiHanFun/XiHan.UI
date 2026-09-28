/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 合并：K 线与柱在单根窄到画不出实体时，按 2 的幂根一组合成一根。组边界按全局序号对齐
// （floor(序号 / 组大小)），平移时每组的成员不变、画面不抖；缩放时组大小成倍跳变。

import { invalidArgument } from '../errors'

/**
 * 合并的组大小：2 的幂，使 count 根铺在 width 像素上时每组至少 minStep 像素宽。
 * 本来就放得下时为 1（不合并）。
 */
export function bucketSize(count: number, width: number, minStep: number): number {
  if (!(count > 0) || !(width > 0) || !(minStep > 0))
    return 1
  const need = (count * minStep) / width
  let size = 1
  while (size < need)
    size *= 2
  return size
}

function checkSize(size: number): void {
  if (!(Number.isInteger(size) && size >= 1))
    throw invalidArgument('组大小必须是正整数', { size })
}

/** 合并后的 K 线：每组一根。 */
export interface OhlcBuckets {
  readonly count: number
  /** 组里第一根与最后一根有值的 K 线的下标：画在它们之间。 */
  readonly first: Int32Array
  readonly last: Int32Array
  readonly open: Float64Array
  readonly high: Float64Array
  readonly low: Float64Array
  readonly close: Float64Array
}

/**
 * K 线合并：开取组里第一根的开盘、收取最后一根的收盘、高取最高、低取最低；四个价缺一个的那根不算。
 * start 是下标 0 那一行的序号（数据仓的 start），组边界按序号对齐。
 */
export function bucketOhlc(
  open: ArrayLike<number>,
  high: ArrayLike<number>,
  low: ArrayLike<number>,
  close: ArrayLike<number>,
  from: number,
  to: number,
  size: number,
  start = 0,
): OhlcBuckets {
  checkSize(size)
  const a = Math.max(0, Math.floor(from))
  const b = Math.min(open.length, Math.ceil(to))
  const capacity = Math.max(1, Math.ceil((b - a) / size) + 1)
  const first = new Int32Array(capacity)
  const last = new Int32Array(capacity)
  const o = new Float64Array(capacity)
  const h = new Float64Array(capacity)
  const l = new Float64Array(capacity)
  const c = new Float64Array(capacity)
  let count = 0
  let group = Number.NaN
  for (let i = a; i < b; i++) {
    const vo = open[i] as number
    const vh = high[i] as number
    const vl = low[i] as number
    const vc = close[i] as number
    if (Number.isNaN(vo) || Number.isNaN(vh) || Number.isNaN(vl) || Number.isNaN(vc))
      continue
    const g = Math.floor((start + i) / size)
    if (g !== group) {
      group = g
      first[count] = i
      last[count] = i
      o[count] = vo
      h[count] = vh
      l[count] = vl
      c[count] = vc
      count++
      continue
    }
    const k = count - 1
    last[k] = i
    c[k] = vc
    if (vh > (h[k] as number))
      h[k] = vh
    if (vl < (l[k] as number))
      l[k] = vl
  }
  return { count, first, last, open: o, high: h, low: l, close: c }
}

/** 合并后的柱：每组一根，取组里绝对值最大的那一根。 */
export interface PeakBuckets {
  readonly count: number
  readonly first: Int32Array
  readonly last: Int32Array
  /** 峰值那一根的下标：涨跌与提示都按它。 */
  readonly peak: Int32Array
  readonly value: Float64Array
}

/** 柱合并：每组取绝对值最大的一根（与 min-max 同一口径：峰值不丢）；缺失跳过。组边界同 bucketOhlc。 */
export function bucketPeak(values: ArrayLike<number>, from: number, to: number, size: number, start = 0): PeakBuckets {
  checkSize(size)
  const a = Math.max(0, Math.floor(from))
  const b = Math.min(values.length, Math.ceil(to))
  const capacity = Math.max(1, Math.ceil((b - a) / size) + 1)
  const first = new Int32Array(capacity)
  const last = new Int32Array(capacity)
  const peak = new Int32Array(capacity)
  const value = new Float64Array(capacity)
  let count = 0
  let group = Number.NaN
  for (let i = a; i < b; i++) {
    const v = values[i] as number
    if (Number.isNaN(v))
      continue
    const g = Math.floor((start + i) / size)
    if (g !== group) {
      group = g
      first[count] = i
      last[count] = i
      peak[count] = i
      value[count] = v
      count++
      continue
    }
    const k = count - 1
    last[k] = i
    if (Math.abs(v) > Math.abs(value[k] as number)) {
      value[k] = v
      peak[k] = i
    }
  }
  return { count, first, last, peak, value }
}
