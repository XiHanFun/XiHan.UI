/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 数学函数：绝对值、舍入、平方根与整数次幂。
import type { RoundingMode } from '../decimal'
import type { FunctionEntry } from './entry'
import { absolute, integerPower, roundToPlaces, squareRoot } from '../decimal'
import { Fault } from '../issues'
import { builtin } from './entry'
import { anyNull, integerArg, numberArg } from './helpers'

/** 舍入位数的范围。 */
const PLACES_LIMIT = 64
/** `POWER` 指数绝对值上限。 */
const POWER_LIMIT = 999

function rounding(name: string, mode: RoundingMode): FunctionEntry {
  return builtin(name, ['number', 'places'], 1, 2, (args) => {
    if (anyNull(args))
      return null
    const value = numberArg(args, 0)
    if (value instanceof Fault)
      return value
    const places = args.length > 1 ? integerArg(args, 1, -PLACES_LIMIT, PLACES_LIMIT) : 0
    if (places instanceof Fault)
      return places
    return roundToPlaces(value, places, mode)
  })
}

/** 数学函数。 */
export const MATH_FUNCTIONS: readonly FunctionEntry[] = [
  builtin('ABS', ['number'], 1, 1, (args) => {
    if (anyNull(args))
      return null
    const value = numberArg(args, 0)
    return value instanceof Fault ? value : absolute(value)
  }),
  rounding('ROUND', 'half-up'),
  rounding('FLOOR', 'floor'),
  rounding('CEIL', 'ceil'),
  rounding('TRUNC', 'down'),
  builtin('SQRT', ['number'], 1, 1, (args) => {
    if (anyNull(args))
      return null
    const value = numberArg(args, 0)
    return value instanceof Fault ? value : squareRoot(value)
  }),
  builtin('POWER', ['base', 'exponent'], 2, 2, (args) => {
    if (anyNull(args))
      return null
    const base = numberArg(args, 0)
    if (base instanceof Fault)
      return base
    const power = integerArg(args, 1, -POWER_LIMIT, POWER_LIMIT)
    return power instanceof Fault ? power : integerPower(base, power)
  }),
]
