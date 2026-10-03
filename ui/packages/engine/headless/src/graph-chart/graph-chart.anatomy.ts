/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 graph chart 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// 块级结构由作者摆放：根、标题、图例、视口与绘图区、提示框、空态；绘图区里的连线、有向时的箭头、节点、节点名与焦点环
// 按数据生成，图例项与提示框的行由组件按分组与明细生成。摘要与数据表由根自动生成，视觉隐藏，保证无障碍等价物始终存在。
export const graphChartAnatomy = createAnatomy('graph-chart', [
  'root',
  'caption',
  'legend',
  'legend-item',
  'legend-swatch',
  'legend-label',
  'viewport',
  'plot',
  'link',
  'arrow',
  'node',
  'node-label',
  'link-label',
  'focus-ring',
  'tooltip',
  'tooltip-header',
  'tooltip-row',
  'tooltip-value',
  'tooltip-name',
  'empty',
  'summary',
  // 视觉隐藏落在包着表格的块级区域上：表格的 block-size 只当最小高度、overflow 对表格不生效，1px 隐藏写在表格上收不住它
  'table-region',
  'table',
])
