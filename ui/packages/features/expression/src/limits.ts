/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/** 解析、检查与求值的上限缺省值。 */
export const DEFAULT_LIMITS = Object.freeze({
  /** 源码长度上限（UTF-16 码元）。 */
  maxLength: 10_000,
  /** 语法树深度与求值嵌套深度上限。 */
  maxDepth: 100,
  /** 求值步数上限：每个节点计一步，遍历列表时每个元素再计一步。 */
  maxSteps: 100_000,
  /** 字符串结果长度上限（UTF-16 码元）。 */
  maxStringLength: 100_000,
})

/** 读取一个正整数上限选项；不是正整数时抛 `TypeError`。 */
export function readLimit(value: number | undefined, fallback: number, name: string): number {
  if (value === undefined)
    return fallback
  if (!Number.isSafeInteger(value) || value <= 0)
    throw new TypeError(`${name} 必须是正整数`)
  return value
}
