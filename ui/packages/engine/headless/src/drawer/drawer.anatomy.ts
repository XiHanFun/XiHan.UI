import { createAnatomy } from '@xihan-ui/core'

// data-part 用 kebab-case，与 CSS 选择器一致。
// content 会被 portal 到 body，root 留在页面原地承载 data-side。
export const drawerAnatomy = createAnatomy('drawer', [
  'root',
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
