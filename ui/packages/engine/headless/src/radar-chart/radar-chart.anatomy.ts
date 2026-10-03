/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 radar chart 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// 块级结构由作者摆放：根、标题、图例、视口与绘图区、提示框、空态；绘图区里的网格圈、指标轴、指标名、
// 各系列的面积、轮廓与顶点、准线与焦点环按数据生成。图例项、提示框的行由组件按系列生成。
// 摘要与数据表由根自动生成，视觉隐藏，保证无障碍等价物始终存在。
// defs 里的 pattern 是各系列的纹理，pattern-line 是纹理的线：强制色、打印与环境开启纹理时面积改用它填充。
export const radarChartAnatomy = createAnatomy('radar-chart', [
  'root',
  'caption',
  'legend',
  'legend-item',
  'legend-swatch',
  'legend-label',
  'viewport',
  'plot',
  'defs',
  'pattern',
  'pattern-line',
  'grid-ring',
  'ring-label',
  'spoke',
  'indicator-label',
  'series',
  'area-fill',
  'line',
  'point',
  'crosshair',
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
