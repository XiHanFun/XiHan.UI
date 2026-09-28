/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 drawer 相关实现。

import type { KeyboardTable } from '../spec/types'

// 抽屉的开合键盘契约与模态对话框逐条相同：它就是贴边渲染的对话框，
// side 只改滑入方向，不改任何一条按键语义。改尺把手另按窗口分隔条的模式推厚度。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction'

export const drawerKeyboard: KeyboardTable = {
  component: 'drawer',
  source: APG,
  rows: [
    { id: 'drawer.kbd.open-on-trigger', keys: ['Enter', 'Space'], when: 'focus in trigger', does: '打开抽屉并把焦点移入 content' },
    { id: 'drawer.kbd.escape', keys: ['Escape'], when: 'open', does: '关闭并把焦点还给 trigger', restoresFocus: true },
    { id: 'drawer.kbd.tab', keys: ['Tab'], when: 'open 且 modal', does: '在 content 内向后循环焦点' },
    { id: 'drawer.kbd.shift-tab', keys: ['Shift+Tab'], when: 'open 且 modal', does: '在 content 内向前循环焦点' },
    { id: 'drawer.kbd.press', keys: ['Enter', 'Space'], when: 'held in trigger / close-trigger', does: '按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或抽屉收起撤下' },
    { id: 'drawer.kbd.resize-step', keys: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'], when: 'focus in resize-trigger, resizable', does: '按屏幕方向推把手一步（8px）：推向页面那一侧变厚、推向贴边那一侧变薄；左右放置只认左右键、上下放置只认上下键；夹在上下限之间' },
    { id: 'drawer.kbd.resize-large', keys: ['Shift+ArrowLeft', 'Shift+ArrowRight', 'Shift+ArrowUp', 'Shift+ArrowDown'], when: 'focus in resize-trigger, resizable', does: '按大步长推（40px）' },
    { id: 'drawer.kbd.resize-bound', keys: ['Home', 'End'], when: 'focus in resize-trigger, resizable', does: 'Home 推到厚度下限，End 推到上限（没给上限时推到视口或所在容器能放下的最大厚度）' },
  ],
}
