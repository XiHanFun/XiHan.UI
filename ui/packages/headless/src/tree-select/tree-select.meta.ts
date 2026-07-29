import type { ComponentMeta } from '../spec/types'

// trigger、content 与 tree 必需：role=combobox 的两端、aria-controls 与键盘收口都靠它们。
// requiredParts 表达不了 item 与 branch 二选一，因此只钉 item。
// label/positioner/indicator/clear-trigger 与分支五件套可缺省，hidden-input 不写即不参与表单。
export const treeSelectMeta: ComponentMeta = {
  component: 'tree-select',
  requiredParts: ['trigger', 'content', 'tree', 'item'],
}
