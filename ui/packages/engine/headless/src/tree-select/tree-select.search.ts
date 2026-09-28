/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 浮层内搜索的纯运算：按检索词把树裁成只剩命中的那几枝。不碰 DOM、不看状态机。

import type { TreeSelectFilter, TreeSelectNode } from './tree-select.types'

/** 缺省匹配规则：标签（缺省退回值）大小写不敏感包含。 */
export const defaultTreeSelectFilter: TreeSelectFilter = (node, query) =>
  (node.label ?? node.value).toLowerCase().includes(query.toLowerCase())

export interface TreeSelectSearchView {
  /** 裁剪后的树：命中的节点连同整棵子树留下；没命中但有子孙命中的分支只留命中的那几枝。 */
  nodes: TreeSelectNode[]
  /** 因子孙命中而留下的分支：搜索视图里缺省展开它们，命中的节点一眼就看得到。 */
  expanded: string[]
}

/**
 * 按检索词裁剪树。query 传入前已 trim 且非空。
 * 命中的节点整枝留下（它的子节点多半也是要找的东西）；没命中的分支若有子孙命中，只留命中的那几枝并展开；
 * 一枝都不剩的节点整个去掉。尚未取回子项的懒分支只按自己判定。
 */
export function filterTreeSelectNodes(
  nodes: readonly TreeSelectNode[],
  query: string,
  match: TreeSelectFilter,
): TreeSelectSearchView {
  const expanded: string[] = []
  const walk = (list: readonly TreeSelectNode[]): TreeSelectNode[] => {
    const out: TreeSelectNode[] = []
    for (const node of list) {
      if (match(node, query)) {
        out.push(node)
        continue
      }
      const children = node.children ? walk(node.children) : []
      if (children.length > 0) {
        out.push({ ...node, children })
        expanded.push(node.value)
      }
    }
    return out
  }
  return { nodes: walk(nodes), expanded }
}

/** 当前是否处于搜索视图：开了 searchable 且检索词 trim 后非空时给出裁剪后的树，否则为 null。 */
export function resolveTreeSelectSearch(
  nodes: readonly TreeSelectNode[],
  options: { searchable: boolean, inputValue: string, filter: TreeSelectFilter | undefined },
): TreeSelectSearchView | null {
  const query = options.inputValue.trim()
  if (!options.searchable || query === '')
    return null
  return filterTreeSelectNodes(nodes, query, options.filter ?? defaultTreeSelectFilter)
}
