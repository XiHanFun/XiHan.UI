import type { KeyboardTable } from '../spec/types'

// APG 没有排序模式，键盘拖拽的规格出处是「键盘接口」这一节的通用约定：
// 每个可操作元素都要能只用键盘完成，且要有可撤销的退路。
const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/'

export const sortableKeyboard: KeyboardTable = {
  component: 'sortable',
  source: APG,
  rows: [
    { id: 'sortable.kbd.pickup', keys: ['Space', 'Enter'], when: 'focus in item-handle，未在拖动，not disabled', does: '拾起这一项，进入键盘拖动；播报它现在第几位、共几项、以及接下来能按什么' },
    { id: 'sortable.kbd.next', keys: ['ArrowDown', 'ArrowRight'], when: '键盘拖动中', does: '往后挪一位并播报新位置；已在末位时不动，也不回绕。竖直排布认上下键、水平排布认左右键，另一条轴上的方向键原样放行' },
    { id: 'sortable.kbd.prev', keys: ['ArrowUp', 'ArrowLeft'], when: '键盘拖动中', does: '往前挪一位，规则同上；rtl 下左右两键对调，语义恒是「往前 / 往后」' },
    { id: 'sortable.kbd.drop', keys: ['Space', 'Enter'], when: '键盘拖动中', does: '放下，按当前位置提交顺序并播报落点' },
    { id: 'sortable.kbd.cancel', keys: ['Escape'], when: '键盘拖动中', does: '取消，顺序回到拾起前，播报已取消与原位置' },
  ],
}
