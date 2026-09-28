/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 hierarchy chart 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// 块级结构由作者摆放：根、标题、下钻路径、图例、视口与绘图区、提示框、空态；路径上的项、图例里的色阶、
// 绘图区里的节点、节点名、分组标题与焦点环按数据生成。摘要与数据表由根自动生成，视觉隐藏，保证无障碍等价物始终存在。
// legend-scale 是按值着色时每个看得见的层一条的色阶：名字、低端的值、渐变条、高端的值。
export const hierarchyChartAnatomy = createAnatomy('hierarchy-chart', [
  'root',
  'caption',
  'path',
  'path-item',
  'legend',
  'legend-scale',
  'legend-scale-name',
  'legend-scale-bar',
  'legend-scale-value',
  'viewport',
  'plot',
  'node',
  'node-label',
  'group-header',
  'focus-ring',
  'tooltip',
  'tooltip-header',
  'tooltip-row',
  'tooltip-swatch',
  'tooltip-value',
  'tooltip-name',
  'empty',
  'summary',
  'table',
])
