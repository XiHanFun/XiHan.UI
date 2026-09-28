/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 侧栏搜索：按检索词把导航树裁成只剩命中的那几枝。裁剪是与 TreeSelect 共用的树形检索，这里只接上侧栏的节点类型与暂停条件。

import type { TreeSearchView } from '../shared/tree-search'
import type { SideNavFilter, SideNavNode } from './side-nav.types'
import { matchTreeNodeLabel, resolveTreeSearch } from '../shared/tree-search'

/** 缺省匹配规则：标签（缺省退回 value）大小写不敏感包含。 */
const defaultSideNavFilter: SideNavFilter = matchTreeNodeLabel

/**
 * 此刻的搜索视图：检索词 trim 后非空时给出裁剪后的树，否则为 null。
 * 排布落成图标栏时同样为 null：图标栏里只剩顶层一列、搜索框也让了位，过滤暂停，展开回来接着按原词过滤。
 */
export function resolveSideNavSearch(
  collection: readonly SideNavNode[],
  options: { inputValue: string, filter: SideNavFilter | undefined, railed: boolean },
): TreeSearchView<SideNavNode> | null {
  if (options.railed)
    return null
  return resolveTreeSearch(collection, options.inputValue, options.filter ?? defaultSideNavFilter)
}

/** 是否正处于搜索视图；动作只关心往哪一份展开集合里写，不必把整棵树裁一遍。 */
export function isSideNavSearching(inputValue: string, railed: boolean): boolean {
  return !railed && inputValue.trim() !== ''
}
