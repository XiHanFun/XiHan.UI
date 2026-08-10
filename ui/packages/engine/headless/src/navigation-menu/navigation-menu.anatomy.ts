import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/kernel'

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

// 方向键的集合只认 trigger，归属过滤隔开嵌套的另一套导航菜单。
export const navigationMenuTriggerQuery: ItemQuery = { scope: navigationMenuAnatomy.name, part: 'trigger' }
