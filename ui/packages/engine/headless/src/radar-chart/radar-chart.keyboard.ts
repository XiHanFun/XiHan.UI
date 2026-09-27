/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 radar chart 相关实现。

import type { KeyboardTable } from '../spec/types'

// 绘图区只占一个 Tab 位，进去以后左右键沿顺时针在指标之间走，上下键在同一个指标上换实体；
// 图例是工具条，整体也只占一个 Tab 位。绘图区不随 RTL 镜像：右键始终是顺时针的下一个指标。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/'

export const radarChartKeyboard: KeyboardTable = {
  component: 'radar-chart',
  source: APG,
  rows: [
    { id: 'radar-chart.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: '总是', does: '绘图区只占一个 Tab 位：焦点落到锚点顶点，首次为第一个实体在 12 点方向的指标上；图例同样只占一个 Tab 位' },
    { id: 'radar-chart.kbd.next', keys: ['ArrowRight'], when: '焦点在绘图区', does: '顺时针移到同一个实体的下一个指标（跳过缺失值）；已在最后一个则原地不动' },
    { id: 'radar-chart.kbd.prev', keys: ['ArrowLeft'], when: '焦点在绘图区', does: '逆时针移到上一个指标' },
    { id: 'radar-chart.kbd.series-next', keys: ['ArrowUp'], when: '焦点在绘图区', does: '在同一个指标上换到图例次序的下一个实体，跳过隐藏的实体与缺失值' },
    { id: 'radar-chart.kbd.series-prev', keys: ['ArrowDown'], when: '焦点在绘图区', does: '在同一个指标上换到上一个实体' },
    { id: 'radar-chart.kbd.first', keys: ['Home', 'PageUp'], when: '焦点在绘图区', does: '同一个实体的第一个指标' },
    { id: 'radar-chart.kbd.last', keys: ['End', 'PageDown'], when: '焦点在绘图区', does: '同一个实体的最后一个指标' },
    { id: 'radar-chart.kbd.press', keys: ['Enter', 'Space'], when: '焦点在绘图区', does: '报告聚焦的顶点（onDatumPress）' },
    { id: 'radar-chart.kbd.dismiss', keys: ['Escape'], when: '提示框显示着', does: '收起提示框，焦点留在原处；按键不拦截，外层浮层的关闭仍归它自己' },
    { id: 'radar-chart.kbd.legend-move', keys: ['ArrowLeft', 'ArrowRight', 'Home', 'End'], when: '焦点在图例', does: '在图例项之间移动，左右键跟随文字方向的视觉次序' },
    { id: 'radar-chart.kbd.legend-toggle', keys: ['Enter', 'Space'], when: '焦点在图例项', does: '切换该实体的显隐（原生按钮行为）' },
  ],
}
