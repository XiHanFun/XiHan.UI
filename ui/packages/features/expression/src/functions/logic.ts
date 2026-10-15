/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 逻辑与空值函数：IF、COALESCE、ISBLANK。
import type { FunctionEntry } from './entry'
import { ExprList } from '../value'
import { builtin } from './entry'
import { typeMismatch } from './helpers'

/** `IF` 的表项；求值器按惰性规则执行它，只求所选分支。 */
export const IF_ENTRY: FunctionEntry = builtin('IF', 2, 3, (args) => {
  const [test = null, consequent = null, alternate = null] = args
  if (test !== null && typeof test !== 'boolean')
    return typeMismatch(0, test)
  return test === true ? consequent : alternate
})

/** 逻辑与空值函数。 */
export const LOGIC_FUNCTIONS: readonly FunctionEntry[] = [
  IF_ENTRY,
  builtin('COALESCE', 1, null, args => args.find(value => value !== null) ?? null),
  builtin('ISBLANK', 1, 1, (args) => {
    const value = args[0]!
    return value === null || value === '' || (value instanceof ExprList && value.length === 0)
  }),
]
