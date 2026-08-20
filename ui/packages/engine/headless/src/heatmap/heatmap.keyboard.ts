import type { KeyboardTable } from '../spec/types'

// 一张只读的日期网格：整块只占一个 Tab 位，进去以后方向键在格子间走。
// 列是周、行是星期几，所以左右键走的是「上一周 / 下一周的同一天」，上下键走的才是相邻的一天。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction'

export const heatmapKeyboard: KeyboardTable = {
  component: 'heatmap',
  source: APG,
  rows: [
    { id: 'heatmap.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: '总是', does: '整张网格只占一个 Tab 位：焦点落到锚点那一格，一格都没有时落网格自己' },
    { id: 'heatmap.kbd.prev-week', keys: ['ArrowLeft'], when: 'focus in grid', does: '焦点移到上一周的同一天；已在头一列则原地不动。dir=rtl 时改由 ArrowRight 承担' },
    { id: 'heatmap.kbd.next-week', keys: ['ArrowRight'], when: 'focus in grid', does: '焦点移到下一周的同一天；已在末一列则原地不动。dir=rtl 时改由 ArrowLeft 承担' },
    { id: 'heatmap.kbd.prev-day', keys: ['ArrowUp'], when: 'focus in grid', does: '焦点上移一行，即前一天；走出区间则原地不动' },
    { id: 'heatmap.kbd.next-day', keys: ['ArrowDown'], when: 'focus in grid', does: '焦点下移一行，即后一天；走出区间则原地不动' },
    { id: 'heatmap.kbd.row-start', keys: ['Home'], when: 'focus in grid', does: '焦点移到本行头一格，即这个星期几在区间里最早的那一天' },
    { id: 'heatmap.kbd.row-end', keys: ['End'], when: 'focus in grid', does: '焦点移到本行末一格，即这个星期几在区间里最晚的那一天' },
    { id: 'heatmap.kbd.grid-start', keys: ['Ctrl+Home'], when: 'focus in grid', does: '焦点移到整张网格文档序的头一格' },
    { id: 'heatmap.kbd.grid-end', keys: ['Ctrl+End'], when: 'focus in grid', does: '焦点移到整张网格文档序的末一格' },
  ],
}
