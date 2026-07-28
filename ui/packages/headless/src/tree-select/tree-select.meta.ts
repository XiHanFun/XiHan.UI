import type { ComponentMeta } from '../spec/types'

// trigger 与 content 缺一即违约（role=combobox 与浮层的两端无从对接）；
// tree 缺了则 aria-controls 悬空、键盘也没有收口处。
// item 与 branch 至少得有一个，否则这棵树里一个 treeitem 都没有；requiredParts 表达不了「二选一」，
// 因此只钉 item——只有分支没有叶子的树在真实数据里几乎不存在，而全是叶子的平树是常见形态。
// label/positioner/indicator/clear-trigger 与分支五件套可缺省，hidden-input 不写即不参与表单。
export const treeSelectMeta: ComponentMeta = {
  component: 'tree-select',
  requiredParts: ['trigger', 'content', 'tree', 'item'],
}
