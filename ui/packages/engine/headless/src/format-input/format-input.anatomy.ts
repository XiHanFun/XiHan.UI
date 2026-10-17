/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 format input 相关实现。

import { createAnatomy } from '@xihan-ui/core'

export const formatInputAnatomy = createAnatomy('format-input', [
  'root',
  'label',
  // 种类控件的外包：里面是分段切换或下拉
  'kind',
  // 当前种类的参数行，随种类换内容；够宽时自动分栏
  'field-group',
  // 一个参数行，value 是参数名（decimals-mode、decimals、grouping……）
  'item',
  // 分段切换与开关那几行的名字；带标题的控件自己铺标题
  'item-label',
  // 日期模式的占位符说明
  'pattern-description',
  // 样例：role=status，停止输入一会儿后才换
  'preview',
  // 草稿不完整时的行内说明
  'error-text',
])
