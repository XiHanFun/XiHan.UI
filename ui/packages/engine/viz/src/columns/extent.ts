/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 分块极值：块按全局序号对齐，每块的最小与最大算一次缓存。数据仓里只有最后一行可变，
// 不含末行的整块永久有效（直到清空换 epoch）；查询只逐个扫两头的零头，中间整块查表。

import type { ColumnSource } from './store'
import { invalidArgument } from '../errors'

/** 一段数据的极值与它们所在的下标（相对数据的首行）。 */
export interface RangeExtent {
  readonly min: number
  readonly max: number
  readonly minAt: number
  readonly maxAt: number
}

export interface ExtentIndex {
  /** [from, to) 里 low 列的最小与 high 列的最大；缺失值跳过，一个有值的都没有时为 null。 */
  readonly extent: (from: number, to: number) => RangeExtent | null
}

/** 分块长度。 */
export const EXTENT_BLOCK = 1024

interface Block {
  readonly min: number
  readonly max: number
  /** 极值所在的序号；块里没有值时为 −1。 */
  readonly minSeq: number
  readonly maxSeq: number
}

interface Accumulator {
  min: number
  max: number
  minSeq: number
  maxSeq: number
}

/**
 * 为数据仓的一列（或下沿、上沿两列：K 线的最低价与最高价）建极值索引。
 * 字段必须是数据仓声明过的。
 */
export function createExtentIndex(source: ColumnSource, low: string, high: string = low): ExtentIndex {
  for (const field of [low, high]) {
    if (!source.fields.includes(field))
      throw invalidArgument('极值索引的字段没有声明', { field })
  }
  let epoch = source.epoch
  const blocks = new Map<number, Block>()

  /** 逐个扫 [from, to)（下标），序号 = base + 下标，结果并进 acc。 */
  const scan = (lo: Float64Array, hi: Float64Array, from: number, to: number, base: number, acc: Accumulator): void => {
    for (let i = from; i < to; i++) {
      const a = lo[i] as number
      if (a < acc.min) {
        acc.min = a
        acc.minSeq = base + i
      }
      const b = hi[i] as number
      if (b > acc.max) {
        acc.max = b
        acc.maxSeq = base + i
      }
    }
  }

  const merge = (acc: Accumulator, block: Block): void => {
    if (block.minSeq >= 0 && block.min < acc.min) {
      acc.min = block.min
      acc.minSeq = block.minSeq
    }
    if (block.maxSeq >= 0 && block.max > acc.max) {
      acc.max = block.max
      acc.maxSeq = block.maxSeq
    }
  }

  return Object.freeze({
    extent(from: number, to: number): RangeExtent | null {
      if (source.epoch !== epoch) {
        blocks.clear()
        epoch = source.epoch
      }
      const n = source.length
      const a = Math.max(0, Math.floor(from))
      const b = Math.min(n, Math.ceil(to))
      if (a >= b)
        return null
      const lo = source.column(low) as Float64Array
      const hi = source.column(high) as Float64Array
      const start = source.start
      // 含末行的块不缓存：末行随时可能被改写
      const lastSeq = start + n - 1
      const acc: Accumulator = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY, minSeq: -1, maxSeq: -1 }
      const firstBlock = Math.ceil((start + a) / EXTENT_BLOCK)
      const endBlock = Math.floor((start + b) / EXTENT_BLOCK)
      if (firstBlock >= endBlock) {
        scan(lo, hi, a, b, start, acc)
      }
      else {
        scan(lo, hi, a, firstBlock * EXTENT_BLOCK - start, start, acc)
        for (let k = firstBlock; k < endBlock; k++) {
          const blockFrom = k * EXTENT_BLOCK - start
          const blockTo = blockFrom + EXTENT_BLOCK
          if ((k + 1) * EXTENT_BLOCK - 1 >= lastSeq) {
            scan(lo, hi, blockFrom, blockTo, start, acc)
            continue
          }
          let block = blocks.get(k)
          if (!block) {
            const own: Accumulator = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY, minSeq: -1, maxSeq: -1 }
            scan(lo, hi, blockFrom, blockTo, start, own)
            block = own
            blocks.set(k, block)
          }
          merge(acc, block)
        }
        scan(lo, hi, endBlock * EXTENT_BLOCK - start, b, start, acc)
      }
      // 滑出窗口的块不再用得到：缓存涨到应有的两倍时清掉它们
      if (blocks.size > Math.ceil(n / EXTENT_BLOCK) * 2 + 8) {
        const first = Math.floor(start / EXTENT_BLOCK)
        for (const key of blocks.keys()) {
          if (key < first)
            blocks.delete(key)
        }
      }
      if (acc.minSeq < 0 && acc.maxSeq < 0)
        return null
      return {
        min: acc.minSeq < 0 ? acc.max : acc.min,
        max: acc.maxSeq < 0 ? acc.min : acc.max,
        minAt: (acc.minSeq < 0 ? acc.maxSeq : acc.minSeq) - start,
        maxAt: (acc.maxSeq < 0 ? acc.minSeq : acc.maxSeq) - start,
      }
    },
  })
}
