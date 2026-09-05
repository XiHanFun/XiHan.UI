import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const dialogAnatomy = createAnatomy('dialog', [
  'trigger',
  'backdrop',
  'positioner',
  'content',
  'header',
  'title',
  'description',
  'body',
  'footer',
  'close-trigger',
])
