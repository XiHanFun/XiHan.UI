import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction'

export const checkboxGroupKeyboard: KeyboardTable = {
  component: 'checkbox-group',
  source: APG,
  rows: [
    {
      id: 'checkbox-group.kbd.tab',
      keys: ['Tab', 'Shift+Tab'],
      when: 'focus enters or leaves the group',
      does: '组内有几个条目就有几个 Tab 停靠点（禁用条目也留一个），容器自己不占位；单选组的"整组一个停靠点"在这里不成立',
    },
    {
      id: 'checkbox-group.kbd.toggle',
      keys: ['Space'],
      when: 'focus on item, group editable and item not disabled',
      does: '翻转该条目的选中态；改不动时放行按键给页面滚动',
    },
    {
      id: 'checkbox-group.kbd.toggle-all',
      keys: ['Space'],
      when: 'focus on trigger, group editable',
      does: '可用条目未全选则一并勾上，已全选则一并取消；禁用条目不受影响',
    },
  ],
}
