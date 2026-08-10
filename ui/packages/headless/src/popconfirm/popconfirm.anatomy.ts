import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const popconfirmAnatomy = createAnatomy('popconfirm', [
  'root',
  'trigger',
  'positioner',
  'content',
  'title',
  'description',
  'confirm-trigger',
  'cancel-trigger',
])
