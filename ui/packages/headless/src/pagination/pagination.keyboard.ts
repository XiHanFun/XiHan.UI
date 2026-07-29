import type { KeyboardTable } from '../spec/types'

// APG 没有 pagination 模式，键盘行为全部由原生按钮与 Tab 序列提供，源头指向 button 模式。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'

export const paginationKeyboard: KeyboardTable = {
  component: 'pagination',
  source: APG,
  rows: [
    { id: 'pagination.kbd.item', keys: ['Enter', 'Space'], when: 'focus in item', does: '跳到该页码（原生按钮激活，平台把按键翻成 click）' },
    { id: 'pagination.kbd.prev', keys: ['Enter', 'Space'], when: 'focus in prev-trigger, 非首页', does: '回上一页；首页时按钮是原生 disabled，焦点根本落不上去' },
    { id: 'pagination.kbd.next', keys: ['Enter', 'Space'], when: 'focus in next-trigger, 非末页', does: '进下一页；末页时按钮是原生 disabled' },
    { id: 'pagination.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus in root', does: '逐个走过每个可用按钮——分页不做 roving tabindex，用户要能 Tab 到某一页再确认；禁用的首尾按钮自动脱序' },
  ],
}
