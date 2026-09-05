import { createAnatomy } from '@xihan-ui/core'

export const breadcrumbAnatomy = createAnatomy('breadcrumb', [
  'root',
  'list',
  'item',
  'link',
  // 链接里的图标位，与文字并排；纯装饰，不进读屏
  'link-icon',
  'separator',
  'ellipsis',
])
