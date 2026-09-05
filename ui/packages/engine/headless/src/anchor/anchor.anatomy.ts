import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

export const anchorAnatomy = createAnatomy('anchor', [
  'root',
  'list',
  'item',
  'link',
  'indicator',
])

// 滚动结算与指示条定位的查询集合，只认 link
export const anchorItemQuery: ItemQuery = { scope: anchorAnatomy.name, part: 'link' }
