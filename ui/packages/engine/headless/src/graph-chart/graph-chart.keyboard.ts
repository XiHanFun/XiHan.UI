/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 graph chart 相关实现。

import type { KeyboardTable } from '../spec/types'

// 绘图区只占一个 Tab 位，焦点只落在节点上：方向键朝那个方向左右各 45° 的锥形里找离得近、偏得少的节点；
// Home / End 到阅读序的头尾（树是深度优先的先序，其余按分组再按名字）。图例是工具条，整体也只占一个 Tab 位。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/'

export const graphChartKeyboard: KeyboardTable = {
  component: 'graph-chart',
  source: APG,
  rows: [
    { id: 'graph-chart.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: '总是', does: '绘图区只占一个 Tab 位：焦点落到锚点节点，首次为阅读序的第一个节点；图例同样只占一个 Tab 位' },
    { id: 'graph-chart.kbd.move', keys: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'], when: '焦点在绘图区', does: '朝这个方向左右各 45° 的锥形里，离得近、偏得少的节点；锥形里没有节点时原地不动' },
    { id: 'graph-chart.kbd.first', keys: ['Home'], when: '焦点在绘图区', does: '阅读序的第一个节点' },
    { id: 'graph-chart.kbd.last', keys: ['End'], when: '焦点在绘图区', does: '阅读序的最后一个节点' },
    { id: 'graph-chart.kbd.press', keys: ['Enter', 'Space'], when: '焦点在绘图区', does: '报告聚焦的节点（onDatumPress）' },
    { id: 'graph-chart.kbd.zoom', keys: ['+', '-', '0'], when: 'zoom 开着、焦点在绘图区', does: '以绘图区中心放大、缩小一档；0 回到不缩放、不平移' },
    { id: 'graph-chart.kbd.dismiss', keys: ['Escape'], when: '提示框显示着', does: '收起提示框，焦点留在原处；按键不拦截，外层浮层的关闭仍归它自己' },
    { id: 'graph-chart.kbd.legend-move', keys: ['ArrowLeft', 'ArrowRight', 'Home', 'End'], when: '焦点在图例', does: '在图例项之间移动，左右键跟随文字方向的视觉次序' },
    { id: 'graph-chart.kbd.legend-toggle', keys: ['Enter', 'Space'], when: '焦点在图例项', does: '切换该分组的显隐（原生按钮行为）' },
  ],
}
