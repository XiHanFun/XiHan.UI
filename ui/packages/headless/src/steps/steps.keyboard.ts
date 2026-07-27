import type { KeyboardTable } from '../spec/types'

// APG 没有 steps 模式：步骤条的交互形态就是一排触发器切一组面板，
// 键盘约定因此照 tabs 模式来（roving tabindex + 方向键 + Home/End），
// 区别只在方向键不切换步序——切步骤往往要跑校验、发请求，不能跟着焦点自动发生。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction'

export const stepsKeyboard: KeyboardTable = {
  component: 'steps',
  source: APG,
  rows: [
    { id: 'steps.kbd.next', keys: ['ArrowRight', 'ArrowDown'], when: 'focus in list, 按键与 orientation 同轴', does: '焦点移到下一个可停留 trigger（禁用与 linear 未解锁的跳过，尽头不回绕）；步序不变' },
    { id: 'steps.kbd.prev', keys: ['ArrowLeft', 'ArrowUp'], when: 'focus in list, 按键与 orientation 同轴', does: '焦点移到上一个可停留 trigger；步序不变' },
    { id: 'steps.kbd.first', keys: ['Home'], when: 'focus in list', does: '焦点移到首个可停留 trigger' },
    { id: 'steps.kbd.last', keys: ['End'], when: 'focus in list', does: '焦点移到末个可停留 trigger' },
    { id: 'steps.kbd.activate', keys: ['Enter', 'Space'], when: 'focus in trigger, 未禁用且已解锁', does: '把当前步切到焦点所在的那一步' },
    { id: 'steps.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus in list', does: '整组只有锚点 trigger 留在 Tab 序列内，一次 Tab 进出；无锚点时由 list 兜底' },
  ],
}
