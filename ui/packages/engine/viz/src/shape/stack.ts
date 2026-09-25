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
function appearance(values: number[][]): number[] {
  const peaks = values.map((column) => {
    let at = 0
    column.forEach((v, j) => {
      if (v > (column[at] as number))
        at = j
    })
    return at
  })
  return values.map((_, i) => i).sort((a, b) => (peaks[a] as number) - (peaks[b] as number) || a - b)
}

function sums(values: number[][]): number[] {
  return values.map(series => series.reduce((a, b) => a + b, 0))
}

function orderOf(kind: StackOrder, values: number[][]): number[] {
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
  const defined: boolean[][] = []
  const values: number[][] = keys.map((key, i) => {
    const flags: boolean[] = []
    const column = rows.map((row) => {
      const v = options.value(row, key)
      const present = isPresent(v) && Number.isFinite(v)
      flags.push(present)
      return present ? v : 0
    })
    defined[i] = flags
    return column
  })
  if (offset === 'expand') {
    values.forEach((series, i) => series.forEach((v, j) => {
      if (v < 0)
        throw new VizError('XH_VIZ_NEGATIVE_SHARE', '百分比堆叠的值不能为负', { key: keys[i], row: j, value: v })
    }))
  }
  const sequence = orderOf(order, values)
  const y0 = keys.map(() => Array.from<number>({ length: m }).fill(0))
  const y1 = keys.map(() => Array.from<number>({ length: m }).fill(0))

  // 每列的基线
  const baseline = Array.from<number>({ length: m }).fill(0)
  if (offset === 'silhouette') {
    for (let j = 0; j < m; j++)
      baseline[j] = -values.reduce((total, series) => total + (series[j] as number), 0) / 2
  }
  else if (offset === 'wiggle' && sequence.length > 0) {
    // 基线的变化量取各层斜率按厚度加权后的平均的相反数，使整体的加权摆动最小
    let g = 0
    for (let j = 1; j < m; j++) {
      let weighted = 0
      let thickness = 0
      let below = 0
      for (const i of sequence) {
        const now = (values[i] as number[])[j] as number
        const change = now - ((values[i] as number[])[j - 1] as number)
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
    const total = values.reduce((sum, series) => sum + (series[j] as number), 0)
    let up = baseline[j] as number
    let down = baseline[j] as number
    for (const i of sequence) {
      let v = (values[i] as number[])[j] as number
      if (offset === 'expand')
        v = total > 0 ? v / total : 0
      if (offset === 'diverging' && v < 0) {
        ;(y0[i] as number[])[j] = down
        ;(y1[i] as number[])[j] = down + v
        down += v
      }
      else {
        ;(y0[i] as number[])[j] = up
        ;(y1[i] as number[])[j] = up + v
        up += v
      }
    }
  }

  // 每列朝上、朝下各自最外层的非零段
  const outermost = keys.map(() => Array.from<boolean>({ length: m }).fill(false))
  for (let j = 0; j < m; j++) {
    let top = -1
    let bottom = -1
    for (const i of sequence) {
      const a = (y0[i] as number[])[j] as number
      const b = (y1[i] as number[])[j] as number
      if (b > a && (top < 0 || b >= ((y1[top] as number[])[j] as number)))
        top = i
      if (b < a && (bottom < 0 || b <= ((y1[bottom] as number[])[j] as number)))
        bottom = i
    }
    if (top >= 0)
      (outermost[top] as boolean[])[j] = true
    if (bottom >= 0)
      (outermost[bottom] as boolean[])[j] = true
  }

  return keys.map((key, i) => ({
    key,
    index: i,
    order: sequence.indexOf(i),
    segments: rows.map((row, j) => ({
      y0: (y0[i] as number[])[j] as number,
      y1: (y1[i] as number[])[j] as number,
      data: row,
      defined: (defined[i] as boolean[])[j] as boolean,
      outermost: (outermost[i] as boolean[])[j] as boolean,
    })),
  }))
}
