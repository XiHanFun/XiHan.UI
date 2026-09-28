/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sortable 相关实现。

import type { KeyboardTable } from '../spec/types'

// APG 没有排序模式，键盘拖拽的规格出处是「键盘接口」这一节的通用约定：
// 每个可操作元素都要能只用键盘完成，且要有可撤销的退路。
// 跨列表的那两行沿用看板拖放的通行键位：拿起后本轴方向键在列表内挪，另一条轴上的方向键在相邻列表间挪。
const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/'

export const sortableKeyboard: KeyboardTable = {
  component: 'sortable',
  source: APG,
  rows: [
    { id: 'sortable.kbd.pickup', keys: ['Space', 'Enter'], when: 'focus in item-drag-trigger，未在拖动，not disabled', does: '拾起这一项，进入键盘拖动；播报它现在第几位、共几项、以及接下来能按什么' },
    { id: 'sortable.kbd.next', keys: ['ArrowDown', 'ArrowRight'], when: '键盘拖动中', does: '往后挪一位并播报新位置；已在末位时不动，也不回绕（挪进了同组别的列表时可以排到它的末项之后）。竖直排布认上下键、水平排布认左右键；另一条轴上的方向键未入组时原样放行，入组时归列表间移动' },
    { id: 'sortable.kbd.prev', keys: ['ArrowUp', 'ArrowLeft'], when: '键盘拖动中', does: '往前挪一位，规则同上；rtl 下左右两键对调，语义恒是「往前 / 往后」' },
    { id: 'sortable.kbd.next-list', keys: ['ArrowRight', 'ArrowDown'], when: '键盘拖动中，列表入了组（group），按的是另一条轴上的键：竖直排布认 ArrowRight、水平排布认 ArrowDown', does: '挪进组里文档序的下一个列表，位次尽量沿用、超出那个列表的长度就排到末尾；播报列表名、它在组里排第几与新位次。已是最后一个列表时不动，也不回绕；rtl 下竖直排布的左右两键对调' },
    { id: 'sortable.kbd.prev-list', keys: ['ArrowLeft', 'ArrowUp'], when: '键盘拖动中，列表入了组（group），按的是另一条轴上的键：竖直排布认 ArrowLeft、水平排布认 ArrowUp', does: '挪进组里文档序的上一个列表，规则同上' },
    { id: 'sortable.kbd.drop', keys: ['Space', 'Enter'], when: '键盘拖动中', does: '放下，按当前位置提交顺序并播报落点；落在同组别的列表里时发 transfer，播报落进了哪个列表的第几位' },
    { id: 'sortable.kbd.cancel', keys: ['Escape'], when: '键盘拖动中', does: '取消，顺序回到拾起前，悬着的别的列表撤掉让位；播报已取消与原位置' },
    { id: 'sortable.kbd.press', keys: ['Enter', 'Space'], when: 'held on item-drag-trigger, not disabled', does: '按住期间把手投影 data-pressed，与指针 :active 同一副按压面；拾起转拖动那一下即撤下（拖动中的回执是 data-dragging），抬起或失焦撤下' },
  ],
}
