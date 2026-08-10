import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/'

// 条目是链接不是命令，因此不做 roving tabindex：每个 trigger 都留在 Tab 序列里。
export const navigationMenuKeyboard: KeyboardTable = {
  component: 'navigation-menu',
  source: APG,
  rows: [
    { id: 'navigation-menu.kbd.next', keys: ['ArrowRight', 'ArrowDown'], when: 'focus in trigger, 按键与 orientation 同轴', does: '焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；随后的自动展开走 delayDuration' },
    { id: 'navigation-menu.kbd.prev', keys: ['ArrowLeft', 'ArrowUp'], when: 'focus in trigger, 按键与 orientation 同轴', does: '焦点移到上一个 trigger' },
    { id: 'navigation-menu.kbd.first', keys: ['Home'], when: 'focus in trigger', does: '焦点移到首个可停留 trigger' },
    { id: 'navigation-menu.kbd.last', keys: ['End'], when: 'focus in trigger', does: '焦点移到末个可停留 trigger' },
    { id: 'navigation-menu.kbd.toggle', keys: ['Enter', 'Space'], when: 'focus in trigger, not disabled', does: '立即展开对应面板（不走 delayDuration）；面板是自动弹出来的那一次不收起，再按一次才收起' },
    { id: 'navigation-menu.kbd.escape', keys: ['Escape'], when: 'open', does: '收起面板并把焦点归还对应 trigger；静默窗口内这一次归还不会把面板重新弹出来' },
    { id: 'navigation-menu.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'open, focus in trigger', does: '走进展开的面板：面板就在 trigger 之后，收起的面板带 hidden 因而被整个跳过' },
  ],
}
