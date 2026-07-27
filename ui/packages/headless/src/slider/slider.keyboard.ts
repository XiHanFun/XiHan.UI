import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction'

export const sliderKeyboard: KeyboardTable = {
  component: 'slider',
  source: APG,
  rows: [
    { id: 'slider.kbd.increment', keys: ['ArrowRight', 'ArrowUp'], when: 'focus in thumb, not disabled/readOnly', does: '按 step 增大；RTL 与竖直排布下按屏幕方向对调，语义恒是"朝 max 走一格"' },
    { id: 'slider.kbd.decrement', keys: ['ArrowLeft', 'ArrowDown'], when: 'focus in thumb, not disabled/readOnly', does: '按 step 减小，同上对调规则' },
    { id: 'slider.kbd.large-increment', keys: ['PageUp'], when: 'focus in thumb, not disabled/readOnly', does: '按 largeStep 增大（默认 10 倍 step）' },
    { id: 'slider.kbd.large-decrement', keys: ['PageDown'], when: 'focus in thumb, not disabled/readOnly', does: '按 largeStep 减小' },
    { id: 'slider.kbd.min', keys: ['Home'], when: 'focus in thumb, not disabled/readOnly', does: '取 min；多滑块时取自己被邻居允许的下界' },
    { id: 'slider.kbd.max', keys: ['End'], when: 'focus in thumb, not disabled/readOnly', does: '取 max；多滑块时取自己被邻居允许的上界' },
  ],
}
