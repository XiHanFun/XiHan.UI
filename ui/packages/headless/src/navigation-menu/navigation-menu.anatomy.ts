import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const navigationMenuAnatomy = createAnatomy('navigation-menu', [
  'root',
  'list',
  'item',
  'trigger',
  'content',
  'link',
  'indicator',
  'viewport',
])

// 方向键的集合只认 trigger：link 同样带 data-scope，但它住在展开的面板里，
// 不该被顶层的方向键当成兄弟节点收进来。
// 归属过滤保证嵌套的另一套导航菜单不会被外层吞并。
export const navigationMenuTriggerQuery: ItemQuery = { scope: navigationMenuAnatomy.name, part: 'trigger' }
