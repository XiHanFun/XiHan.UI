/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color picker 相关实现。

import type { KeyboardTable } from '../spec/types'

// APG 无取色器模式：取色区按滑杆模式办，浮层部分按对话框模式办；
// 色相 / 透明度两条滑块与预设色板的键盘各归 color-slider 与 color-swatch-picker 那两张表。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction'

export const colorPickerKeyboard: KeyboardTable = {
  component: 'color-picker',
  source: APG,
  rows: [
    {
      id: 'color-picker.kbd.area-saturation',
      keys: ['ArrowRight', 'ArrowLeft'],
      when: 'focus in area-thumb, not disabled/readOnly',
      does: '按 1 调饱和度；RTL 下左右对调，语义恒是"朝饱和走一格"',
    },
    {
      id: 'color-picker.kbd.area-brightness',
      keys: ['ArrowUp', 'ArrowDown'],
      when: 'focus in area-thumb, not disabled/readOnly',
      does: '按 1 调明度，屏幕向上恒是变亮，与 dir 无关',
    },
    {
      id: 'color-picker.kbd.area-large-step',
      keys: ['Shift+ArrowRight', 'Shift+ArrowLeft', 'Shift+ArrowUp', 'Shift+ArrowDown'],
      when: 'focus in area-thumb, not disabled/readOnly',
      does: '同上，但一步走 10',
    },
    {
      id: 'color-picker.kbd.area-edge',
      keys: ['Home', 'End'],
      when: 'focus in area-thumb, not disabled/readOnly',
      does: '饱和度取 0 / 100（与 aria-valuenow 报的是同一条轴）',
    },
    {
      id: 'color-picker.kbd.input-commit',
      keys: ['Enter'],
      when: 'focus in channel-input',
      does: '收下框里的字；收不了就保留草稿并报告输入错误。一并拦住表单提交',
    },
    {
      id: 'color-picker.kbd.escape',
      keys: ['Escape'],
      when: 'open（本层在层栈顶）',
      does: '收起浮层，焦点归还触发器',
      restoresFocus: true,
    },
  ],
}
