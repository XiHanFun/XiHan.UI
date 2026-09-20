/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 approval 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/'

export const approvalKeyboard: KeyboardTable = {
  component: 'approval',
  source: APG,
  rows: [
    { id: 'approval.kbd.approve', keys: ['Enter', 'Space'], when: '焦点在批准按钮上，待决、必选项已勾满、且不在挂起中', does: '判为批准，载荷带上已勾选的授权项' },
    { id: 'approval.kbd.deny', keys: ['Enter', 'Space'], when: '焦点在拒绝按钮上，待决且不在挂起中', does: '判为拒绝' },
    { id: 'approval.kbd.scope-toggle', keys: ['Space'], when: '焦点在授权项上，待决且该项未禁用', does: '勾选或取消该项。Enter 刻意不参与，与原生复选框一致' },
    { id: 'approval.kbd.press', keys: ['Enter', 'Space'], when: '按住批准或拒绝按钮，待决且不在挂起中；批准还要必选项已勾满', does: '按住期间该钮投影 data-pressed，与指针 :active 同一副按压面（text 档定尺按钮，按下缩放并换底）；抬起、失焦、判定落定或转入挂起撤下' },
    { id: 'approval.kbd.item-press', keys: ['Space'], when: '按住授权项，待决、不在挂起中且该项未禁用', does: '按住期间该行投影 data-pressed，与指针 :active 同一副按压面（row 档只换面不缩放）；抬起或失焦撤下。Enter 不是复选框的激活键，不进按压面' },
    { id: 'approval.kbd.escape', keys: ['Escape'], when: '焦点在闸门内，待决、未挂起、且开启 denyOnEscape', does: '判为拒绝。它不是关闭：本组件不提供不作答的出口' },
  ],
}
