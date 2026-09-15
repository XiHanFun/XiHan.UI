/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 resizable 相关实现。

import type { KeyboardTable } from '../spec/types'

// APG 的窗口分隔条模式讲的是「用键盘推动一条边」，与这里同构。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/#keyboardinteraction'

export const resizableKeyboard: KeyboardTable = {
  component: 'resizable',
  source: APG,
  rows: [
    { id: 'resizable.kbd.push', keys: ['ArrowRight', 'ArrowDown'], when: 'focus in handle, not disabled', does: '按屏幕方向推动该边一步（默认 8px）：推东边是变宽、推西边是变窄，与拖动同义。按的是屏幕方向，rtl 下两键不对调：此时改由行尾侧的边落在屏幕左边来体现' },
    { id: 'resizable.kbd.pull', keys: ['ArrowLeft', 'ArrowUp'], when: 'focus in handle, not disabled', does: '往反方向推一步，规则同上' },
    { id: 'resizable.kbd.large', keys: ['Shift+ArrowRight', 'Shift+ArrowLeft', 'Shift+ArrowUp', 'Shift+ArrowDown'], when: 'focus in handle, not disabled', does: '按大步长推（默认 40px）' },
    { id: 'resizable.kbd.min', keys: ['Home'], when: 'focus in handle, not disabled', does: '把这条边推到它眼下能到的最小尺寸' },
    { id: 'resizable.kbd.max', keys: ['End'], when: 'focus in handle, not disabled', does: '推到最大尺寸；未提供上限时不动' },
    { id: 'resizable.kbd.cancel', keys: ['Escape'], when: '调整中', does: '放弃这一次调整，尺寸与位移退回按下那一刻；收尾回调不发' },
  ],
}
