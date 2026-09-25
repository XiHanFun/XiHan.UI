/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 堆叠：按键逐列累加出每段的 [y0, y1]，支持六种次序与五种偏移，并标出每列最外层的段（只有它做圆角）。

import { isPresent } from '../array/statistics'
import { invalidArgument, VizError } from '../errors'

export type StackOrder = 'none' | 'appearance' | 'ascending' | 'descending' | 'insideOut' | 'reverse'
export type StackOffset = 'none' | 'expand' | 'diverging' | 'silhouette' | 'wiggle'

/** y0 是贴近基线的一端，y1 是值所在的一端，y1 − y0 恒等于该段的值（负值段 y1 < y0）。 */
export interface StackSegment<Row> {
  readonly y0: number
  readonly y1: number
  readonly data: Row
  /** 值存在；缺失的段 y0 = y1，不画。 */
  readonly defined: boolean
  /** 这一列朝该方向最外层的段（远离基线的那一端做圆角）。 */
  readonly outermost: boolean
}

export interface StackSeries<Row> {
  readonly key: string
  /** 在 keys 里的位置。 */
  readonly index: number
  /** 堆叠次序里的位置，0 贴着基线。 */
  readonly order: number
  readonly segments: readonly StackSegment<Row>[]
}

export interface StackOptions<Row> {
  readonly keys: readonly string[]
  readonly value: (row: Row, key: string) => number | null | undefined
  /** 缺省 none（按 keys 的顺序）。 */
  readonly order?: StackOrder
  /**
   * 缺省 none（从 0 起逐段累加）。expand 每列归一到 [0, 1]；diverging 正值向上、负值向下各自累加；
   * silhouette 以 0 为中线居中；wiggle 让各层的加权斜率最小（流图）。
   */
  readonly offset?: StackOffset
}

/** 峰值出现得越早越靠前。 */
function appearance(values: readonly Float64Array[]): number[] {
  const peaks = values.map((column) => {
    let at = 0
    for (let j = 1; j < column.length; j++) {
      if ((column[j] as number) > (column[at] as number))
        at = j
    }
    return at
  })
  return values.map((_, i) => i).sort((a, b) => (peaks[a] as number) - (peaks[b] as number) || a - b)
}

function sums(values: readonly Float64Array[]): number[] {
  return values.map(series => series.reduce((a, b) => a + b, 0))
}

function orderOf(kind: StackOrder, values: readonly Float64Array[]): number[] {
  const indices = values.map((_, i) => i)
  switch (kind) {
    case 'none':
      return indices
    case 'reverse':
      return indices.reverse()
    case 'appearance':
      return appearance(values)
    case 'ascending': {
      const total = sums(values)
      return indices.sort((a, b) => (total[a] as number) - (total[b] as number) || a - b)
    }
    case 'descending': {
      const total = sums(values)
      return indices.sort((a, b) => (total[b] as number) - (total[a] as number) || a - b)
    }
    case 'insideOut': {
      // 按峰值先后逐层放到上下两侧中较轻的一侧，峰值早的层落在中间
      const total = sums(values)
      const tops: number[] = []
      const bottoms: number[] = []
      let top = 0
      let bottom = 0
      for (const i of appearance(values)) {
        if (top < bottom) {
          top += total[i] as number
          tops.push(i)
        }
        else {
          bottom += total[i] as number
          bottoms.push(i)
        }
      }
      return bottoms.reverse().concat(tops)
    }
    default:
      throw invalidArgument('未知的堆叠次序', { order: kind })
  }
}

