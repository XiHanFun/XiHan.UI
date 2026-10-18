/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 属性面板里问题的归属：一条错误按路径段归到路径最长、又是它前缀的那一行，路径改成相对那一行的属性。

import type { JsonPath } from '@xihan-ui/core/json'
import type { PropertyIssue } from '@xihan-ui/designer-kit/properties'
import { isJsonPathPrefix } from '@xihan-ui/core/json'

/** 两条路径按段比较：数字段按数值、排在字符串段前，字符串段按码点；前面各段相同时短的在前。 */
export function compareJsonPaths(a: JsonPath, b: JsonPath): number {
  const length = Math.min(a.length, b.length)
  for (let index = 0; index < length; index++) {
    const left = a[index]!
    const right = b[index]!
    if (left === right)
      continue
    if (typeof left === 'number' && typeof right === 'number')
      return left - right
    if (typeof left === 'number')
      return -1
    if (typeof right === 'number')
      return 1
    return left < right ? -1 : 1
  }
  return a.length - b.length
}

/**
 * 落在 path 这一行的问题：错误的路径按段以 path 开头，并且 rowPaths 里没有更长的一行也是它的前缀。
 * 路径改成相对 path，按路径排，同一路径只留先出现的一条。
 */
export function propertyIssuesAt(path: JsonPath, rowPaths: readonly JsonPath[], errors: readonly { readonly path: JsonPath, readonly message: string }[]): PropertyIssue[] {
  const issues = new Map<string, PropertyIssue>()
  for (const error of errors) {
    if (!isJsonPathPrefix(error.path, path))
      continue
    if (rowPaths.some(other => other.length > path.length && isJsonPathPrefix(error.path, other)))
      continue
    const relative = error.path.slice(path.length)
    const key = JSON.stringify(relative)
    if (!issues.has(key))
      issues.set(key, { path: relative, message: error.message })
  }
  return [...issues.values()].sort((a, b) => compareJsonPaths(a.path, b.path))
}
