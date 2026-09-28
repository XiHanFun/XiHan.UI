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
  // 可关闭标签的关闭钮：紧跟在所属 trigger 之后、与它平级（不嵌进 role=tab 的按钮里），鼠标与触屏专用
  'close-trigger',
  // 选中标签下的那条滑条：主轴位置与长度由机器量好写成内联样式
  'indicator',
  // 标签之间的细分隔线，纯装饰
  'separator',
  // 标签带放不下时的前后翻页钮：贴在标签带两端，只在溢出时显示，鼠标专用（键盘用方向键、焦点自带滚动）
  'prev-trigger',
  'next-trigger',
  // 标签带之后的「更多」钮：放不下时露面，弹出的下拉列出可见区外的标签；在 tablist 之外、自占一个 Tab 位
  'overflow-trigger',
  'content',
  'tab-drag-trigger',
  'live-region',
])

// 指示条量测的查询集合，只认 trigger
export const tabsTriggerQuery: ItemQuery = { scope: tabsAnatomy.name, part: 'trigger' }

/** 「更多」钮：它是 root 的孩子、不在 list 里，按最近的 root 归属过滤，嵌套的另一组标签页里的不算。 */
export const tabsOverflowTriggerQuery: ItemQuery = { scope: tabsAnatomy.name, part: 'overflow-trigger' }
