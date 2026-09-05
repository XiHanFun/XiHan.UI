import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const pageHeaderAnatomy = createAnatomy('page-header', [
  'root',
  // 面包屑整行排在标题之上，头像/图标排在返回位与标题之间；两块都可缺省。
  'breadcrumb',
  'back-trigger',
  'media',
  'title',
  'description',
  'extra',
  'footer',
])
