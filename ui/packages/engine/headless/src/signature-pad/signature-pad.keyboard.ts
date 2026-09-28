/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 signature pad 相关实现。

import type { KeyboardTable } from '../spec/types'

// 画布本身不接键盘：签名是一段指针轨迹，用键盘复现不出来。
// 组件里的键盘落点是撤销、重做与清空三颗按钮，它们都是原生 button，键盘约定取自 APG 的按钮模式。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'

export const signaturePadKeyboard: KeyboardTable = {
  component: 'signature-pad',
  source: APG,
  rows: [
    {
      id: 'signature-pad.kbd.clear',
      keys: ['Enter', 'Space'],
      when: 'focus on clear-trigger, 未禁用且非只读',
      does: '清空整块画布；清空也是一步，可撤销找回；按钮是原生 button，这两个键由平台翻成 click',
    },
    {
      id: 'signature-pad.kbd.undo',
      keys: ['Enter', 'Space'],
      when: 'focus on undo-trigger, 未禁用且非只读，且有可撤销的一步',
      does: '撤销最近一步（一笔或一次清空）；没有可撤销的一步时按钮 aria-disabled，按下是空操作，焦点留在原处',
    },
    {
      id: 'signature-pad.kbd.redo',
      keys: ['Enter', 'Space'],
      when: 'focus on redo-trigger, 未禁用且非只读，且有被撤销的一步',
      does: '重做最近撤销的一步；再落一笔或清空后重做栈作废，按钮 aria-disabled',
    },
    {
      id: 'signature-pad.kbd.press',
      keys: ['Enter', 'Space'],
      when: 'held in clear-trigger / undo-trigger / redo-trigger, 未禁用、非只读且按钮可用',
      does: '按住期间投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下',
    },
  ],
}
