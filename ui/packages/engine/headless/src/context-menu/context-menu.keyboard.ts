import type { KeyboardTable } from '../spec/types'

// APG 无右键菜单模式：展开后的键盘行为对齐 menu，差别只在入口。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboardinteraction'

export const contextMenuKeyboard: KeyboardTable = {
  component: 'context-menu',
  source: APG,
  rows: [
    { id: 'context-menu.kbd.open', keys: ['ContextMenu', 'Shift+F10'], when: 'focus in trigger', does: '在触发区起始角展开菜单并把焦点落到首个可用条目' },
    { id: 'context-menu.kbd.next', keys: ['ArrowDown'], when: 'open, focus in content', does: '焦点移到下一个条目（禁用项跳过、尽头按 loop 回绕）' },
    { id: 'context-menu.kbd.prev', keys: ['ArrowUp'], when: 'open, focus in content', does: '焦点移到上一个条目（禁用项跳过、尽头按 loop 回绕）' },
    { id: 'context-menu.kbd.first', keys: ['Home'], when: 'open, focus in content', does: '焦点移到首个可用条目' },
    { id: 'context-menu.kbd.last', keys: ['End'], when: 'open, focus in content', does: '焦点移到末个可用条目' },
    { id: 'context-menu.kbd.typeahead', keys: ['单个可打印字符'], when: 'open, typeahead 未关', does: '连打检索把焦点移到首字母匹配的条目，不选中它' },
    { id: 'context-menu.kbd.select', keys: ['Enter', 'Space'], when: 'focus in item, not disabled', does: '派发选中详情并关闭菜单，焦点归还触发区' },
    { id: 'context-menu.kbd.escape', keys: ['Escape'], when: 'open', does: '关闭菜单并把焦点归还触发区' },
    { id: 'context-menu.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'open', does: '关闭菜单，焦点不归还触发区，按 Tab 序列自然离开' },
  ],
}
