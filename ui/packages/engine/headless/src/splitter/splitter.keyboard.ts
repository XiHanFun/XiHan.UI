import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/#keyboardinteraction'

export const splitterKeyboard: KeyboardTable = {
  component: 'splitter',
  source: APG,
  rows: [
    { id: 'splitter.kbd.grow', keys: ['ArrowRight', 'ArrowDown'], when: 'focus in resize-trigger, not disabled', does: '把这条分隔条前面那块面板按 step（默认 1%）撑大；水平排布认左右键、竖直排布认上下键，另一条轴上的方向键原样放行' },
    { id: 'splitter.kbd.shrink', keys: ['ArrowLeft', 'ArrowUp'], when: 'focus in resize-trigger, not disabled', does: '按 step 压小，同上的轴向规则；rtl 下左右两键对调，语义恒是"撑大 / 压小前一块"' },
    { id: 'splitter.kbd.large-grow', keys: ['Shift+ArrowRight', 'Shift+ArrowDown'], when: 'focus in resize-trigger, not disabled', does: '按 largeStep（默认 10%）撑大' },
    { id: 'splitter.kbd.large-shrink', keys: ['Shift+ArrowLeft', 'Shift+ArrowUp'], when: 'focus in resize-trigger, not disabled', does: '按 largeStep 压小' },
    { id: 'splitter.kbd.min', keys: ['Home'], when: 'focus in resize-trigger, not disabled', does: '把前一块面板收到它眼下能到的最小尺寸' },
    { id: 'splitter.kbd.max', keys: ['End'], when: 'focus in resize-trigger, not disabled', does: '把前一块面板撑到它眼下能到的最大尺寸' },
    { id: 'splitter.kbd.toggle', keys: ['Enter'], when: 'focus in resize-trigger 且它调整的面板 collapsible，not disabled', does: '折叠 / 展开该面板；展开回到折叠前的尺寸。面板不可折叠时不接这个键' },
  ],
}
