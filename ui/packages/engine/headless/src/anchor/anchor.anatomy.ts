/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 anchor 相关实现。

import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

export const anchorAnatomy = createAnatomy('anchor', [
  'root',
  'list',
  'item',
  'link',
  // 链接里承载文字的那一层。作者在链接里另塞图标时，省略号只该裁文字这一段
  'link-text',
  'indicator',
])

// 滚动结算与指示条定位的查询集合，只认 link
export const anchorItemQuery: ItemQuery = { scope: anchorAnatomy.name, part: 'link' }
