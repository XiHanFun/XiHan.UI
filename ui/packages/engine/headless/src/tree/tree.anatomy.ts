/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tree 相关实现。

import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const treeAnatomy = createAnatomy('tree', [
  'root',
  'label',
  'tree',
  'item',
  'item-checkbox',
  'item-indicator',
  'item-text',
  'branch',
  'branch-checkbox',
  'branch-control',
  'branch-trigger',
  'branch-indicator',
  'branch-text',
  'branch-content',
  'node-drag-trigger',
  'empty',
  'loading',
  'live-region',
])

/**
 * 两类节点部件都是 role=treeitem、都自报 data-value，因此都要进导航集合：
 * item 是叶子，branch 是分支。
 * queryItems 按最近的 tree 部件归属过滤，中间隔多少层 branch 都不影响，只有嵌套的另一棵 tree 会被切开。
 */
export const treeItemQuery: ItemQuery = { scope: treeAnatomy.name, part: 'item' }
export const treeBranchQuery: ItemQuery = { scope: treeAnatomy.name, part: 'branch' }
