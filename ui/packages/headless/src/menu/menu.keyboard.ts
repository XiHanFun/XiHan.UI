import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/#keyboardinteraction'

export const menuKeyboard: KeyboardTable = {
  component: 'menu',
  source: APG,
  rows: [
    { id: 'menu.kbd.open-first', keys: ['Enter', 'Space', 'ArrowDown'], when: 'focus in trigger', does: '展开菜单并把焦点落到首个可用条目' },
    { id: 'menu.kbd.open-last', keys: ['ArrowUp'], when: 'focus in trigger', does: '展开菜单并把焦点落到末个可用条目' },
    { id: 'menu.kbd.next', keys: ['ArrowDown'], when: 'open, focus in content', does: '焦点移到下一个条目（禁用项跳过、尽头按 loop 回绕）' },
    { id: 'menu.kbd.prev', keys: ['ArrowUp'], when: 'open, focus in content', does: '焦点移到上一个条目（禁用项跳过、尽头按 loop 回绕）' },
    { id: 'menu.kbd.first', keys: ['Home'], when: 'open, focus in content', does: '焦点移到首个可用条目' },
    { id: 'menu.kbd.last', keys: ['End'], when: 'open, focus in content', does: '焦点移到末个可用条目' },
    { id: 'menu.kbd.select', keys: ['Enter', 'Space'], when: 'focus in item, not disabled', does: '派发选中详情并关闭菜单，焦点归还 trigger' },
    { id: 'menu.kbd.escape', keys: ['Escape'], when: 'open', does: '关闭菜单并把焦点归还 trigger' },
    { id: 'menu.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'open', does: '关闭菜单，焦点不归还 trigger，按 Tab 序列自然离开' },
  ],
}