/** 堆叠布局。expand 遇到负值抛 `XH_VIZ_NEGATIVE_SHARE`：百分比堆叠不能表达负数。 */
export function stack<Row>(rows: readonly Row[], options: StackOptions<Row>): StackSeries<Row>[] {
  const { keys, order = 'none', offset = 'none' } = options
  const seen = new Set<string>()
  for (const key of keys) {
    if (seen.has(key))
      throw new VizError('XH_VIZ_DUPLICATE_KEY', '堆叠的键重复', { key })
    seen.add(key)
  }
  const m = rows.length
  const n = keys.length
  // 逐系列的值与存在标记放进类型化数组：一万行、十个系列时逐段建对象是主要开销，这里只建最终输出
  const values: Float64Array[] = []
  const defined: Uint8Array[] = []
  for (let i = 0; i < n; i++) {
    const key = keys[i] as string
    const column = new Float64Array(m)
    const flags = new Uint8Array(m)
    for (let j = 0; j < m; j++) {
      const v = options.value(rows[j] as Row, key)
      if (isPresent(v) && Number.isFinite(v)) {
        if (offset === 'expand' && v < 0)
          throw new VizError('XH_VIZ_NEGATIVE_SHARE', '百分比堆叠的值不能为负', { key, row: j, value: v })
        column[j] = v
        flags[j] = 1
      }
    }
    values.push(column)
    defined.push(flags)
  }
  const sequence = orderOf(order, values)
  const y0 = keys.map(() => new Float64Array(m))
  const y1 = keys.map(() => new Float64Array(m))
  const outermost = keys.map(() => new Uint8Array(m))

  // 每列的基线
  const baseline = new Float64Array(m)
  if (offset === 'silhouette') {
    for (let j = 0; j < m; j++) {
      let total = 0
      for (let i = 0; i < n; i++)
        total += (values[i] as Float64Array)[j] as number
      baseline[j] = -total / 2
    }
  }
  else if (offset === 'wiggle' && n > 0) {
    // 基线的变化量取各层斜率按厚度加权后的平均的相反数，使整体的加权摆动最小
    let g = 0
    for (let j = 1; j < m; j++) {
      let weighted = 0
      let thickness = 0
      let below = 0
      for (const i of sequence) {
        const column = values[i] as Float64Array
        const now = column[j] as number
        const change = now - (column[j - 1] as number)
        weighted += now * (below + change / 2)
        thickness += now
        below += change
      }
      if (thickness > 0)
        g -= weighted / thickness
      baseline[j] = g
    }
  }

  for (let j = 0; j < m; j++) {
    let total = 1
    if (offset === 'expand') {
      total = 0
      for (let i = 0; i < n; i++)
        total += (values[i] as Float64Array)[j] as number
    }
    let up = baseline[j] as number
    let down = up
    // 同时记下这一列朝上、朝下各自最外层的非零段
    let top = -1
    let topEnd = 0
    let bottom = -1
    let bottomEnd = 0
    for (const i of sequence) {
      let v = (values[i] as Float64Array)[j] as number
      if (offset === 'expand')
        v = total > 0 ? v / total : 0
      const from = offset === 'diverging' && v < 0 ? down : up
      const to = from + v
      ;(y0[i] as Float64Array)[j] = from
      ;(y1[i] as Float64Array)[j] = to
      if (offset === 'diverging' && v < 0)
        down = to
      else
        up = to
      if (to > from && (top < 0 || to >= topEnd)) {
        top = i
        topEnd = to
      }
      if (to < from && (bottom < 0 || to <= bottomEnd)) {
        bottom = i
        bottomEnd = to
      }
    }
    if (top >= 0)
      (outermost[top] as Uint8Array)[j] = 1
    if (bottom >= 0)
      (outermost[bottom] as Uint8Array)[j] = 1
  }

  const rank = new Int32Array(n)
  sequence.forEach((i, position) => {
    rank[i] = position
  })
  const out: StackSeries<Row>[] = []
  for (let i = 0; i < n; i++) {
    const a = y0[i] as Float64Array
    const b = y1[i] as Float64Array
    const flags = defined[i] as Uint8Array
    const outer = outermost[i] as Uint8Array
    const segments: StackSegment<Row>[] = []
    for (let j = 0; j < m; j++)
      segments.push({ y0: a[j] as number, y1: b[j] as number, data: rows[j] as Row, defined: flags[j] === 1, outermost: outer[j] === 1 })
    out.push({ key: keys[i] as string, index: i, order: rank[i] as number, segments })
  }
  return out
}
