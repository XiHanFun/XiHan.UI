import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const stepsAnatomy = createAnatomy('steps', [
  'root',
  'list',
  'item',
  'trigger',
  'indicator',
  'title',
  'description',
  'separator',
  'content',
])
