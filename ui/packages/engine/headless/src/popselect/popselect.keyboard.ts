import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction'

// 触发器是原生 button：Enter / Space 由平台翻成 click，组件不接这两个键。
// Escape 归消解层，栈顶层才响应，因此也不在这张表里。
export const popselectKeyboard: KeyboardTable = {
  component: 'popselect',
  source: APG,
  rows: [
    { id: 'popselect.kbd.open', keys: ['ArrowDown', 'ArrowUp'], when: 'focus on trigger, 收起态', does: '展开浮层；焦点随即进入列表，落在选中项上，无选中则落首个可停留条目' },
    { id: 'popselect.kbd.next', keys: ['ArrowDown'], when: 'focus in content', does: '焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕）' },
    { id: 'popselect.kbd.prev', keys: ['ArrowUp'], when: 'focus in content', does: '焦点移到上一个可停留条目（禁用项跳过、尽头按 loop 回绕）' },
    { id: 'popselect.kbd.first', keys: ['Home'], when: 'focus in content', does: '焦点移到首个可停留条目' },
    { id: 'popselect.kbd.last', keys: ['End'], when: 'focus in content', does: '焦点移到末个可停留条目' },
    { id: 'popselect.kbd.select', keys: ['Enter', 'Space'], when: 'focus in content, 单选', does: '选中焦点条目并收起浮层，焦点归还触发器；条目禁用则不认' },
    { id: 'popselect.kbd.toggle', keys: ['Enter', 'Space'], when: 'focus in content, multiple', does: '切换焦点条目的选中态，浮层保持展开继续挑' },
    { id: 'popselect.kbd.typeahead', keys: ['单个可打印字符'], when: 'focus in content, typeahead 未关', does: '连打检索把焦点移到首字母匹配的条目，不落值' },
    { id: 'popselect.kbd.clear', keys: ['Delete'], when: 'focus on trigger, 有选中值, not disabled', does: '清空全部选中，浮层开合不变' },
    { id: 'popselect.kbd.backspace', keys: ['Backspace'], when: 'focus on trigger, 有选中值, not disabled', does: '单选清空；多选只去掉最后选中的那一个' },
    { id: 'popselect.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus in content', does: '收起浮层并放行焦点，按 Tab 序列离开' },
  ],
}
