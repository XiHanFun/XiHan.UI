import { createAnatomy } from '@xihan-ui/kernel'

export const paginationAnatomy = createAnatomy('pagination', [
  'root',
  'prev-trigger',
  'next-trigger',
  'item',
  'ellipsis',
  // 摊开省略号的那一层。同时只开一个省略位，一份定位层就够
  'positioner',
  'content',
])
