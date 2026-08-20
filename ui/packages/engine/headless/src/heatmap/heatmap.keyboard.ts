import type { KeyboardTable } from '../spec/types'

// 一张只读的方格网：整块只占一个 Tab 位，进去以后方向键在格子间走。
// 三种形态的按键一样，一步走多远由形态决定：日历形态列是周、行是星期几，
// 月历形态行是周、列是星期几，矩阵形态行列都由作者给。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction'

export const heatmapKeyboard: KeyboardTable = {
  component: 'heatmap',
  source: APG,
  rows: [
    { id: 'heatmap.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: '总是', does: '整张网格只占一个 Tab 位：焦点落到锚点那一格，一格都没有时落网格自己' },
    { id: 'heatmap.kbd.prev-week', keys: ['ArrowLeft'], when: 'focus in grid', does: '焦点横着退一格：日历形态是上一周的同一天，月历形态是前一天（跨得过月块），矩阵形态是左边一列；已在头一格则原地不动。dir=rtl 时改由 ArrowRight 承担' },
    { id: 'heatmap.kbd.next-week', keys: ['ArrowRight'], when: 'focus in grid', does: '焦点横着进一格：日历形态是下一周的同一天，月历形态是后一天（跨得过月块），矩阵形态是右边一列；已在末一格则原地不动。dir=rtl 时改由 ArrowLeft 承担' },
    { id: 'heatmap.kbd.prev-day', keys: ['ArrowUp'], when: 'focus in grid', does: '焦点竖着退一格：日历形态是前一天，月历形态是上一周的同一天，矩阵形态是上面一行；走出网格则原地不动' },
    { id: 'heatmap.kbd.next-day', keys: ['ArrowDown'], when: 'focus in grid', does: '焦点竖着进一格：日历形态是后一天，月历形态是下一周的同一天，矩阵形态是下面一行；走出网格则原地不动' },
    { id: 'heatmap.kbd.row-start', keys: ['Home'], when: 'focus in grid', does: '焦点移到本行头一格：日历形态是这个星期几最早的一天，月历形态是这一周在本月里的头一天，矩阵形态是头一列' },
    { id: 'heatmap.kbd.row-end', keys: ['End'], when: 'focus in grid', does: '焦点移到本行末一格：日历形态是这个星期几最晚的一天，月历形态是这一周在本月里的末一天，矩阵形态是末一列' },
    { id: 'heatmap.kbd.grid-start', keys: ['Ctrl+Home'], when: 'focus in grid', does: '焦点移到整张网格文档序的头一格' },
    { id: 'heatmap.kbd.grid-end', keys: ['Ctrl+End'], when: 'focus in grid', does: '焦点移到整张网格文档序的末一格' },
    { id: 'heatmap.kbd.dismiss', keys: ['Escape'], when: '详情条显示着', does: '收起详情条；焦点留在原处，按键不拦截（外层浮层的关闭仍归它自己管）' },
  ],
}
