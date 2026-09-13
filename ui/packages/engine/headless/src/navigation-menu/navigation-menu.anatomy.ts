/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 navigation menu 相关实现。

import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const navigationMenuAnatomy = createAnatomy('navigation-menu', [
  'root',
  'list',
  'item',
  'trigger',
  // 入口里表示"底下还有一张面板"的标记，皮肤按 data-state 转向
  'trigger-indicator',
  'content',
  'link',
  'indicator',
  'viewport',
])

// 方向键的集合只认 trigger，归属过滤隔开嵌套的另一套导航菜单。
export const navigationMenuTriggerQuery: ItemQuery = { scope: navigationMenuAnatomy.name, part: 'trigger' }
