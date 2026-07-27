import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const menuAnatomy = createAnatomy('menu', [
  'trigger',
  'positioner',
  'content',
  'item',
  'separator',
  'arrow',
])

// 集合只认 item：separator 同样带 data-scope，但不入导航，方向键不会停在分隔线上。
export const menuItemQuery: ItemQuery = { scope: menuAnatomy.name, part: 'item' }
