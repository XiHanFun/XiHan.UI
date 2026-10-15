/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 json viewer 相关实现。

import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// toolbar 起的七个是内建工具条：条本身、五颗钮与复制成功的播报区，只在 tools 打开时铺出。
export const jsonViewerAnatomy = createAnatomy('json-viewer', [
  'root',
  'tree',
  'item',
  'item-key',
  'item-value',
  'branch',
  'branch-control',
  'branch-trigger',
  'branch-indicator',
  'branch-text',
  // 分支的可及名字（根行的称呼、收起时的成员数），视觉隐藏，由组件自己铺
  'branch-summary',
  'branch-content',
  'preview',
  'text',
  // 原文档里有类别的一段（键名、标量、标点）
  'token',
  'empty',
  'mark',
  'toolbar',
  'expand-trigger',
  'wrap-trigger',
  'copy-trigger',
  'view-trigger',
  'status',
])

/**
 * 叶子行与分支行都是 role=treeitem、都自报 data-value，因此两类都要进导航集合：
 * item 装标量值，branch 装对象与数组。
 * queryItems 按最近的 tree 部件归属过滤，中间隔多少层 branch-content 都不影响。
 */
export const jsonViewerItemQuery: ItemQuery = { scope: jsonViewerAnatomy.name, part: 'item' }
export const jsonViewerBranchQuery: ItemQuery = { scope: jsonViewerAnatomy.name, part: 'branch' }
