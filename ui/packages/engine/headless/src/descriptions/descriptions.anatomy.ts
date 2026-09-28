/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 descriptions 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// header / title / extra 是列表之前的头部：根常写成 dl，dl 的子节点只能是成对的 dt / dd，头部因此排在根之外
export const descriptionsAnatomy = createAnatomy('descriptions', [
  'root',
  'header',
  'title',
  'extra',
  'item',
  'label',
  'value',
])
