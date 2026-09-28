/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 radio group 相关实现。

import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// item-icon 是条目文字前的图标位，纯装饰，对读屏隐藏。
// item-description 是条目文案下方的说明行，card 形态里最常用。
// indicator 是条目行首的单选圆圈；thumb 是 segmented 形态里那块会滑动的选中标记，整组一份。
export const radioGroupAnatomy = createAnatomy('radio-group', [
  'root',
  'label',
  'thumb',
  'item',
  'item-icon',
  'item-text',
  'item-description',
  'indicator',
  'hidden-input',
])

// 方向键导航与滑块量测共用的条目集合，只认 item；归属过滤保证嵌套的两组互不吞并
export const radioGroupItemQuery: ItemQuery = { scope: radioGroupAnatomy.name, part: 'item' }
