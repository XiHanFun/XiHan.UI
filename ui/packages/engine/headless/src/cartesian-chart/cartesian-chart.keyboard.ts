/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 cartesian chart 相关实现。

import type { KeyboardTable } from '../spec/types'

// 绘图区只占一个 Tab 位，进去以后方向键在数据之间走；图例是工具条，整体也只占一个 Tab 位。
// 以 vertical 为例，horizontal 时两对方向键互换职责。绘图区不随 RTL 镜像，左键始终向左；
// 图例随文字方向镜像，左右键跟随视觉次序。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/'

export const cartesianChartKeyboard: KeyboardTable = {
  component: 'cartesian-chart',
  source: APG,
  rows: [
    { id: 'cartesian-chart.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: '总是', does: '绘图区只占一个 Tab 位：焦点落到锚点数据，首次为第一个可见系列的第一个数据；图例同样只占一个 Tab 位' },
    { id: 'cartesian-chart.kbd.next', keys: ['ArrowRight'], when: '焦点在绘图区', does: '沿自变量方向移到下一个键（跳过缺失值）；horizontal 时由 ArrowDown 承担；已在末尾则原地不动' },
    { id: 'cartesian-chart.kbd.prev', keys: ['ArrowLeft'], when: '焦点在绘图区', does: '沿自变量方向移到上一个键；horizontal 时由 ArrowUp 承担' },
    { id: 'cartesian-chart.kbd.series-next', keys: ['ArrowUp'], when: '焦点在绘图区', does: '在同一个键上换到视觉次序的下一个系列（堆叠自下而上、分组自左而右），跳过隐藏系列与缺失值；horizontal 时由 ArrowRight 承担' },
    { id: 'cartesian-chart.kbd.series-prev', keys: ['ArrowDown'], when: '焦点在绘图区', does: '在同一个键上换到上一个系列；horizontal 时由 ArrowLeft 承担' },
    { id: 'cartesian-chart.kbd.first', keys: ['Home'], when: '焦点在绘图区', does: '当前系列的第一个数据' },
    { id: 'cartesian-chart.kbd.last', keys: ['End'], when: '焦点在绘图区', does: '当前系列的最后一个数据' },
    { id: 'cartesian-chart.kbd.page', keys: ['PageUp', 'PageDown'], when: '焦点在绘图区', does: '跨 10% 的键，至少 1 个' },
    { id: 'cartesian-chart.kbd.press', keys: ['Enter', 'Space'], when: '焦点在绘图区', does: '报告聚焦的数据（onDatumPress）' },
    { id: 'cartesian-chart.kbd.dismiss', keys: ['Escape'], when: '提示框显示着', does: '收起提示框，焦点留在原处；按键不拦截，外层浮层的关闭仍归它自己' },
    { id: 'cartesian-chart.kbd.legend-move', keys: ['ArrowLeft', 'ArrowRight', 'Home', 'End'], when: '焦点在图例', does: '在图例项之间移动，左右键跟随文字方向的视觉次序' },
    { id: 'cartesian-chart.kbd.legend-toggle', keys: ['Enter', 'Space'], when: '焦点在图例项', does: '切换该系列的显隐（原生按钮行为）' },
  ],
}
