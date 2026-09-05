import type { KeyboardTable } from '../spec/types'

// 不可展开时这块文字不接收焦点、不接管任何按键；开了 expandable 才按按钮那套走。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

export const truncateKeyboard: KeyboardTable = {
  component: 'truncate',
  source: APG,
  rows: [
    {
      id: 'truncate.kbd.toggle',
      keys: ['Enter', 'Space'],
      when: 'expandable，焦点在 root 上',
      does: '铺开全文 / 收回夹住的那一版；Space 拦掉翻页的默认动作',
    },
    {
      id: 'truncate.kbd.tab',
      keys: ['Tab', 'Shift+Tab'],
      when: 'expandable',
      does: '停到这块文字上；不可展开时它不带 tabindex，不在 Tab 序列里',
    },
  ],
}
