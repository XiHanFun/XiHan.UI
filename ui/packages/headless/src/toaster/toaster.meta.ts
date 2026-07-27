import type { ComponentMeta } from '../spec/types'

// root 承载地标语义，group 是通知真正落脚的那一摞：只写 root 不写 group，
// 队列里有东西也没地方渲染。
export const toasterMeta: ComponentMeta = {
  component: 'toaster',
  requiredParts: ['root', 'group'],
}
