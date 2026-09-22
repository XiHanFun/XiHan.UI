/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tabs 相关实现。

import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

export const tabsAnatomy = createAnatomy('tabs', [
  'root',
  'list',
  'trigger',
  // 选中标签下的那条滑条：主轴位置与长度由机器量好写成内联样式
  'indicator',
  // 标签之间的细分隔线，纯装饰
  'separator',
  // 标签带放不下时的前后翻页钮：贴在标签带两端，只在溢出时显示，鼠标专用（键盘用方向键、焦点自带滚动）
  'prev-trigger',
  'next-trigger',
  'content',
  'tab-drag-trigger',
  'live-region',
])

// 指示条量测的查询集合，只认 trigger
export const tabsTriggerQuery: ItemQuery = { scope: tabsAnatomy.name, part: 'trigger' }
