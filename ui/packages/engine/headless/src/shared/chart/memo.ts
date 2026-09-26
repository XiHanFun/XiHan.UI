/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 管线分段记忆：每一段只记住上一次的输入与结果，输入逐个引用相同就直接复用。

/**
 * 单槽记忆。悬停、聚焦与提示框开合只改状态属性，不换任何一段的输入，于是整条管线都走缓存；
 * 数据或尺寸换了，只有依赖它的那几段重算。参数用 Object.is 逐个比较，对象按引用。
 */
export function memoizeLast<A extends readonly unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  let last: { args: A, result: R } | null = null
  return (...args: A): R => {
    if (last && last.args.length === args.length && last.args.every((value, i) => Object.is(value, args[i])))
      return last.result
    const result = fn(...args)
    last = { args, result }
    return result
  }
}
