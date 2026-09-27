/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sankey chart 相关实现。

import type { KeyboardTable } from '../spec/types'

// 绘图区只占一个 Tab 位，焦点只落在节点上，流带不占焦点：上下键在同一列里走，左右键沿流向跨到相邻的列；
// 竖排时两组键对调。图例是工具条，整体也只占一个 Tab 位。绘图区不随 RTL 镜像：右键始终是下游。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/'

export const sankeyChartKeyboard: KeyboardTable = {
  component: 'sankey-chart',
  source: APG,
  rows: [
    { id: 'sankey-chart.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: '总是', does: '绘图区只占一个 Tab 位：焦点落到锚点节点，首次为第一列最上面的节点；图例同样只占一个 Tab 位' },
    { id: 'sankey-chart.kbd.next', keys: ['ArrowDown'], when: '焦点在绘图区', does: '同一列的下一个节点（竖排时是 ArrowRight）；已在最后一个则原地不动' },
    { id: 'sankey-chart.kbd.prev', keys: ['ArrowUp'], when: '焦点在绘图区', does: '同一列的上一个节点（竖排时是 ArrowLeft）' },
    { id: 'sankey-chart.kbd.downstream', keys: ['ArrowRight'], when: '焦点在绘图区', does: '下游相邻的一列：取与当前节点流量最大的相连节点，没有相连的就取位置最近的（竖排时是 ArrowDown）' },
    { id: 'sankey-chart.kbd.upstream', keys: ['ArrowLeft'], when: '焦点在绘图区', does: '上游相邻的一列，取法同上（竖排时是 ArrowUp）' },
    { id: 'sankey-chart.kbd.first', keys: ['Home'], when: '焦点在绘图区', does: '第一列里位置最近的节点' },
    { id: 'sankey-chart.kbd.last', keys: ['End'], when: '焦点在绘图区', does: '最后一列里位置最近的节点' },
    { id: 'sankey-chart.kbd.press', keys: ['Enter', 'Space'], when: '焦点在绘图区', does: '报告聚焦的节点（onDatumPress）' },
    { id: 'sankey-chart.kbd.dismiss', keys: ['Escape'], when: '提示框显示着', does: '收起提示框，焦点留在原处；按键不拦截，外层浮层的关闭仍归它自己' },
    { id: 'sankey-chart.kbd.legend-move', keys: ['ArrowLeft', 'ArrowRight', 'Home', 'End'], when: '焦点在图例', does: '在图例项之间移动，左右键跟随文字方向的视觉次序' },
    { id: 'sankey-chart.kbd.legend-toggle', keys: ['Enter', 'Space'], when: '焦点在图例项', does: '切换该分组的显隐（原生按钮行为）' },
  ],
}
