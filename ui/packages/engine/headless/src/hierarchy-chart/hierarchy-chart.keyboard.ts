/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 hierarchy chart 相关实现。

import type { KeyboardTable } from '../spec/types'

// 绘图区是一棵树（role="tree"），只占一个 Tab 位：左右键在同一层的兄弟之间走，上下键在父子之间走，
// Enter 下钻、Backspace 上钻。矩形树图与圆堆积的兄弟按阅读序，旭日与冰柱按子节点次序；绘图区不随 RTL 镜像。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/treeview/'

export const hierarchyChartKeyboard: KeyboardTable = {
  component: 'hierarchy-chart',
  source: APG,
  rows: [
    { id: 'hierarchy-chart.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: '总是', does: '绘图区只占一个 Tab 位：焦点落到锚点节点，首次为第一层的第一个节点' },
    { id: 'hierarchy-chart.kbd.next', keys: ['ArrowRight'], when: '焦点在绘图区', does: '同一层的下一个兄弟：矩形树图与圆堆积按阅读序，旭日图顺时针，冰柱图自左而右；已在最后一个则原地不动' },
    { id: 'hierarchy-chart.kbd.prev', keys: ['ArrowLeft'], when: '焦点在绘图区', does: '同一层的上一个兄弟' },
    { id: 'hierarchy-chart.kbd.child', keys: ['ArrowDown'], when: '焦点在绘图区', does: '进入第一个子节点（看得见的层内）' },
    { id: 'hierarchy-chart.kbd.parent', keys: ['ArrowUp'], when: '焦点在绘图区', does: '回到父节点（看得见的层内）' },
    { id: 'hierarchy-chart.kbd.first', keys: ['Home'], when: '焦点在绘图区', does: '同一层的第一个兄弟' },
    { id: 'hierarchy-chart.kbd.last', keys: ['End'], when: '焦点在绘图区', does: '同一层的最后一个兄弟' },
    { id: 'hierarchy-chart.kbd.drill', keys: ['Enter'], when: '焦点在有子节点的节点', does: '下钻：把它设为根，焦点落到它的第一个子节点；在叶子上报告按下（onDatumPress）' },
    { id: 'hierarchy-chart.kbd.press', keys: ['Space'], when: '焦点在绘图区', does: '报告聚焦的节点（onDatumPress）' },
    { id: 'hierarchy-chart.kbd.up', keys: ['Backspace'], when: '已下钻', does: '上钻一层，焦点落回刚才的根' },
    { id: 'hierarchy-chart.kbd.dismiss', keys: ['Escape'], when: '提示框显示着', does: '收起提示框，焦点留在原处；按键不拦截，外层浮层的关闭仍归它自己' },
  ],
}
