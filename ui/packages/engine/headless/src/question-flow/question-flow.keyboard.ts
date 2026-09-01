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
  ],
}
