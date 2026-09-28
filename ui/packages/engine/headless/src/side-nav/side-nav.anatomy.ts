/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 side nav 相关实现。

import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// input 是排在 list 之前的搜索框，empty 是排在 list 之后、搜索一条都没命中时露面的占位，两者都可缺省。
export const sideNavAnatomy = createAnatomy('side-nav', [
  'root',
  'input',
  'list',
  'item',
  'group',
  'group-label',
  'branch',
  'branch-trigger',
  'branch-text',
  'branch-indicator',
  'positioner',
  'branch-content',
  'link',
  'link-text',
  'empty',
])

// 方向键的集合由分支行与链接共同组成，归属过滤隔开嵌套的另一套侧栏。
export const sideNavTriggerQuery: ItemQuery = { scope: sideNavAnatomy.name, part: 'branch-trigger' }
export const sideNavLinkQuery: ItemQuery = { scope: sideNavAnatomy.name, part: 'link' }
