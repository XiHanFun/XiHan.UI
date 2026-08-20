import type { KeyboardTable } from '../spec/types'

// 一排互斥选项就是一个单选组，键盘约定取自 APG 的 radiogroup：
// 整组一个 Tab 位、组内方向键走且焦点跟着选中走。
// Home/End 是本组件的补充：分段控件常见五六段，让键盘用户能一步到头。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction'

export const segmentedKeyboard: KeyboardTable = {
  component: 'segmented',
  source: APG,
  rows: [
    { id: 'segmented.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus outside the group', does: '整组只占一个 Tab 位：焦点落到锚点段（即选中段），锚点缺席或被禁用时先落容器再由它转投首个可停留段' },
    { id: 'segmented.kbd.next', keys: ['ArrowRight', 'ArrowDown'], when: 'focus in group, 组未禁用', does: '焦点移到下一个可停留段并选中它（禁用段跳过、尽头按 loop 回绕）；只读时焦点照走但不落值；dir=rtl 时改由 ArrowLeft 承担' },
    { id: 'segmented.kbd.prev', keys: ['ArrowLeft', 'ArrowUp'], when: 'focus in group, 组未禁用', does: '焦点移到上一个可停留段并选中它；只读时焦点照走但不落值；dir=rtl 时改由 ArrowRight 承担' },
    { id: 'segmented.kbd.first', keys: ['Home'], when: 'focus in group, 组未禁用', does: '焦点移到首个可停留段并选中它；只读时只移焦点' },
    { id: 'segmented.kbd.last', keys: ['End'], when: 'focus in group, 组未禁用', does: '焦点移到末个可停留段并选中它；只读时只移焦点' },
    { id: 'segmented.kbd.select', keys: ['Enter', 'Space'], when: 'focus on item, 该段未禁用且组非只读', does: '选中当前段；段是原生 button，这两个键由平台翻成 click' },
  ],
}
