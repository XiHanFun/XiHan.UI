/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// M4 降采样：沿有序的自变量把点按像素列分组，每列只留首、末、最小、最大四个点（带第二列时再加它的最小与最大）。
// 同一列里的点画出来落在同一列像素上，留下的四个点画出的折线与全量逐像素相同：尖峰不丢，形状不变。
// 点本来就稀的时候每列只有一两个点，原样全留，不需要另判要不要降采样。

import { invalidArgument } from '../errors'

/** 降采样的结果：留下的行的下标，按原次序；−1 是断点（缺失值把线断开的地方）。 */
export interface Decimation {
  readonly indices: Int32Array
  readonly count: number
}

export interface DecimateOptions {
  /** 第二列（区间带的另一沿）：它的最小与最大同样保留，缺失同样断开。 */
  readonly y2?: ArrayLike<number>
  /** 缺失值：break 断开（缺省），skip 跳过、两边连起来。 */
  readonly gaps?: 'break' | 'skip'
  /** 复用的输出缓冲：够大就直接写进去，不够再换新的。 */
  readonly out?: Int32Array
}

/**
 * 按像素列降采样。x 为 null 时自变量就是下标（等距轴）；pixel 把自变量换成像素，须单调不减。
 * 只看 [from, to) 这一段，返回的下标仍是整列里的下标。
 */
export function decimateLine(
  x: ArrayLike<number> | null,
  y: ArrayLike<number>,
  from: number,
  to: number,
  pixel: (value: number) => number,
  options: DecimateOptions = {},
): Decimation {
  if (x && x.length !== y.length)
    throw invalidArgument('自变量列与数值列必须等长', { x: x.length, y: y.length })
  const y2 = options.y2
  if (y2 && y2.length !== y.length)
    throw invalidArgument('第二列与数值列必须等长', { y: y.length, y2: y2.length })
  const skip = options.gaps === 'skip'
  const a = Math.max(0, Math.floor(from))
  const b = Math.min(y.length, Math.ceil(to))
  let out = options.out && options.out.length > 0 ? options.out : new Int32Array(Math.max(16, Math.min(8192, (b - a) * 2)))
  let count = 0
  const push = (value: number): void => {
    if (count === out.length) {
      const next = new Int32Array(out.length * 2)
      next.set(out)
      out = next
    }
    out[count++] = value
  }

  // 当前像素列的候选：首、末、最小、最大，第二列的最小、最大
  let column = Number.NaN
  let first = -1
  let last = -1
  let minAt = -1
  let maxAt = -1
  let minValue = 0
  let maxValue = 0
  let min2At = -1
  let max2At = -1
  let min2Value = 0
  let max2Value = 0
  const picked = [0, 0, 0, 0, 0, 0]

  const flush = (): void => {
    if (first < 0)
      return
    const candidates = y2 ? [first, minAt, maxAt, min2At, max2At, last] : [first, minAt, maxAt, last]
    let n = 0
    // 候选至多六个：插入排序、去重，按下标输出
    for (const index of candidates) {
      let k = n
      while (k > 0 && (picked[k - 1] as number) > index)
        k--
      if (k > 0 && picked[k - 1] === index)
        continue
      for (let m = n; m > k; m--)
        picked[m] = picked[m - 1] as number
      picked[k] = index
      n++
    }
    for (let k = 0; k < n; k++)
      push(picked[k] as number)
    first = -1
  }

  for (let i = a; i < b; i++) {
    const v = y[i] as number
    const v2 = y2 ? y2[i] as number : 0
    if (Number.isNaN(v) || Number.isNaN(v2)) {
      if (skip)
        continue
      flush()
      // 断点只在两段有值的点之间出现：开头的缺失与连续的缺失都不重复写
      if (count > 0 && out[count - 1] !== -1)
        push(-1)
      continue
    }
    const c = Math.floor(pixel(x ? x[i] as number : i))
    if (c !== column || first < 0) {
      flush()
      column = c
      first = i
      last = i
      minAt = i
      maxAt = i
      minValue = v
      maxValue = v
      min2At = i
      max2At = i
      min2Value = v2
      max2Value = v2
      continue
    }
    last = i
    if (v < minValue) {
      minValue = v
      minAt = i
    }
    if (v > maxValue) {
      maxValue = v
      maxAt = i
    }
    if (y2) {
      if (v2 < min2Value) {
        min2Value = v2
        min2At = i
      }
      if (v2 > max2Value) {
        max2Value = v2
        max2At = i
      }
    }
  }
  flush()
  // 末尾的断点后面没有点了，去掉
  if (count > 0 && out[count - 1] === -1)
    count--
  return { indices: out, count }
}
