/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 组合框的内置过滤：给了 filter 就按用户打的检索词裁 collection，连接层与状态机都经它取当下的候选。
//
// 检索词不是输入框里的字：选中后输入框回显选中项的文字、内联补全把输入框补成首个候选的整段文字，
// 拿它们去筛会把列表收得只剩一条。机器另记一份「用户打的字」，选中、提交、清空、失焦对齐时清掉。

import type { ComboboxFilter, ComboboxFilterMode, ComboboxNode } from './combobox.types'

const labelOf = (node: ComboboxNode): string => (node.label ?? node.value).toLowerCase()

const MATCHERS: Readonly<Record<ComboboxFilterMode, ComboboxFilter>> = {
  contains: (node, query) => labelOf(node).includes(query.toLowerCase()),
  startsWith: (node, query) => labelOf(node).startsWith(query.toLowerCase()),
}

/** 当下拿去筛候选的检索词：输入框被清空时一并作废，其余时候就是用户打的那段字。 */
export function comboboxFilterQuery(inputValue: string, typed: string): string {
  return inputValue === '' ? '' : typed
}

/**
 * 按检索词筛候选。没给 filter、或检索词 trim 后为空时原样返回；保持 collection 原序。
 * contains / startsWith 按显示文本（label，缺省回退 value）比，不分大小写；自定义函数拿到的检索词已 trim。
 */
export function filterComboboxNodes(
  nodes: readonly ComboboxNode[],
  query: string,
  filter: ComboboxFilterMode | ComboboxFilter | undefined,
): readonly ComboboxNode[] {
  const q = query.trim()
  if (filter === undefined || q === '')
    return nodes
  // 只认表里自己的键：'toString' 这类原型链上的名字不算口径
  const match = typeof filter === 'function' ? filter : Object.hasOwn(MATCHERS, filter) ? MATCHERS[filter] : undefined
  if (!match)
    throw new TypeError(`[xh] Combobox 的 filter 只认 'contains'、'startsWith' 或一个函数，收到 ${String(filter)}`)
  return nodes.filter(node => match(node, q))
}
