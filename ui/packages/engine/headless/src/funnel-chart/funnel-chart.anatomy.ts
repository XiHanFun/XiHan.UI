/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 funnel chart 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// 块级结构由作者摆放：根、标题、视口与绘图区、提示框、空态；绘图区里的阶段、阶段标签、转化率与焦点环按数据生成。
// 阶段取有序色阶，名字直接标在阶段上，没有图例。提示框的行由组件按阶段生成。
// 摘要与数据表由根自动生成，视觉隐藏，保证无障碍等价物始终存在。
export const funnelChartAnatomy = createAnatomy('funnel-chart', [
  'root',
  'caption',
  'viewport',
  'plot',
  'stage',
  'stage-label',
  'conversion',
  'focus-ring',
  'tooltip',
  'tooltip-header',
  'tooltip-row',
  'tooltip-swatch',
  'tooltip-value',
  'tooltip-name',
  'empty',
  'summary',
  // 视觉隐藏落在包着表格的块级区域上：表格的 block-size 只当最小高度、overflow 对表格不生效，1px 隐藏写在表格上收不住它
  'table-region',
  'table',
])
