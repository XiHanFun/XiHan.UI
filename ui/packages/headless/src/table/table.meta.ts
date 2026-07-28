import type { ComponentMeta } from '../spec/types'

// root 与 body 缺一即违约：role=grid、行列总数与键盘入口全在这两个部件身上。
// row 不列为必备——空表是正常态（此时该显形的是 empty-state）；
// header / footer / caption 与两个状态节点同样可缺省，
// 无标题的表由 aria-label 一类的作者属性顶上。
export const tableMeta: ComponentMeta = {
  component: 'table',
  requiredParts: ['root', 'body'],
}
