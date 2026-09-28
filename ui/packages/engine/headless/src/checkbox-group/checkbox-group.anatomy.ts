/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 checkbox group 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// select-all-trigger 是那颗第三态全选格，与 table 的同名部件同物；
// 库里的 trigger 一律指「开合这个组件的那一位」，全选不是开合，故不叫 trigger。
// item-description 是条目文案下方的说明行，card 形态里最常用。
export const checkboxGroupAnatomy = createAnatomy('checkbox-group', [
  'root',
  'label',
  'item',
  'indicator',
  'item-text',
  'item-description',
  'hidden-input',
  'select-all-trigger',
])
