import { createAnatomy } from '@xihan-ui/kernel'

export const collapsibleAnatomy = createAnatomy('collapsible', [
  'root',
  'trigger',
  'content',
  // 触发器里表示开合方向的标记，皮肤按 data-state 转向；作者塞了自己的图形即以作者的为准
  'indicator',
])
