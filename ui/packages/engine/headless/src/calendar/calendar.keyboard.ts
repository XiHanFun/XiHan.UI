import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/#kbd_label'

// 方向键只搬焦点、不落值（选中不跟随焦点）。
// 落点越过月界时展示月跟着落点走，焦点再落进新月份的那一天。
export const calendarKeyboard: KeyboardTable = {
  component: 'calendar',
  source: APG,
  rows: [
    { id: 'calendar.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus outside the grid', does: '整张网格只占一个 Tab 位：焦点进入聚焦日那一格' },
    { id: 'calendar.kbd.prev-day', keys: ['ArrowLeft'], when: 'focus in grid', does: '焦点前移一天；越过月首即翻到上一月并落在那一天。粗粒度视图里走一格（一个月 / 一季 / 一年）' },
    { id: 'calendar.kbd.next-day', keys: ['ArrowRight'], when: 'focus in grid', does: '焦点后移一天；越过月末即翻到下一月并落在那一天。粗粒度视图里走一格' },
    { id: 'calendar.kbd.prev-week', keys: ['ArrowUp'], when: 'focus in grid', does: '焦点上移一周（减七天），跨月照样翻页。粗粒度视图里上移一行' },
    { id: 'calendar.kbd.next-week', keys: ['ArrowDown'], when: 'focus in grid', does: '焦点下移一周（加七天），跨月照样翻页。粗粒度视图里下移一行' },
    { id: 'calendar.kbd.week-start', keys: ['Home'], when: 'focus in grid', does: '焦点移到本周第一天；周首日随 locale 变。粗粒度视图里移到本行头一格' },
    { id: 'calendar.kbd.week-end', keys: ['End'], when: 'focus in grid', does: '焦点移到本周最后一天。粗粒度视图里移到本行末一格' },
    { id: 'calendar.kbd.prev-month', keys: ['PageUp'], when: 'focus in grid', does: '退一个月，日号不变（月末日被目标月夹住：3 月 31 日退成 2 月 29 日）。粗粒度视图里退一整页' },
    { id: 'calendar.kbd.next-month', keys: ['PageDown'], when: 'focus in grid', does: '进一个月，日号不变。粗粒度视图里进一整页' },
    { id: 'calendar.kbd.prev-year', keys: ['Shift+PageUp'], when: 'focus in grid', does: '退一年；粗粒度视图里退十页' },
    { id: 'calendar.kbd.next-year', keys: ['Shift+PageDown'], when: 'focus in grid', does: '进一年；粗粒度视图里进十页' },
    { id: 'calendar.kbd.select', keys: ['Enter', 'Space'], when: 'focus in grid, 聚焦日可用且非只读', does: '选中聚焦日：单选替换、多选切换、区间先落起点再落终点。还没钻到 view 那一档时这一下是往下钻一层' },
  ],
}
