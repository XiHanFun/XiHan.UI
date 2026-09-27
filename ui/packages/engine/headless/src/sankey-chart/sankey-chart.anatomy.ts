/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sankey chart 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// 块级结构由作者摆放：根、标题、图例、视口与绘图区、提示框、空态；绘图区里的流带、节点、节点名与焦点环按数据生成，
// 图例项与提示框的行由组件按分组与明细生成。defs 里的 gradient 是 linkColor="gradient" 时每条流带的渐变，
// gradient-stop 是它两端的色标。摘要与数据表由根自动生成，视觉隐藏，保证无障碍等价物始终存在。
export const sankeyChartAnatomy = createAnatomy('sankey-chart', [
  'root',
  'caption',
  'legend',
  'legend-item',
  'legend-swatch',
  'legend-label',
  'viewport',
  'plot',
  'defs',
  'gradient',
  'gradient-stop',
  'link',
  'node',
  'node-label',
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
