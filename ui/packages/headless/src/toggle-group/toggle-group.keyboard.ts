import type { KeyboardTable } from '../spec/types'

// 一组带 roving tabindex 的开关按钮，键盘约定取自 APG 的工具条：
// 整组一个 Tab 位、组内方向键走、Enter/Space 由原生按钮激活。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/#keyboardinteraction'

export const toggleGroupKeyboard: KeyboardTable = {
  component: 'toggle-group',
  source: APG,
  rows: [
    { id: 'toggle-group.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'rovingFocus 开启（默认）', does: '整组只占一个 Tab 位：焦点落到锚点条目，无锚点时先落容器再由它转投' },
    { id: 'toggle-group.kbd.next', keys: ['ArrowRight', 'ArrowDown'], when: 'focus in group, 组未禁用且 rovingFocus 开启', does: '焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕），不改选中；dir=rtl 时改由 ArrowLeft 承担' },
    { id: 'toggle-group.kbd.prev', keys: ['ArrowLeft', 'ArrowUp'], when: 'focus in group, 组未禁用且 rovingFocus 开启', does: '焦点移到上一个可停留条目，不改选中；dir=rtl 时改由 ArrowRight 承担' },
    { id: 'toggle-group.kbd.first', keys: ['Home'], when: 'focus in group, 组未禁用且 rovingFocus 开启', does: '焦点移到首个可停留条目' },
    { id: 'toggle-group.kbd.last', keys: ['End'], when: 'focus in group, 组未禁用且 rovingFocus 开启', does: '焦点移到末个可停留条目' },
    { id: 'toggle-group.kbd.toggle', keys: ['Enter', 'Space'], when: 'focus on item, 条目未禁用', does: '切换该条目；条目是原生 button，这两个键由平台翻成 click' },
  ],
}
