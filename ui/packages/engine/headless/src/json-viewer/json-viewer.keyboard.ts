import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/treeview/#keyboardinteraction'

// 借 treeview 的键盘约定：一份 JSON 摊开就是一棵树，行与层级的走法与树一模一样。
// 与树的差别只在确认键：这里没有选中语义，Enter/Space 只切展开态，叶子上一概不吞。
export const jsonViewerKeyboard: KeyboardTable = {
  component: 'json-viewer',
  source: APG,
  rows: [
    { id: 'json-viewer.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus outside the tree', does: '整棵树只占一个 Tab 位：第一次进来落首行，之后回到上次停留的那一行' },
    { id: 'json-viewer.kbd.next', keys: ['ArrowDown'], when: 'focus in tree', does: '焦点移到下一个可见行（loop 默认关，末行不回绕）' },
    { id: 'json-viewer.kbd.prev', keys: ['ArrowUp'], when: 'focus in tree', does: '焦点移到上一个可见行（loop 默认关，首行不回绕）' },
    { id: 'json-viewer.kbd.first', keys: ['Home'], when: 'focus in tree', does: '焦点移到首个可见行' },
    { id: 'json-viewer.kbd.last', keys: ['End'], when: 'focus in tree', does: '焦点移到末个可见行（展开着的子层也算行）' },
    { id: 'json-viewer.kbd.expand', keys: ['ArrowRight'], when: 'focus on branch（dir=rtl 时改由 ArrowLeft 承担）', does: '收起的对象/数组就地展开；已展开则把焦点移到首个子行；标量行什么都不做且不吞键' },
    { id: 'json-viewer.kbd.collapse', keys: ['ArrowLeft'], when: 'focus in tree（dir=rtl 时改由 ArrowRight 承担）', does: '展开的对象/数组就地收起；收起的分支与标量行则把焦点移到父行；根行什么都不做' },
    { id: 'json-viewer.kbd.toggle', keys: ['Enter', 'Space'], when: 'focus on branch', does: '切换该分支的展开态；焦点在标量行上时不吞这两个键' },
    { id: 'json-viewer.kbd.expand-siblings', keys: ['*'], when: 'focus in tree', does: '展开与焦点行同一父级的全部分支（已展开的不动）；同级没有可展开的分支时不吞这个键' },
  ],
}
