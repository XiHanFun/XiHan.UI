import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction'

export const selectKeyboard: KeyboardTable = {
  component: 'select',
  source: APG,
  rows: [
    { id: 'select.kbd.open', keys: ['Enter', 'Space'], when: 'closed, focus in trigger', does: '展开列表并把高亮落到当前选中项（无选中则落首个可用条目）' },
    { id: 'select.kbd.open-next', keys: ['ArrowDown'], when: 'closed, focus in trigger', does: '展开列表并把高亮落到选中项的下一个可用条目' },
    { id: 'select.kbd.open-prev', keys: ['ArrowUp'], when: 'closed, focus in trigger', does: '展开列表并把高亮落到选中项的上一个可用条目' },
    { id: 'select.kbd.trigger-typeahead', keys: ['单个可打印字符'], when: 'closed, focus in trigger', does: '连打检索命中的条目直接成为选中值，列表不展开' },
    { id: 'select.kbd.next', keys: ['ArrowDown'], when: 'open, focus in content', does: '高亮移到下一个条目（禁用项跳过、尽头按 loop 回绕）' },
    { id: 'select.kbd.prev', keys: ['ArrowUp'], when: 'open, focus in content', does: '高亮移到上一个条目（禁用项跳过、尽头按 loop 回绕）' },
    { id: 'select.kbd.first', keys: ['Home'], when: 'open, focus in content', does: '高亮移到首个可用条目' },
    { id: 'select.kbd.last', keys: ['End'], when: 'open, focus in content', does: '高亮移到末个可用条目' },
    { id: 'select.kbd.typeahead', keys: ['单个可打印字符'], when: 'open, focus in content', does: '连打检索移动高亮，不改选中值' },
    { id: 'select.kbd.select', keys: ['Enter', 'Space'], when: 'open, 高亮条目未禁用', does: '选中高亮条目并关闭列表，焦点归还 trigger' },
    { id: 'select.kbd.escape', keys: ['Escape'], when: 'open', does: '关闭列表并把焦点归还 trigger，选中值不变' },
    { id: 'select.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'open', does: '关闭列表，焦点不归还 trigger，按 Tab 序列自然离开' },
  ],
}
