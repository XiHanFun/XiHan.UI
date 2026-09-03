import { createAnatomy } from '@xihan-ui/kernel'

// root 是排序容器，item 是一项；item-drag-trigger 是那一项的拖拽手柄，
// 与 tabs 的 tab-drag-trigger、table 的 row-drag-trigger 同名同形——
// 拖谁就叫「谁 + drag-trigger」；live-region 播报拾起、挪位与落定。
export const sortableAnatomy = createAnatomy('sortable', [
  'root',
  'item',
  'item-drag-trigger',
  'live-region',
])
