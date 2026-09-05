import { createAnatomy } from '@xihan-ui/core'

export const collapsibleAnatomy = createAnatomy('collapsible', [
  'root',
  // 触发器与其同排内容（说明、操作钮）的那一行；只写触发器时可以不渲染它
  'header',
  'trigger',
  'content',
  // 触发器里表示开合方向的标记，皮肤按 data-state 转向；作者塞了自己的图形即以作者的为准
  'indicator',
])
