import { createAnatomy } from '@xihan-ui/core'

export const paginationAnatomy = createAnatomy('pagination', [
  'root',
  // "第 x-y 条，共 z 条"这段信息，文本由 api.summaryText 给
  'summary',
  // 跳页输入框：敲页码回车即跳
  'jumper',
  'prev-trigger',
  'next-trigger',
  'item',
  'ellipsis-trigger',
  // 每页条数控制器的挂载点：里头装的是库里的 select，档位从 pageSizeOptions 来
  'page-size-select',
  // 摊开省略号的那一层。同时只开一个省略位，一份定位层就够
  'positioner',
  'content',
])
