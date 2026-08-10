import { createAnatomy } from '@xihan-ui/kernel'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const popoverAnatomy = createAnatomy('popover', [
  'trigger',
  'positioner',
  'content',
  'title',
  'description',
  'close-trigger',
  'arrow',
])
