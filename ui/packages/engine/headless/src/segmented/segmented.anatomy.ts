import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/kernel'

// item-text 是可选的文本壳：不写它时文字直接落在条目里，写了它状态标记才铺得到文字上。
// indicator 是那块会滑动的选中标记，hidden-input 是表单出口，两者都可以不渲染。
export const segmentedAnatomy = createAnatomy('segmented', [
  'root',
  'item',
  'item-text',
  'indicator',
  'hidden-input',
])

// 方向键导航与指示器量测共用的条目集合，只认 item；归属过滤保证嵌套的两组分段互不吞并
export const segmentedItemQuery: ItemQuery = { scope: segmentedAnatomy.name, part: 'item' }
