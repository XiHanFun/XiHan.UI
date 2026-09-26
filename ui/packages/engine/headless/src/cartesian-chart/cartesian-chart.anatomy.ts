/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 cartesian chart 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// 块级结构由作者摆放：根、标题、图例、视口与绘图区、提示框、空态；绘图区里的网格、坐标轴、系列、
// 准线与焦点环按数据生成。图例项、提示框的行由组件按系列生成。摘要与数据表由根自动生成，
// 视觉隐藏，保证无障碍等价物始终存在。
// dot 是折线上逐点画出的小圆（只给眼睛看）；point 是散点的点，以及折线上激活数据的那一个点（键盘聚焦时它就是焦点代理）。
// data-label、total-label 与 end-label 是数据标签、堆叠合计与线尾标签，写在前景层，只给眼睛看；
// 线尾标签被推开时，leader-line 把它连回线尾。
// defs 里的 pattern 是各系列的纹理，pattern-line 是纹理的线：强制色、打印与环境开启纹理时柱与面积改用它填充。
// legend-scale 是按值着色时图例末尾的色阶：名字、低端的值、渐变条、高端的值。
// annotation 是注释（参考线、参考带、标出的点、平均线、趋势线），annotation-label 是它的标签，都只给眼睛看。
export const cartesianChartAnatomy = createAnatomy('cartesian-chart', [
  'root',
  'caption',
  'legend',
  'legend-item',
  'legend-swatch',
  'legend-label',
  'legend-scale',
  'legend-scale-name',
  'legend-scale-bar',
  'legend-scale-value',
  'viewport',
  'plot',
  'defs',
  'pattern',
  'pattern-line',
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
  'leader-line',
  'annotation',
  'annotation-label',
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
