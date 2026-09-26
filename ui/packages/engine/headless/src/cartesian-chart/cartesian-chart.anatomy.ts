/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 cartesian chart 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// 块级结构由作者摆放：根、标题、图例、视口与绘图区、提示框、空态；绘图区里的网格、坐标轴、系列、
// 准线与焦点环按数据生成。图例项、提示框的行由组件按系列生成。摘要与数据表由根自动生成，
// 视觉隐藏，保证无障碍等价物始终存在。
// dot 是折线上逐点画出的小圆（只给眼睛看）；point 是激活数据上那一个点，键盘聚焦时它就是焦点代理。
// data-label、total-label 与 end-label 是数据标签、堆叠合计与线尾标签，写在前景层，只给眼睛看。
export const cartesianChartAnatomy = createAnatomy('cartesian-chart', [
  'root',
  'caption',
  'legend',
  'legend-item',
  'legend-swatch',
  'legend-label',
  'viewport',
  'plot',
  'grid',
  'grid-line',
  'axis',
  'axis-line',
  'tick',
  'tick-label',
  'axis-title',
  'series',
  'bar',
  'line',
  'area-fill',
  'dot',
  'point',
  'data-label',
  'total-label',
  'end-label',
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
  'table',
])
