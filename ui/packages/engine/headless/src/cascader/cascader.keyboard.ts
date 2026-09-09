import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction'

// 展开后焦点进入条目：上下键在当前列内走，左右键做列间层级操作；
// 键盘导航时展开路径随焦点走，打开落点本身不预展开。
//
// searchable 打开后浮层里多一个检索框，焦点落在它身上时按键归它、浮层壳整个让开，
// 因此那一档的键位单独成行（id 带 search 段）。检索词非空时候选列表顶掉列视图，
// 方向键走的是候选高亮（aria-activedescendant，焦点不动）；检索词为空时列视图还在，
// 上下键把焦点交回列。
export const cascaderKeyboard: KeyboardTable = {
  component: 'cascader',
  source: APG,
  rows: [
    { id: 'cascader.kbd.open', keys: ['Enter', 'Space'], when: 'closed, focus in trigger', does: '展开浮层并把焦点落到选中路径的末项（无选中或它已禁用则落该列首个可用条目）' },
    { id: 'cascader.kbd.open-next', keys: ['ArrowDown'], when: 'closed, focus in trigger', does: '展开浮层并把焦点落到选中条目在它那一列里的下一个可用条目' },
    { id: 'cascader.kbd.open-prev', keys: ['ArrowUp'], when: 'closed, focus in trigger', does: '展开浮层并把焦点落到选中条目在它那一列里的上一个可用条目' },
    { id: 'cascader.kbd.clear', keys: ['Delete'], when: 'focus in trigger, 有值且未禁用、未只读', does: '清空全部选中值，浮层不展开、焦点留在 trigger' },
    { id: 'cascader.kbd.backspace', keys: ['Backspace'], when: 'focus in trigger, 有值且未禁用、未只读', does: '单选清空；多选去掉最后一个选中路径' },
    { id: 'cascader.kbd.next', keys: ['ArrowDown'], when: 'open, focus in content', does: '焦点移到当前列的下一个条目（禁用条目跳过；loop 默认开，末项回绕到首项）；别的列不动' },
    { id: 'cascader.kbd.prev', keys: ['ArrowUp'], when: 'open, focus in content', does: '焦点移到当前列的上一个条目（禁用条目跳过；loop 默认开，首项回绕到末项）' },
    { id: 'cascader.kbd.first', keys: ['Home'], when: 'open, focus in content', does: '焦点移到当前列的首个可用条目' },
    { id: 'cascader.kbd.last', keys: ['End'], when: 'open, focus in content', does: '焦点移到当前列的末个可用条目' },
    { id: 'cascader.kbd.into', keys: ['ArrowRight'], when: 'open, 焦点条目有子节点（dir=rtl 时改由 ArrowLeft 承担）', does: '子列没开时先把它铺出来（焦点不动），已开时焦点移进它的首个可用条目；叶子上什么都不做且不吞键' },
    { id: 'cascader.kbd.back', keys: ['ArrowLeft'], when: 'open, 焦点不在根列（dir=rtl 时改由 ArrowRight 承担）', does: '焦点退回上一列的父条目，当前这一列随之收起；根列上什么都不做且不吞键' },
    { id: 'cascader.kbd.select', keys: ['Enter', 'Space'], when: 'open, 焦点条目未禁用', does: '叶子：落值并收起浮层、焦点归还 trigger。分支：展开它的子列且浮层不收起，changeOnSelect 打开时同时落值', restoresFocus: true },
    { id: 'cascader.kbd.escape', keys: ['Escape'], when: 'open', does: '收起浮层并把焦点归还 trigger，选中值不变', restoresFocus: true },
    { id: 'cascader.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'open', does: '收起浮层，焦点不归还 trigger，按 Tab 序列自然离开', restoresFocus: false },
    { id: 'cascader.kbd.search.type', keys: ['可打印字符'], when: 'open, focus in input, searchable', does: '改写检索词；trim 后非空即把列视图整个换成候选列表（整条路径连缀匹配），高亮落到首个可选候选' },
    { id: 'cascader.kbd.search.next', keys: ['ArrowDown'], when: 'open, focus in input, 检索词非空', does: '高亮移到下一个候选（禁用整条的候选跳过；loop 默认开，末条回绕到首条），焦点留在检索框' },
    { id: 'cascader.kbd.search.prev', keys: ['ArrowUp'], when: 'open, focus in input, 检索词非空', does: '高亮移到上一个候选（禁用整条的候选跳过；loop 默认开，首条回绕到末条），焦点留在检索框' },
    { id: 'cascader.kbd.search.first', keys: ['Home'], when: 'open, focus in input, 检索词非空', does: '高亮移到首个可选候选；检索词为空时不接管，光标照常跳到行首' },
    { id: 'cascader.kbd.search.last', keys: ['End'], when: 'open, focus in input, 检索词非空', does: '高亮移到末个可选候选；检索词为空时不接管，光标照常跳到行尾' },
    { id: 'cascader.kbd.search.select', keys: ['Enter'], when: 'open, focus in input, 有高亮候选', does: '把整条候选路径落成选中值：单选收起浮层、焦点归还 trigger，多选并入集合且浮层不收起；两种都清掉检索词回列视图。无可选候选时不吞这个键', restoresFocus: true },
    { id: 'cascader.kbd.search.clear', keys: ['Escape'], when: 'open, focus in input, 检索词非空', does: '清掉检索词回到列视图，浮层不收起、焦点留在检索框；检索词已空才轮到收浮层那一档', restoresFocus: false },
    { id: 'cascader.kbd.search.into-columns', keys: ['ArrowDown', 'ArrowUp'], when: 'open, focus in input, 检索词为空', does: '把焦点交给列视图：有锚点条目就落回它，没有则 ArrowDown 进当前列首个可用条目、ArrowUp 进末个' },
    { id: 'cascader.kbd.search.caret', keys: ['ArrowLeft', 'ArrowRight'], when: 'open, focus in input', does: '不接管，留给检索框自己移光标；进子列 / 回上一列那一套只在焦点落在条目上时发生' },
    { id: 'cascader.kbd.search.tab', keys: ['Tab', 'Shift+Tab'], when: 'open, focus in input', does: '收起浮层，焦点不归还 trigger，按 Tab 序列自然离开', restoresFocus: false },
    { id: 'cascader.kbd.search.compose', keys: ['输入法组合期间的任意键'], when: 'open, focus in input, isComposing', does: '一律不接管：组合期的 Enter 与上下键属于输入法候选框，既不选中候选也不移高亮' },
  ],
}
