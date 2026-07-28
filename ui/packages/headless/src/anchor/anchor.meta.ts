import type { ComponentMeta } from '../spec/types'

// root 缺省则 nav 地标与 aria-label 无处安放；list/item 缺省就没有"共几节"这层结构；
// link 缺省则整个组件不存在（既没有可点的去处，也没有 aria-current 的落脚点）。
// indicator 是纯装饰，样式层用得上就写，用不上可以整个不渲染。
export const anchorMeta: ComponentMeta = {
  component: 'anchor',
  requiredParts: ['root', 'list', 'item', 'link'],
}
