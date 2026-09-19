/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 number field 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction'

export const numberFieldKeyboard: KeyboardTable = {
  component: 'number-field',
  source: APG,
  rows: [
    { id: 'number-field.kbd.increment', keys: ['ArrowUp'], when: 'focus in input, not disabled/readOnly', does: '按 step 递增，越界则停在 max' },
    { id: 'number-field.kbd.decrement', keys: ['ArrowDown'], when: 'focus in input, not disabled/readOnly', does: '按 step 递减，越界则停在 min' },
    { id: 'number-field.kbd.large-increment', keys: ['PageUp'], when: 'focus in input, not disabled/readOnly', does: '按 largeStep 递增（默认 10 倍 step）' },
    { id: 'number-field.kbd.large-decrement', keys: ['PageDown'], when: 'focus in input, not disabled/readOnly', does: '按 largeStep 递减' },
    { id: 'number-field.kbd.min', keys: ['Home'], when: 'focus in input, 指定了 min', does: '取 min；未指定 min 时不动' },
    { id: 'number-field.kbd.max', keys: ['End'], when: 'focus in input, 指定了 max', does: '取 max；未指定 max 时不动' },
    {
      id: 'number-field.kbd.press',
      keys: ['Enter', 'Space'],
      when: 'held in increment-trigger / decrement-trigger, not disabled/readOnly, 该侧未贴住端点',
      does: '按住期间这颗钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，值贴到端点后按钮转 disabled 一并撤下。步进仍由激活时的 click 走一步，按住不连发。两颗钮不占 Tab 位，键盘这一路只在焦点落到它身上时有面',
    },
  ],
}
