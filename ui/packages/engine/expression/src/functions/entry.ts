/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 函数表项与内置函数运行期的类型。
import type { ExprDate } from '../date'
import type { Fault } from '../issues'
import type { Budget, ExprValue } from '../value'

/** 函数签名：规范名（大写）与实参个数范围；`maxArgs` 为 `null` 表示不限。 */
export interface FunctionSignature {
  readonly name: string
  readonly minArgs: number
  readonly maxArgs: number | null
}

/** 内置函数执行时可用的运行期：当前时间、字符串长度上限与求值预算。 */
export interface Runtime extends Budget {
  readonly now: ExprDate | null
  readonly maxStringLength: number
}

/** 函数表里的一项。 */
export interface FunctionEntry extends FunctionSignature {
  readonly invoke: (args: readonly ExprValue[], runtime: Runtime) => ExprValue | Fault
}

/** 定义一项内置函数。 */
export function builtin(name: string, minArgs: number, maxArgs: number | null, invoke: FunctionEntry['invoke']): FunctionEntry {
  return Object.freeze({ name, minArgs, maxArgs, invoke })
}
