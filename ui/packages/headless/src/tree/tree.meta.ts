import type { ComponentMeta } from '../spec/types'

// tree 缺一即违约（role=tree、可及名字与键盘入口全在它身上）。
// item 与 branch 至少得有一个，否则这棵树里一个 treeitem 都没有；requiredParts 表达不了"二选一"，
// 因此只钉 item——只有分支没有叶子的树在真实数据里几乎不存在，而全是叶子的平树是常见形态。
// root/label 与分支五件套可缺省：无标题的树由 aria-label 一类的作者属性顶上。
export const treeMeta: ComponentMeta = {
  component: 'tree',
  requiredParts: ['tree', 'item'],
}
