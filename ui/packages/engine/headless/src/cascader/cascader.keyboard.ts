import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction'

// 展开后焦点进入条目：上下键在当前列内走，左右键做列间层级操作；
// 键盘导航时展开路径随焦点走，打开落点本身不预展开。
export const cascaderKeyboard: KeyboardTable = {
  component: 'cascader',
  source: APG,
  rows: [
    { id: 'cascader.kbd.open', keys: ['Enter', 'Space'], when: 'closed, focus in trigger', does: '展开浮层并把焦点落到选中路径的末项（无选中或它已禁用则落该列首个可用条目）' },
    { id: 'cascader.kbd.open-next', keys: ['ArrowDown'], when: 'closed, focus in trigger', does: '展开浮层并把焦点落到选中条目在它那一列里的下一个可用条目' },
    { id: 'cascader.kbd.open-prev', keys: ['ArrowUp'], when: 'closed, focus in trigger', does: '展开浮层并把焦点落到选中条目在它那一列里的上一个可用条目' },
    { id: 'cascader.kbd.next', keys: ['ArrowDown'], when: 'open, focus in content', does: '焦点移到当前列的下一个条目（禁用条目跳过；loop 默认开，末项回绕到首项）；别的列不动' },
    { id: 'cascader.kbd.prev', keys: ['ArrowUp'], when: 'open, focus in content', does: '焦点移到当前列的上一个条目（禁用条目跳过；loop 默认开，首项回绕到末项）' },
    { id: 'cascader.kbd.first', keys: ['Home'], when: 'open, focus in content', does: '焦点移到当前列的首个可用条目' },
    { id: 'cascader.kbd.last', keys: ['End'], when: 'open, focus in content', does: '焦点移到当前列的末个可用条目' },
    { id: 'cascader.kbd.into', keys: ['ArrowRight'], when: 'open, 焦点条目有子节点（dir=rtl 时改由 ArrowLeft 承担）', does: '子列没开时先把它铺出来（焦点不动），已开时焦点移进它的首个可用条目；叶子上什么都不做且不吞键' },
    { id: 'cascader.kbd.back', keys: ['ArrowLeft'], when: 'open, 焦点不在根列（dir=rtl 时改由 ArrowRight 承担）', does: '焦点退回上一列的父条目，当前这一列随之收起；根列上什么都不做且不吞键' },
    { id: 'cascader.kbd.select', keys: ['Enter', 'Space'], when: 'open, 焦点条目未禁用', does: '叶子：落值并收起浮层、焦点归还 trigger。分支：展开它的子列且浮层不收起，changeOnSelect 打开时同时落值' },
    { id: 'cascader.kbd.escape', keys: ['Escape'], when: 'open', does: '收起浮层并把焦点归还 trigger，选中值不变' },
    { id: 'cascader.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'open', does: '收起浮层，焦点不归还 trigger，按 Tab 序列自然离开' },
  ],
}
