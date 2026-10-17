/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 函数表项与内置函数运行期的类型。
import type { ExprDate } from '../date'
import type { Fault } from '../issues'
import type { Budget, ExprValue } from '../value'

/**
 * 函数签名：规范名（大写）、实参个数范围与参数名。
 * - `maxArgs` 为 `null` 表示不限。
 * - `params` 是参数的英文键（如 `condition`），显示文字由界面按键取；个数等于 `maxArgs`，不限时等于 `max(minArgs, 1)`，最后一个表示可重复。
 *   宿主函数没给参数名时为空数组。
 */
export interface FunctionSignature {
  readonly name: string
  readonly minArgs: number
  readonly maxArgs: number | null
  readonly params: readonly string[]
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
/* @__NO_SIDE_EFFECTS__ */
export function builtin(name: string, params: readonly string[], minArgs: number, maxArgs: number | null, invoke: FunctionEntry['invoke']): FunctionEntry {
  return Object.freeze({ name, params: Object.freeze([...params]), minArgs, maxArgs, invoke })
}

/** 参数名应有的个数：`maxArgs` 有限时等于它，不限时等于 `max(minArgs, 1)`。 */
export function paramCount(minArgs: number, maxArgs: number | null): number {
  return maxArgs ?? Math.max(minArgs, 1)
}
