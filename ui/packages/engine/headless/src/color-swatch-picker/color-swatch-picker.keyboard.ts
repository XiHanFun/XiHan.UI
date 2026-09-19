/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color swatch picker 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction'

// 与单选组同一套：整组一个 Tab 位，方向键移焦点并选中，Space 选中。
export const colorSwatchPickerKeyboard: KeyboardTable = {
  component: 'color-swatch-picker',
  source: APG,
  rows: [
    { id: 'color-swatch-picker.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus outside the group', does: '整组只占一个 Tab 位：焦点进入锚点格子（即选中的那格）；落到容器上时由容器转投锚点格子，锚点缺席或被禁用才落首个可停留格' },
    { id: 'color-swatch-picker.kbd.next', keys: ['ArrowDown', 'ArrowRight'], when: 'focus in group, group not disabled', does: '焦点移到下一个可停留格并选中，末格回绕到首格；dir=rtl 时改由 ArrowLeft 承担' },
    { id: 'color-swatch-picker.kbd.prev', keys: ['ArrowUp', 'ArrowLeft'], when: 'focus in group, group not disabled', does: '焦点移到上一个可停留格并选中，首格回绕到末格；dir=rtl 时改由 ArrowRight 承担' },
    { id: 'color-swatch-picker.kbd.select', keys: ['Space'], when: 'focus on item, item not disabled', does: '选中当前格' },
    { id: 'color-swatch-picker.kbd.press', keys: ['Space'], when: 'held on item, 格子未禁用且组未禁用、非只读', does: '按住期间该格投影 data-pressed，与指针 :active 同一副按压面（换描边并缩放）；抬起或失焦撤下，按住途中整组转入禁用或只读也撤下。Enter 不是 radio 的激活键，按住它没有按压面' },
  ],
}
