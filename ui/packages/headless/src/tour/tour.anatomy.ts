import { createAnatomy } from '@xihan-ui/kernel'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const tourAnatomy = createAnatomy('tour', [
  'root',
  'backdrop',
  'spotlight',
  'positioner',
  'content',
  'title',
  'description',
  'progress-text',
  'prev-trigger',
  'next-trigger',
  'skip-trigger',
  'close-trigger',
  'arrow',
])
