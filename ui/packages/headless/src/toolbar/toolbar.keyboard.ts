import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/#keyboardinteraction'

// 一条工具条只占一个 Tab 位，条内靠方向键走。
// 条目自己的激活键不在表里，那是条目各自的规格，工具条不接管。
export const toolbarKeyboard: KeyboardTable = {
  component: 'toolbar',
  source: APG,
  rows: [
    { id: 'toolbar.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'roving tabindex（恒开）', does: '整条只占一个 Tab 位：焦点落到锚点条目，无锚点时先落容器再由它转投给第一个可停留条目' },
    { id: 'toolbar.kbd.next', keys: ['ArrowRight', 'ArrowDown'], when: '焦点在条内且未整条禁用；横排收 ArrowRight、竖排收 ArrowDown', does: '焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；dir=rtl 时水平主轴改由 ArrowLeft 承担' },
    { id: 'toolbar.kbd.prev', keys: ['ArrowLeft', 'ArrowUp'], when: '焦点在条内且未整条禁用；横排收 ArrowLeft、竖排收 ArrowUp', does: '焦点移到上一个可停留条目（禁用项跳过、尽头按 loop 回绕）；dir=rtl 时水平主轴改由 ArrowRight 承担' },
    { id: 'toolbar.kbd.first', keys: ['Home'], when: '焦点在条内且未整条禁用', does: '焦点移到首个可停留条目' },
    { id: 'toolbar.kbd.last', keys: ['End'], when: '焦点在条内且未整条禁用', does: '焦点移到末个可停留条目' },
    { id: 'toolbar.kbd.cross-axis', keys: ['交叉轴的两个方向键'], when: '焦点在条内（横排按上下、竖排按左右）', does: '不归工具条管：原样放行给页面滚动与读屏，绝不 preventDefault' },
  ],
}
