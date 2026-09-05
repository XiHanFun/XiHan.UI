import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const sideNavAnatomy = createAnatomy('side-nav', [
  'root',
  'list',
  'item',
  'group',
  'group-label',
  'branch',
  'branch-trigger',
  'branch-text',
  'branch-indicator',
  'positioner',
  'branch-content',
  'link',
  'link-text',
])

// 方向键的集合由分支行与链接共同组成，归属过滤隔开嵌套的另一套侧栏。
export const sideNavTriggerQuery: ItemQuery = { scope: sideNavAnatomy.name, part: 'branch-trigger' }
export const sideNavLinkQuery: ItemQuery = { scope: sideNavAnatomy.name, part: 'link' }
