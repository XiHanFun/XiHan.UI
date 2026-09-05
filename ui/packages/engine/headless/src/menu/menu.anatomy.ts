import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const menuAnatomy = createAnatomy('menu', [
  'trigger',
  'positioner',
  'content',
  'item',
  'separator',
  'group',
  'group-label',
  'arrow',
])

// 导航集合只认 item。
export const menuItemQuery: ItemQuery = { scope: menuAnatomy.name, part: 'item' }
