/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 radio group 相关实现。

import type { KeyboardTable } from '../spec/types'

// 三种形态（list / card / segmented）同一张键盘表，取自 APG 的 radio group：
// 整组一个 Tab 位、组内方向键走且焦点跟着选中走，Space 选中当前项；Enter 与 Home / End 都不归单选组管
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction'

export const radioGroupKeyboard: KeyboardTable = {
  component: 'radio-group',
  source: APG,
  rows: [
    { id: 'radio-group.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus outside the group', does: '整组只占一个 Tab 位：焦点进入锚点条目（即选中项）；落到容器上时由容器转投锚点条目，锚点缺席或被禁用才落首个可停留项' },
    { id: 'radio-group.kbd.next', keys: ['ArrowDown', 'ArrowRight'], when: 'focus in group, group not disabled', does: '焦点移到下一个可停留条目并选中（禁用条目跳过、尽头按 loop 回绕，缺省回绕到首项）；只读时焦点照走但不落值；dir=rtl 时改由 ArrowLeft 承担，未给 dir 时按祖先链上的书写方向' },
    { id: 'radio-group.kbd.prev', keys: ['ArrowUp', 'ArrowLeft'], when: 'focus in group, group not disabled', does: '焦点移到上一个可停留条目并选中（尽头按 loop 回绕，缺省回绕到末项）；只读时焦点照走但不落值；dir=rtl 时改由 ArrowRight 承担' },
    { id: 'radio-group.kbd.select', keys: ['Space'], when: 'focus on item, item not disabled', does: '选中当前条目；Enter 不是 role=radio 的激活键，按下不选中' },
    { id: 'radio-group.kbd.press', keys: ['Space'], when: 'held on item, 条目未禁用且组未禁用、非只读', does: '按住期间该条目投影 data-pressed，与指针 :active 同一副按压面（list / card 的行与圆圈一起换面，segmented 的段换到按下面）；抬起或失焦撤下，按住途中整组转入禁用或只读也撤下。Enter 不进按压面；选中与按压互相独立' },
  ],
}
