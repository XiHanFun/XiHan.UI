/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 navigation menu 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/'

// 条目是链接不是命令，因此不做 roving tabindex：每个 trigger 都留在 Tab 序列里。
// 面板里的子级同是 disclosure：开关是原生按钮，子级紧跟其后，Tab 顺着文档序走进去。
export const navigationMenuKeyboard: KeyboardTable = {
  component: 'navigation-menu',
  source: APG,
  rows: [
    { id: 'navigation-menu.kbd.press', keys: ['Enter', 'Space'], when: 'held on trigger / branch-trigger / link, 导航未禁用且条目未禁用', does: '按住期间入口、子级开关或面板链接投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，子级开关与链接随面板收起一并撤下。开合与激活语义照旧由这一次按键承担' },
    { id: 'navigation-menu.kbd.next', keys: ['ArrowRight', 'ArrowDown'], when: 'focus in trigger, 按键与 orientation 同轴', does: '焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；随后的自动展开走 delayDuration' },
    { id: 'navigation-menu.kbd.prev', keys: ['ArrowLeft', 'ArrowUp'], when: 'focus in trigger, 按键与 orientation 同轴', does: '焦点移到上一个 trigger' },
    { id: 'navigation-menu.kbd.first', keys: ['Home'], when: 'focus in trigger', does: '焦点移到首个可停留 trigger' },
    { id: 'navigation-menu.kbd.last', keys: ['End'], when: 'focus in trigger', does: '焦点移到末个可停留 trigger' },
    { id: 'navigation-menu.kbd.toggle', keys: ['Enter', 'Space'], when: 'focus in trigger, not disabled', does: '立即展开对应面板（不走 delayDuration）；面板是自动弹出来的那一次不收起，再按一次才收起' },
    { id: 'navigation-menu.kbd.branch-toggle', keys: ['Enter', 'Space'], when: 'focus in branch-trigger, not disabled', does: '展开或收起面板里的这一枝子级，焦点留在开关上；同一张面板只展开一枝，展开这一枝时另一枝收起。子级紧跟在开关之后，展开后 Tab 走进去，收着时带 hidden 被整段跳过' },
    { id: 'navigation-menu.kbd.branch-escape', keys: ['Escape'], when: 'focus in 展开的 branch-content', does: '只收起这一枝子级并把焦点归还它的 branch-trigger，面板仍开着；再按一次 Escape 才收起面板', restoresFocus: true },
    { id: 'navigation-menu.kbd.escape', keys: ['Escape'], when: 'open, 焦点不在展开的 branch-content 里', does: '收起面板并把焦点归还对应 trigger；静默窗口内这一次归还不会把面板重新弹出来', restoresFocus: true },
    { id: 'navigation-menu.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'open, focus in trigger', does: '走进展开的面板：面板就在 trigger 之后，收起的面板带 hidden 因而被整个跳过' },
  ],
}
