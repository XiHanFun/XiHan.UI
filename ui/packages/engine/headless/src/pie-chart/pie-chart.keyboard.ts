/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 pie chart 相关实现。

import type { KeyboardTable } from '../spec/types'

// 绘图区只占一个 Tab 位，进去以后方向键沿顺时针在扇区之间走；图例是工具条，整体也只占一个 Tab 位。
// 绘图区不随 RTL 镜像：右键与下键始终是顺时针的下一个扇区。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/'

export const pieChartKeyboard: KeyboardTable = {
  component: 'pie-chart',
  source: APG,
  rows: [
    { id: 'pie-chart.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: '总是', does: '绘图区只占一个 Tab 位：焦点落到锚点扇区，首次为 12 点方向的第一个扇区；图例同样只占一个 Tab 位' },
    { id: 'pie-chart.kbd.next', keys: ['ArrowRight', 'ArrowDown'], when: '焦点在绘图区', does: '顺时针移到下一个扇区；已在最后一个则原地不动' },
    { id: 'pie-chart.kbd.prev', keys: ['ArrowLeft', 'ArrowUp'], when: '焦点在绘图区', does: '逆时针移到上一个扇区' },
    { id: 'pie-chart.kbd.first', keys: ['Home'], when: '焦点在绘图区', does: '第一个扇区' },
    { id: 'pie-chart.kbd.last', keys: ['End'], when: '焦点在绘图区', does: '最后一个扇区' },
    { id: 'pie-chart.kbd.press', keys: ['Enter', 'Space'], when: '焦点在绘图区', does: '报告聚焦的扇区（onDatumPress）' },
    { id: 'pie-chart.kbd.dismiss', keys: ['Escape'], when: '提示框显示着', does: '收起提示框，焦点留在原处；按键不拦截，外层浮层的关闭仍归它自己' },
    { id: 'pie-chart.kbd.legend-move', keys: ['ArrowLeft', 'ArrowRight', 'Home', 'End'], when: '焦点在图例', does: '在图例项之间移动，左右键跟随文字方向的视觉次序' },
    { id: 'pie-chart.kbd.legend-toggle', keys: ['Enter', 'Space'], when: '焦点在图例项', does: '切换该扇区的显隐（原生按钮行为）' },
  ],
}
