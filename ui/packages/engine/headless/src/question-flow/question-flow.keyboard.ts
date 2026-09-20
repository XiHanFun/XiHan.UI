/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 question flow 相关实现。

import type { KeyboardTable } from '../spec/types'

// 一题里的选项就是一组单选或一组复选，键盘约定取自 APG 的 radiogroup：
// 整组一个 Tab 位、组内方向键走且单选时焦点跟着选中走。
// 上一题 / 下一题只给按钮入口，不吃全局按键——那会和选项漫游抢同一批方向键。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction'

export const questionFlowKeyboard: KeyboardTable = {
  component: 'question-flow',
  source: APG,
  rows: [
    { id: 'question-flow.kbd.next-option', keys: ['ArrowDown', 'ArrowRight'], when: '焦点在当前题的选项上', does: '焦点移到下一个可停留选项（禁用项跳过、尽头按 loop 回绕）；单选时同时选中它' },
    { id: 'question-flow.kbd.prev-option', keys: ['ArrowUp', 'ArrowLeft'], when: '焦点在当前题的选项上', does: '焦点移到上一个可停留选项；单选时同时选中它' },
    { id: 'question-flow.kbd.first-option', keys: ['Home'], when: '焦点在当前题的选项上', does: '焦点移到首个可停留选项；单选时同时选中它' },
    { id: 'question-flow.kbd.last-option', keys: ['End'], when: '焦点在当前题的选项上', does: '焦点移到末个可停留选项；单选时同时选中它' },
    { id: 'question-flow.kbd.toggle', keys: ['Space'], when: '焦点在当前题的选项上', does: '切换该项。单选点已选中的那一项不取消' },
    { id: 'question-flow.kbd.advance', keys: ['Enter'], when: '焦点在当前题的选项或自由文本上，且这一题答得能往下走', does: '前进一题；已经在末题就交卷' },
    { id: 'question-flow.kbd.item-press', keys: ['Space'], when: '按住当前题的未禁用选项', does: '按住期间该选项投影 data-pressed，与指针 :active 同一副按压面（row 档只换面不缩放）；抬起、失焦、换题或交卷撤下。Enter 不是选项的激活键，不进按压面' },
    { id: 'question-flow.kbd.press', keys: ['Enter', 'Space'], when: '按住未禁用的上一题 / 下一题 / 跳过 / 继续（发送）按钮', does: '按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦、换题或交卷撤下' },
  ],
}
