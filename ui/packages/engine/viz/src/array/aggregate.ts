/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 流式聚合：逐个收值，最后给出 sum、avg、count、min、max 或 distinctCount。

import type { CollateOptions } from './mixed'
import { invalidArgument } from '../errors'
import { compareMixed, isMissing, valueKey } from './mixed'
import { CompensatedSum, isPresent } from './statistics'

/** 聚合方式。 */
export type AggregateKind = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinctCount'

/** 全部聚合方式。 */
export const AGGREGATE_KINDS: readonly AggregateKind[] = Object.freeze(['sum', 'avg', 'count', 'min', 'max', 'distinctCount'])

/** 逐个收值、随时可取结果的累加器。 */
export interface Accumulator {
  readonly add: (value: unknown) => void
  readonly result: () => unknown
}

function sumAccumulator(average: boolean): Accumulator {
  const adder = new CompensatedSum()
  let count = 0
  return {
    add(value) {
      if (!isPresent(value))
        return
      adder.add(value)
      count++
    },
    result: () => (count === 0 ? null : average ? adder.valueOf() / count : adder.valueOf()),
  }
}

function countAccumulator(): Accumulator {
  let count = 0
  return {
    add(value) {
      if (!isMissing(value))
        count++
    },
    result: () => count,
  }
}

function extremeAccumulator(direction: 1 | -1, options: CollateOptions): Accumulator {
  let best: unknown = null
  let seen = false
  return {
    add(value) {
      if (isMissing(value))
        return
      if (!seen || compareMixed(value, best, options) * direction > 0) {
        best = value
        seen = true
      }
    },
    result: () => best,
  }
}

function distinctAccumulator(): Accumulator {
  const keys = new Set<string>()
  return {
    add(value) {
      if (!isMissing(value))
        keys.add(valueKey(value))
    },
    result: () => keys.size,
  }
}

/**
 * 按聚合方式建累加器。
 * - sum / avg 只收数值（含 Infinity），缺失值与非数值跳过；一个数值都没有时结果为 null。求和用补偿求和，与 `sum`、`mean` 结果相同。
 * - count 数非缺失值；distinctCount 数不同的非缺失值（按 `valueKey` 判同）；没有值时为 0。
 * - min / max 按 `compareMixed` 在非缺失值里取，可用于数值、日期与字符串；没有值时为 null。
 */
export function createAccumulator(kind: AggregateKind, options: CollateOptions = {}): Accumulator {
  switch (kind) {
    case 'sum':
      return sumAccumulator(false)
    case 'avg':
      return sumAccumulator(true)
    case 'count':
      return countAccumulator()
    case 'min':
      return extremeAccumulator(-1, options)
    case 'max':
      return extremeAccumulator(1, options)
    case 'distinctCount':
      return distinctAccumulator()
    default:
      throw invalidArgument('未知的聚合方式', { kind })
  }
}

/** 一组值的聚合结果，规则同 `createAccumulator`。 */
export function aggregate(kind: AggregateKind, values: Iterable<unknown>, options: CollateOptions = {}): unknown {
  const accumulator = createAccumulator(kind, options)
  for (const value of values)
    accumulator.add(value)
  return accumulator.result()
}
