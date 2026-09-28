/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 浮层内搜索：按检索词把树裁成只剩命中的那几枝。裁剪本身是与 SideNav 共用的树形检索，这里只接上本组件的节点类型与开关。

import type { TreeSearchView } from '../shared/tree-search'
import type { TreeSelectFilter, TreeSelectNode } from './tree-select.types'
import { filterTreeNodes, matchTreeNodeLabel, resolveTreeSearch } from '../shared/tree-search'

/** 缺省匹配规则：标签（缺省退回值）大小写不敏感包含。 */
export const defaultTreeSelectFilter: TreeSelectFilter = matchTreeNodeLabel

export type TreeSelectSearchView = TreeSearchView<TreeSelectNode>

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
  return filterTreeNodes(nodes, query, match)
}

/** 当前是否处于搜索视图：开了 searchable 且检索词 trim 后非空时给出裁剪后的树，否则为 null。 */
export function resolveTreeSelectSearch(
  nodes: readonly TreeSelectNode[],
  options: { searchable: boolean, inputValue: string, filter: TreeSelectFilter | undefined },
): TreeSelectSearchView | null {
  if (!options.searchable)
    return null
  return resolveTreeSearch(nodes, options.inputValue, options.filter ?? defaultTreeSelectFilter)
}
