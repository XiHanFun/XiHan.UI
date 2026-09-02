import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction'

// 收起态的键盘入口与 Select 同构（trigger 上一个 Tab 位，方向键与确认键都展开浮层）；
// 展开之后焦点真的进树，所有走一行的键都在可见行序列上走，收起分支的子树一行不算。
// 左右键在树里不是同轴导航，而是层级操作（展开/收起、进子层/回父层）。
// 按键收在浮层壳（content）上，焦点歇在壳、树容器或某一行上都算数。
export const treeSelectKeyboard: KeyboardTable = {
  component: 'tree-select',
  source: APG,
  rows: [
    { id: 'tree-select.kbd.open', keys: ['Enter', 'Space'], when: 'closed, focus in trigger', does: '展开浮层并把焦点落到选中节点（无选中或它藏在收起的分支里则落首个可用行）' },
    { id: 'tree-select.kbd.open-next', keys: ['ArrowDown'], when: 'closed, focus in trigger', does: '展开浮层并把焦点落到选中节点的下一个可用行' },
    { id: 'tree-select.kbd.open-prev', keys: ['ArrowUp'], when: 'closed, focus in trigger', does: '展开浮层并把焦点落到选中节点的上一个可用行' },
    { id: 'tree-select.kbd.clear', keys: ['Delete'], when: 'focus in trigger, 有值且未禁用/只读', does: '清空全部选中值，焦点留在 trigger' },
    { id: 'tree-select.kbd.clear-last', keys: ['Backspace'], when: 'focus in trigger, 有值且未禁用/只读', does: '单选清空；多选去掉最后一个选中值' },
    { id: 'tree-select.kbd.next', keys: ['ArrowDown'], when: 'open, focus in content', does: '焦点移到下一个可见行（禁用行跳过；loop 默认关，末行不回绕）' },
    { id: 'tree-select.kbd.prev', keys: ['ArrowUp'], when: 'open, focus in content', does: '焦点移到上一个可见行（禁用行跳过；loop 默认关，首行不回绕）' },
    { id: 'tree-select.kbd.first', keys: ['Home'], when: 'open, focus in content', does: '焦点移到首个可见行' },
    { id: 'tree-select.kbd.last', keys: ['End'], when: 'open, focus in content', does: '焦点移到末个可见行（展开着的子树也算行）' },
    { id: 'tree-select.kbd.expand', keys: ['ArrowRight'], when: 'open, focus on branch（dir=rtl 时改由 ArrowLeft 承担）', does: '收起的分支就地展开；已展开则把焦点移到首个子节点；叶子上什么都不做且不吞键' },
    { id: 'tree-select.kbd.collapse', keys: ['ArrowLeft'], when: 'open, focus in content（dir=rtl 时改由 ArrowRight 承担）', does: '展开的分支就地收起；收起的分支与叶子则把焦点移到父节点；根层的行什么都不做' },
    { id: 'tree-select.kbd.select', keys: ['Enter', 'Space'], when: 'open, 焦点节点未禁用', does: '选中焦点节点：单选替换并收起浮层、焦点归还 trigger；多选切换且浮层不收起', restoresFocus: true },
    { id: 'tree-select.kbd.expand-siblings', keys: ['*'], when: 'open, focus in content', does: '展开与焦点行同一父级的全部分支（已展开与禁用的不动）；同级没有可展开的分支时不吞这个键' },
    { id: 'tree-select.kbd.typeahead', keys: ['单个可打印字符'], when: 'open, focus in content', does: '连打检索在可见行上按 label 首字母搬焦点，不改选中值，也不展开任何分支' },
    { id: 'tree-select.kbd.escape', keys: ['Escape'], when: 'open', does: '收起浮层并把焦点归还 trigger，选中值与展开集合都不变', restoresFocus: true },
    { id: 'tree-select.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'open', does: '收起浮层，焦点不归还 trigger，按 Tab 序列自然离开', restoresFocus: false },
  ],
}
