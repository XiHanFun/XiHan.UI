/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tabs 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction'

export const tabsKeyboard: KeyboardTable = {
  component: 'tabs',
  source: APG,
  rows: [
    { id: 'tabs.kbd.next', keys: ['ArrowRight', 'ArrowDown'], when: 'focus in list, 按键与 orientation 同轴', does: '焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；automatic 模式顺带切换选中' },
    { id: 'tabs.kbd.prev', keys: ['ArrowLeft', 'ArrowUp'], when: 'focus in list, 按键与 orientation 同轴', does: '焦点移到上一个 trigger；automatic 模式顺带切换选中' },
    { id: 'tabs.kbd.first', keys: ['Home'], when: 'focus in list', does: '焦点移到首个可停留 trigger' },
    { id: 'tabs.kbd.last', keys: ['End'], when: 'focus in list', does: '焦点移到末个可停留 trigger' },
    { id: 'tabs.kbd.activate', keys: ['Enter', 'Space'], when: 'focus in trigger, not disabled', does: '把选中切到焦点所在 trigger（manual 模式的确认键）' },
    { id: 'tabs.kbd.press', keys: ['Enter', 'Space'], when: 'held in trigger, not disabled', does: '按住期间该 trigger 投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下。选中与按压互相独立，确认语义照旧由这一次按键承担' },
    { id: 'tabs.kbd.close', keys: ['Delete', 'Backspace'], when: 'focus in trigger, closable 开启, not disabled', does: '关闭焦点所在标签：发 onTabClose（被关的标签与剩余标签序），与点 close-trigger 同一个意图；库不改标签序，标签由数据源删掉' },
    { id: 'tabs.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus in list', does: '整组只有锚点 trigger 留在 Tab 序列内，一次 Tab 进出；无锚点时由 list 兜底，焦点进来后转投锚点 trigger（即选中项），锚点缺席或被禁用才落首个可停留项' },
    { id: 'tabs.kbd.overflow-stop', keys: ['Tab', 'Shift+Tab'], when: '标签带放不下、「更多」钮露面', does: '「更多」钮在标签带之后自占一个 Tab 位：从标签带往后 Tab 先落到它、再到面板。它在 tablist 之外、不是方向键走位的一站，方向键只在标签之间走，尽头按 loop 回绕到另一端的标签' },
    { id: 'tabs.kbd.overflow-open', keys: ['Enter', 'Space', 'ArrowDown', 'ArrowUp'], when: '焦点在「更多」钮上', does: '展开「更多」下拉：Enter / Space / ArrowDown 落到首项，ArrowUp 落到末项；下拉里选中一项即选中那个标签并把它挪进可见区，下拉收起、焦点回到钮上' },
    { id: 'tabs.kbd.overflow-close', keys: ['Escape'], when: '「更多」下拉展开', does: '收起下拉，焦点回到「更多」钮' },
    { id: 'tabs.kbd.tab-move', keys: ['Alt+ArrowLeft', 'Alt+ArrowRight', 'Alt+ArrowUp', 'Alt+ArrowDown'], when: 'focus in list, reorderable 开启, 按键与 orientation 同轴', does: '把焦点标签在标签带里往前 / 往后挪一位，按一下就是一次完整提交，不进拖动态；横轴跟着文字方向翻、rtl 下左右两键对调，竖排的上下两键不对调；已是首位 / 末位就不动，也不回绕；标签序不进库，只报一次重排好的新顺序。裸方向键仍是导航、Enter/Space 仍是确认' },
  ],
}
