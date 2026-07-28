import type { ComponentMeta } from '../spec/types'

// root 缺省则 nav 地标与 aria-label 无处安放；list/item 缺省就没有"共几项"这层结构；
// link 缺省则整个组件退化成一排按钮——条目是链接不是命令，这正是它与 Menu 的分野。
// trigger/content 成对可选：没有下拉的那几项就是一条光秃秃的链接。
// indicator 与 viewport 都是纯装饰，样式层用得上就写。
export const navigationMenuMeta: ComponentMeta = {
  component: 'navigation-menu',
  requiredParts: ['root', 'list', 'item', 'link'],
}
