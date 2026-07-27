import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/treeview/#keyboardinteraction'

// 所有"走一行"的键都在**可见行序列**上走：收起分支的子树一行不算。
// 左右键在树里不是同轴导航，而是层级操作（展开/收起、进子层/回父层）。
export const treeKeyboard: KeyboardTable = {
  component: 'tree',
  source: APG,
  rows: [
    { id: 'tree.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus outside the tree', does: '整棵树只占一个 Tab 位：焦点进入锚点节点，无锚点时先落容器再由它转投' },
    { id: 'tree.kbd.next', keys: ['ArrowDown'], when: 'focus in tree', does: '焦点移到下一个可见行（禁用行跳过；loop 默认关，末行不回绕）' },
    { id: 'tree.kbd.prev', keys: ['ArrowUp'], when: 'focus in tree', does: '焦点移到上一个可见行（禁用行跳过；loop 默认关，首行不回绕）' },
    { id: 'tree.kbd.first', keys: ['Home'], when: 'focus in tree', does: '焦点移到首个可见行' },
    { id: 'tree.kbd.last', keys: ['End'], when: 'focus in tree', does: '焦点移到末个可见行（展开着的子树也算行）' },
    { id: 'tree.kbd.expand', keys: ['ArrowRight'], when: 'focus on branch（dir=rtl 时改由 ArrowLeft 承担）', does: '收起的分支就地展开；已展开则把焦点移到首个子节点；叶子上什么都不做且不吞键' },
    { id: 'tree.kbd.collapse', keys: ['ArrowLeft'], when: 'focus in tree（dir=rtl 时改由 ArrowRight 承担）', does: '展开的分支就地收起；收起的分支与叶子则把焦点移到父节点；根层的行什么都不做' },
    { id: 'tree.kbd.select', keys: ['Enter', 'Space'], when: 'focus on node, 节点未禁用', does: '选中焦点节点（单选替换、复选切换）；焦点在分支上且 expandOnClick 未关时顺带切换展开态' },
    { id: 'tree.kbd.expand-siblings', keys: ['*'], when: 'focus in tree', does: '展开与焦点行同一父级的全部分支（已展开与禁用的不动）；同级没有可展开的分支时不吞这个键' },
    { id: 'tree.kbd.typeahead', keys: ['单个可打印字符'], when: 'focus in tree, typeahead 未关', does: '连打检索在可见行上按 label 首字母搬焦点，不改选中值，也不展开任何分支' },
  ],
}
