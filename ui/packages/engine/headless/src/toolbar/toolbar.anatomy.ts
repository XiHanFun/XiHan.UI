/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toolbar 相关实现。

import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const toolbarAnatomy = createAnatomy('toolbar', [
  'root',
  'group',
  'item',
  'separator',
])

// 集合只认 item：group 与 separator 虽带 data-scope 但不入导航。
// 分组里的条目照样查得到，queryItems 按最近的 root 归属过滤，只有嵌套的另一条工具条会被切开。
export const toolbarItemQuery: ItemQuery = { scope: toolbarAnatomy.name, part: 'item' }
