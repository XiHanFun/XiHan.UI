import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const listAnatomy = createAnatomy('list', [
  'root',
  'item',
  'item-media',
  'item-content',
  'item-title',
  'item-description',
  'item-action',
])
