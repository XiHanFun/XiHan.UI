import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction'

// 焦点粒度是一整行：表体里只有锚点行占 Tab 位，方向键在可见数据行上走。
// 不做单元格级导航与 F2 编辑模式，左右方向键另有语义（展开/收起当前行）。
// 表头里的排序把手与全选把手不在 roving 行组内，各自占一个 Tab 位。
export const tableKeyboard: KeyboardTable = {
  component: 'table',
  source: APG,
  rows: [
    { id: 'table.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus outside the table body', does: '表体只占一个 Tab 位：焦点进入锚点行，无锚点时先落 body 再由它转投；再按一次 Tab 整体离开表体' },
    { id: 'table.kbd.next', keys: ['ArrowDown'], when: 'focus in table body', does: '焦点移到下一个可见数据行（禁用行跳过；详情行不是落点；loop 默认关，末行不回绕）' },
    { id: 'table.kbd.prev', keys: ['ArrowUp'], when: 'focus in table body', does: '焦点移到上一个可见数据行（禁用行跳过；loop 默认关，首行不回绕）' },
    { id: 'table.kbd.first', keys: ['Home'], when: 'focus in table body', does: '焦点移到首个可见数据行' },
    { id: 'table.kbd.last', keys: ['End'], when: 'focus in table body', does: '焦点移到末个可见数据行' },
    { id: 'table.kbd.select', keys: ['Space'], when: 'focus on row, selectionMode 非 none 且该行未禁用', does: '切换焦点行的选中（单选替换、复选增删）；选不动时不吞这个键，页面照常滚动' },
    { id: 'table.kbd.expand', keys: ['ArrowRight'], when: 'focus on 可展开且收起的行（dir=rtl 时改由 ArrowLeft 承担）', does: '就地展开当前行，焦点不动；不可展开、已展开或禁用的行上什么都不做且不吞键' },
    { id: 'table.kbd.collapse', keys: ['ArrowLeft'], when: 'focus on 可展开且已展开的行（dir=rtl 时改由 ArrowRight 承担）', does: '就地收起当前行，焦点不动；其余情形什么都不做且不吞键' },
    { id: 'table.kbd.sort', keys: ['Enter', 'Space'], when: 'focus on sort-trigger, 该列 sortable', does: '排序方向按 升序 → 降序 → 不排序 循环；按住 Shift 是追加到排序链而不是替换整条链' },
    { id: 'table.kbd.select-all', keys: ['Enter', 'Space'], when: 'focus on select-all-trigger, selectionMode=multiple', does: '当前可选行全选中就整段清空，否则整段选上；三态由 aria-checked 报出（半选为 mixed）' },
    { id: 'table.kbd.select-all-body', keys: ['Ctrl+A', 'Cmd+A'], when: 'focus in table body, selectionMode=multiple', does: '与全选把手同义：当前可选行全选中就整段清空，否则整段选上（禁用行不算进基数）。单选与不可选的表格不吞这个键，交还浏览器的整页全选；按住不放的连发只算一次' },
    { id: 'table.kbd.column-resize', keys: ['ArrowLeft', 'ArrowRight'], when: 'focus in column-resize-trigger，该列 resizable', does: '把这一列按 8px 收窄 / 加宽；往行尾侧推是加宽，rtl 下左右两键对调，语义恒是「加宽 / 收窄」' },
    { id: 'table.kbd.column-resize-large', keys: ['Shift+ArrowLeft', 'Shift+ArrowRight'], when: 'focus in column-resize-trigger，该列 resizable', does: '按 40px 收窄 / 加宽，方向规则同上' },
    { id: 'table.kbd.column-move', keys: ['ArrowLeft', 'ArrowRight'], when: 'focus in column-drag-trigger，该列在可拖的那一段里', does: '把这一列往前 / 往后挪一位，按一下就是一次完整提交；往行首侧挪是往前，rtl 下左右两键对调，语义恒是「往前 / 往后」；已在段首 / 段末就不动，也不回绕' },
    { id: 'table.kbd.column-move-edge', keys: ['Home', 'End'], when: 'focus in column-drag-trigger，该列在可拖的那一段里', does: '把这一列挪到可拖那一段的段首 / 段末；rtl 下两键对调，语义恒是「段首 / 段末」；已经在那儿就不动' },
    { id: 'table.kbd.row-move', keys: ['Alt+ArrowUp', 'Alt+ArrowDown'], when: 'focus in table body，rowReorderable 且行拖拽没有被阻断的原因', does: '把焦点行往前 / 往后挪一位，按一下就是一次完整提交，不进拖动态；纵轴与文字方向无关，rtl 下两键不对调；已在首行 / 末行就不动，也不回绕；焦点锚点跟着搬走的那一行，连按几下能一路挪到位。裸方向键仍是导航、Space 仍是选中、左右键仍是展开收起' },
  ],
}
