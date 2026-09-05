import { createAnatomy } from '@xihan-ui/core'

export const alertAnatomy = createAnatomy('alert', [
  'root',
  'indicator',
  // 文本列：标题与说明摞成一列。不写它时两段文字直接坐在 root 的那一行上。
  'content',
  'title',
  'description',
  // 操作槽：圈出按钮区，按钮本身归作者。与 empty-state 的同名部件同一角色。
  'action',
  'close-trigger',
])
