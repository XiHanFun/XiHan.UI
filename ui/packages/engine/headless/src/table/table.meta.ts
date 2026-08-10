import type { ComponentMeta } from '../spec/types'

// root 与 body 必备：grid 系角色、行列总数与键盘入口都在这两个部件上。
// row 不列为必备（空表是正常态）；header / footer / caption 与两个状态节点同样可缺省。
export const tableMeta: ComponentMeta = {
  component: 'table',
  requiredParts: ['root', 'body'],
}
