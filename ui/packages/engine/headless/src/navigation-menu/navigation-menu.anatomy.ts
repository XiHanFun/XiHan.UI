/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 navigation menu 相关实现。

import type { ItemQuery, Scope } from '@xihan-ui/core'
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
  // 面板里一枝可展开的子级：开关、开关里的展开方向标记、紧跟在开关之后的子级容器
  'branch-trigger',
  'branch-indicator',
  'branch-content',
  'link',
  'indicator',
  'viewport',
])

// 方向键的集合只认 trigger，归属过滤隔开嵌套的另一套导航菜单。
export const navigationMenuTriggerQuery: ItemQuery = { scope: navigationMenuAnatomy.name, part: 'trigger' }

/**
 * 入口、面板与子级之间按 value 逐对互指的 id。连接层写、机器按它反查节点（Escape 的落点、当前页所在的那一枝），
 * 两边必须同一个来源。
 */
export function navigationMenuPartId(scope: Scope, part: 'trigger' | 'content' | 'branch-trigger' | 'branch-content', value: string): string {
  return scope.partId(navigationMenuAnatomy.name, `${part}:${value}`)
}
