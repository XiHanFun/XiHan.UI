import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction'

// 焦点自始至终在输入框上：方向键移的是 aria-activedescendant 指向的高亮，不是 DOM 焦点。
export const comboboxKeyboard: KeyboardTable = {
  component: 'combobox',
  source: APG,
  rows: [
    { id: 'combobox.kbd.open-first', keys: ['ArrowDown'], when: 'closed, focus in input', does: '展开候选列表并把高亮落到首个可选候选' },
    { id: 'combobox.kbd.open-last', keys: ['ArrowUp'], when: 'closed, focus in input', does: '展开候选列表并把高亮落到末个可选候选' },
    { id: 'combobox.kbd.open-quiet', keys: ['Alt+ArrowDown'], when: 'closed, focus in input', does: '展开候选列表但不预选任何候选' },
    { id: 'combobox.kbd.next', keys: ['ArrowDown'], when: 'open', does: '高亮移到下一个候选（禁用项跳过、尽头按 loop 回绕），焦点不动' },
    { id: 'combobox.kbd.prev', keys: ['ArrowUp'], when: 'open', does: '高亮移到上一个候选（禁用项跳过、尽头按 loop 回绕），焦点不动' },
    { id: 'combobox.kbd.first', keys: ['Home'], when: 'open', does: '高亮移到首个可选候选；收起态不接管，光标照常跳到行首' },
    { id: 'combobox.kbd.last', keys: ['End'], when: 'open', does: '高亮移到末个可选候选；收起态不接管，光标照常跳到行尾' },
    { id: 'combobox.kbd.select', keys: ['Enter'], when: 'open, 有高亮且未禁用', does: '选中高亮候选：单选把输入串换成它的文本并收起，多选把它并入集合、清空输入串且不收起' },
    { id: 'combobox.kbd.custom', keys: ['Enter'], when: 'open, 无高亮且 allowCustomValue', does: '把输入串本身收成选中值' },
    { id: 'combobox.kbd.escape', keys: ['Escape'], when: 'open', does: '先摘掉高亮；高亮已空时才收起列表，选中值不变' },
    { id: 'combobox.kbd.close-alt', keys: ['Alt+ArrowUp'], when: 'open', does: '收起列表，选中值不变' },
    { id: 'combobox.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'open', does: '收起列表且不拦按键，焦点按 Tab 序列自然离开' },
    { id: 'combobox.kbd.remove-last', keys: ['Backspace'], when: 'multiple, 输入串为空且已有选中', does: '删掉最后一个已选项' },
    { id: 'combobox.kbd.type', keys: ['可打印字符'], when: 'focus in input', does: '改写输入串并展开列表；过滤由调用方按 onInputValueChange 自己做' },
  ],
}
