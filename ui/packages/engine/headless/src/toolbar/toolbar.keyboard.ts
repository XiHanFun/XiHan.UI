/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toolbar 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/#keyboardinteraction'

// 一条工具条只占一个 Tab 位，条内靠方向键走。
// 条目自己的激活键不在表里，那是条目各自的规格，工具条不接管。
// 「更多」钮是方向键走位的最后一站，它弹出的菜单沿用菜单自己的键盘规格。
export const toolbarKeyboard: KeyboardTable = {
  component: 'toolbar',
  source: APG,
  rows: [
    { id: 'toolbar.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'roving tabindex（恒开）', does: '整条只占一个 Tab 位：焦点落到锚点条目，无锚点时先落容器再由它转投给第一个可停留条目' },
    { id: 'toolbar.kbd.next', keys: ['ArrowRight', 'ArrowDown'], when: '焦点在条内且未整条禁用；横排收 ArrowRight、竖排收 ArrowDown', does: '焦点移到下一个可停留条目（禁用项与收进菜单的条目跳过、放不下时「更多」钮排在最后、尽头按 loop 回绕）；dir=rtl 时水平主轴改由 ArrowLeft 承担' },
    { id: 'toolbar.kbd.prev', keys: ['ArrowLeft', 'ArrowUp'], when: '焦点在条内且未整条禁用；横排收 ArrowLeft、竖排收 ArrowUp', does: '焦点移到上一个可停留条目（禁用项与收进菜单的条目跳过、尽头按 loop 回绕）；dir=rtl 时水平主轴改由 ArrowRight 承担' },
    { id: 'toolbar.kbd.first', keys: ['Home'], when: '焦点在条内且未整条禁用', does: '焦点移到首个可停留条目' },
    { id: 'toolbar.kbd.last', keys: ['End'], when: '焦点在条内且未整条禁用', does: '焦点移到末个可停留条目；放不下时是「更多」钮' },
    { id: 'toolbar.kbd.press', keys: ['Enter', 'Space'], when: 'held on item, 整条未禁用且条目未禁用', does: '按住期间该条目投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或转禁用撤下。激活语义仍归条目自身（原生 button 的 click）' },
    { id: 'toolbar.kbd.overflow-open', keys: ['Enter', 'Space', 'ArrowDown', 'ArrowUp'], when: '焦点在「更多」钮上；竖排工具条里上下键仍归工具条走位，只收 Enter 与 Space', does: '展开「更多」菜单：Enter / Space / ArrowDown 落到首项，ArrowUp 落到末项；菜单里选中一项即替收起的条目触发它自己的点击，菜单收起' },
    { id: 'toolbar.kbd.overflow-close', keys: ['Escape'], when: '「更多」菜单展开', does: '收起菜单，焦点回到「更多」钮' },
    { id: 'toolbar.kbd.cross-axis', keys: ['交叉轴的两个方向键'], when: '焦点在条内（横排按上下、竖排按左右）', does: '不归工具条管：原样放行给页面滚动与读屏，绝不 preventDefault；落在菜单触发器（含「更多」钮）上时由触发器展开菜单' },
  ],
}
