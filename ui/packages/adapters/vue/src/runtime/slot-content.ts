/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 slot content 相关实现。

import type { VNode } from 'vue'
import { Comment, Fragment, Text } from 'vue'

/**
 * 插槽产出中是否有真正会渲染出内容的节点。
 *
 * 只看数组长度会判错：`v-if` 为假时假分支仍留下一个注释节点，空的 `v-for` 留下一个没有子节点的片段，
 * 模板中的换行与缩进留下纯空白文本节点：三者都占据数组的位置，但不渲染任何像素。
 * 因此逐个节点检查类型，片段递归到底。
 *
 * 与 field 的 attributable 判断的不是同一件事：那边筛选能挂属性的节点，纯文本一律滤除；
 * 这边判断是否有内容，非空文本算内容。两者不能互相替代。
 */
export function slotPaints(nodes: readonly VNode[] | undefined): boolean {
  return paints(nodes)
}

/**
 * 插槽产出是否只有纯文本。
 *
 * 注释与空白文本节点一律跳过：它们是模板换行与假分支留下的，不影响判断；
 * 片段递归到底。有一个元素节点就不算纯文本。
 *
 * 用它决定是否替作者补一层承载节点：作者写的是一段文字时，包一层才能应用该层的规则；
 * 作者自己写了节点则一律不动。
 */
export function slotIsPlainText(nodes: readonly VNode[] | undefined): boolean {
  return paints(nodes) && textual(nodes)
}

function textual(nodes: readonly VNode[] | undefined): boolean {
  return (nodes ?? []).every((node) => {
    if (node.type === Comment || node.type === Text)
      return true
    if (node.type === Fragment)
      return !Array.isArray(node.children) || textual(node.children as VNode[])
    return false
  })
}

function paints(nodes: readonly VNode[] | undefined): boolean {
  return nodes?.some((node) => {
    if (node.type === Comment)
      return false
    if (node.type === Text)
      return String(node.children ?? '').trim() !== ''
    if (node.type === Fragment)
      return Array.isArray(node.children) && slotPaints(node.children as VNode[])
    return true
  }) ?? false
}
