/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color slider 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/slider/'

// 键盘整份取自内嵌滑杆：一条通道一个拇指，步长是这一路的 step / largeStep。
export const colorSliderKeyboard: KeyboardTable = {
  component: 'color-slider',
  source: APG,
  rows: [
    { id: 'color-slider.kbd.increment', keys: ['ArrowRight', 'ArrowUp'], when: 'focus in thumb, not disabled/readOnly', does: '本通道按 step 增大；RTL 与竖直排布下按屏幕方向对调，语义恒是"朝 max 走一格"' },
    { id: 'color-slider.kbd.decrement', keys: ['ArrowLeft', 'ArrowDown'], when: 'focus in thumb, not disabled/readOnly', does: '本通道按 step 减小，同上对调规则' },
    { id: 'color-slider.kbd.large-increment', keys: ['PageUp'], when: 'focus in thumb, not disabled/readOnly', does: '按 largeStep 增大（各通道均为 10 格）' },
    { id: 'color-slider.kbd.large-decrement', keys: ['PageDown'], when: 'focus in thumb, not disabled/readOnly', does: '按 largeStep 减小' },
    { id: 'color-slider.kbd.min', keys: ['Home'], when: 'focus in thumb, not disabled/readOnly', does: '取本通道的 min' },
    { id: 'color-slider.kbd.max', keys: ['End'], when: 'focus in thumb, not disabled/readOnly', does: '取本通道的 max' },
  ],
}
