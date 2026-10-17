/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 聚合函数：SUM、AVG、COUNT、MIN、MAX。
import type { ExprValue } from '../value'
import type { FunctionEntry, Runtime } from './entry'
import { ExprDate } from '../date'
import { add, divide, ExprNumber, numberFromInteger, ZERO } from '../decimal'
import { Fault } from '../issues'
import { builtin } from './entry'
import { forEachLeaf, typeMismatch } from './helpers'

function sum(args: readonly ExprValue[], runtime: Runtime): { total: ExprNumber, count: number } | Fault {
  let total = ZERO
  let count = 0
  const failed = forEachLeaf(args, runtime, (value, index) => {
    if (!(value instanceof ExprNumber))
      return typeMismatch(index, value)
    const next = add(total, value)
    if (next instanceof Fault)
      return next
    total = next
    count += 1
    return undefined
  })
  return failed ?? { total, count }
}

/* @__NO_SIDE_EFFECTS__ */
function extreme(name: string, direction: 1 | -1): FunctionEntry {
  return builtin(name, ['value'], 1, null, (args, runtime) => {
    let best: ExprNumber | ExprDate | string | null = null
    const failed = forEachLeaf(args, runtime, (value, index) => {
      if (best === null) {
        if (!(value instanceof ExprNumber) && !(value instanceof ExprDate) && typeof value !== 'string')
          return typeMismatch(index, value)
        best = value
        return undefined
      }
      let order: number
      if (best instanceof ExprNumber && value instanceof ExprNumber)
        order = value.compare(best)
      else if (best instanceof ExprDate && value instanceof ExprDate)
        order = value.compare(best)
      else if (typeof best === 'string' && typeof value === 'string')
        order = value < best ? -1 : value > best ? 1 : 0
      else
        return typeMismatch(index, value)
      if (order === direction)
        best = value
      return undefined
    })
    return failed ?? best
  })
}

/** 聚合函数：实参里的列表递归展开，`null` 跳过。 */
export const AGGREGATE_FUNCTIONS: readonly FunctionEntry[] = [
  builtin('SUM', ['value'], 1, null, (args, runtime) => {
    const result = sum(args, runtime)
    return result instanceof Fault ? result : result.total
  }),
  builtin('AVG', ['value'], 1, null, (args, runtime) => {
    const result = sum(args, runtime)
    if (result instanceof Fault)
      return result
    return result.count === 0 ? null : divide(result.total, numberFromInteger(result.count))
  }),
  builtin('COUNT', ['value'], 1, null, (args, runtime) => {
    let count = 0
    const failed = forEachLeaf(args, runtime, () => {
      count += 1
      return undefined
    })
    return failed ?? numberFromInteger(count)
  }),
  extreme('MIN', -1),
  extreme('MAX', 1),
]
