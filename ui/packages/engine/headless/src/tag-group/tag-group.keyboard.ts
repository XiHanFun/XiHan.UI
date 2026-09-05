import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction'

// 方向键只搬焦点、不落值；摘除走 Delete / Backspace，摘除钮不占 Tab 位。
export const tagGroupKeyboard: KeyboardTable = {
  component: 'tag-group',
  source: APG,
  rows: [
    { id: 'tag-group.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus outside the group', does: '整组只占一个 Tab 位：焦点进入锚点标签，无锚点时先落列表容器再由它转投；每枚标签的摘除钮一律不占停靠点' },
    { id: 'tag-group.kbd.next', keys: ['ArrowRight'], when: 'focus in group, orientation=horizontal', does: '焦点移到下一枚可停留标签（禁用项跳过、尽头按 loop 回绕）；orientation=vertical 时改由 ArrowDown 承担，dir=rtl 再对调左右' },
    { id: 'tag-group.kbd.prev', keys: ['ArrowLeft'], when: 'focus in group, orientation=horizontal', does: '焦点移到上一枚可停留标签（禁用项跳过、尽头按 loop 回绕）；orientation=vertical 时改由 ArrowUp 承担，dir=rtl 再对调左右' },
    { id: 'tag-group.kbd.first', keys: ['Home'], when: 'focus in group', does: '焦点移到首枚可停留标签' },
    { id: 'tag-group.kbd.last', keys: ['End'], when: 'focus in group', does: '焦点移到末枚可停留标签' },
    { id: 'tag-group.kbd.select', keys: ['Enter', 'Space'], when: 'focus on item, selectionMode=single 且可改', does: '只选中焦点标签，替换原有选中；标签禁用或整组只读则不认' },
    { id: 'tag-group.kbd.toggle', keys: ['Enter', 'Space'], when: 'focus on item, selectionMode=multiple 且可改', does: '切换焦点标签的选中态，其余选中不动' },
    { id: 'tag-group.kbd.select-all', keys: ['Ctrl+A', 'Cmd+A'], when: 'focus in group, selectionMode=multiple 且可改', does: '选中全部可选标签；已经全选则把它们一并取消（禁用但已选中的不动）' },
    { id: 'tag-group.kbd.delete', keys: ['Delete', 'Backspace'], when: 'focus on item, 该标签可摘且可改', does: '摘掉焦点标签，并把焦点交给前一枚；前面没有就交给后一枚，一枚不剩就交给列表容器' },
    { id: 'tag-group.kbd.typeahead', keys: ['单个可打印字符'], when: 'focus in group, typeahead 未关', does: '连打检索把焦点移到首字母匹配的标签，不改选中值' },
  ],
}
