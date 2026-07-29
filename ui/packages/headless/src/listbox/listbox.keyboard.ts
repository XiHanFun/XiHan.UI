import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction'

// 方向键只搬焦点、不落值。
export const listboxKeyboard: KeyboardTable = {
  component: 'listbox',
  source: APG,
  rows: [
    { id: 'listbox.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus outside the listbox', does: '整个列表只占一个 Tab 位：焦点进入锚点条目，无锚点时先落容器再由它转投' },
    { id: 'listbox.kbd.next', keys: ['ArrowDown'], when: 'focus in listbox, orientation=vertical', does: '焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；orientation=horizontal 时改由 ArrowRight 承担，dir=rtl 再对调左右' },
    { id: 'listbox.kbd.prev', keys: ['ArrowUp'], when: 'focus in listbox, orientation=vertical', does: '焦点移到上一个可停留条目（禁用项跳过、尽头按 loop 回绕）；orientation=horizontal 时改由 ArrowLeft 承担，dir=rtl 再对调左右' },
    { id: 'listbox.kbd.first', keys: ['Home'], when: 'focus in listbox', does: '焦点移到首个可停留条目' },
    { id: 'listbox.kbd.last', keys: ['End'], when: 'focus in listbox', does: '焦点移到末个可停留条目' },
    { id: 'listbox.kbd.select', keys: ['Enter', 'Space'], when: 'focus on item, selectionMode 为 single 或 extended', does: '只选中焦点条目，替换原有选中；条目自报禁用则不认' },
    { id: 'listbox.kbd.toggle', keys: ['Space', 'Enter', 'Ctrl+Space'], when: 'focus on item, 可多选（multiple；extended 下须按住 Ctrl/Cmd）', does: '切换焦点条目的选中态，其余选中不动' },
    { id: 'listbox.kbd.extend', keys: ['Shift+ArrowDown', 'Shift+ArrowUp'], when: 'focus in listbox, 可多选', does: '焦点移到相邻条目并切换它的选中态；往回走即把刚扩进来的那个摘掉' },
    { id: 'listbox.kbd.select-all', keys: ['Ctrl+A', 'Cmd+A'], when: 'focus in listbox, 可多选', does: '选中全部可选条目；已经全选则把它们一并取消（禁用但已选中的不动）' },
    { id: 'listbox.kbd.typeahead', keys: ['单个可打印字符'], when: 'focus in listbox, typeahead 未关', does: '连打检索把焦点移到首字母匹配的条目，不改选中值' },
  ],
}
