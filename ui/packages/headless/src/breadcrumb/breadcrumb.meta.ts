import type { ComponentMeta } from '../spec/types'

// root 缺省则 nav 地标与 aria-label 无处安放；list/item 缺省就没有"第几层，共几层"这层结构；
// link 缺省则 aria-current 无处落脚，整条路径退化成一串静态文字。
// separator 与 ellipsis 都是可选装饰：分隔符常常由 CSS 画，中间层级也未必需要折叠。
export const breadcrumbMeta: ComponentMeta = {
  component: 'breadcrumb',
  requiredParts: ['root', 'list', 'item', 'link'],
}
