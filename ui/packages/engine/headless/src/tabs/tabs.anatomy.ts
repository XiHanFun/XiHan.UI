import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

export const tabsAnatomy = createAnatomy('tabs', [
  'root',
  'list',
  'trigger',
  // 选中标签下的那条滑条：主轴位置与长度由机器量好写成内联样式
  'indicator',
  // 标签之间的细分隔线，纯装饰
  'separator',
  'content',
  'tab-drag-trigger',
  'live-region',
])

// 指示条量测的查询集合，只认 trigger
export const tabsTriggerQuery: ItemQuery = { scope: tabsAnatomy.name, part: 'trigger' }
