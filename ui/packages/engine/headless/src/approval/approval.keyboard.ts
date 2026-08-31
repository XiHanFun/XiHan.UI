import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/'

export const approvalKeyboard: KeyboardTable = {
  component: 'approval',
  source: APG,
  rows: [
    { id: 'approval.kbd.approve', keys: ['Enter', 'Space'], when: '焦点在批准按钮上，待决、必选项已勾满、且不在挂起中', does: '判为批准，载荷带上已勾选的授权项' },
    { id: 'approval.kbd.deny', keys: ['Enter', 'Space'], when: '焦点在拒绝按钮上且待决', does: '判为拒绝' },
    { id: 'approval.kbd.scope-toggle', keys: ['Space'], when: '焦点在授权项上，待决且该项未禁用', does: '勾选或取消该项。Enter 刻意不参与，与原生复选框一致' },
    { id: 'approval.kbd.escape', keys: ['Escape'], when: '焦点在闸门内且待决、且开着 denyOnEscape', does: '判为拒绝。**它不是「关闭」**——本组件不提供不作答的出口' },
  ],
}
