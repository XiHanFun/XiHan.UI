import { createAnatomy } from '@xihan-ui/core'

// viewport 是滚动容器，content 是内容包裹层，scroll-button 是回到底部按钮，
// live-region 是视觉隐藏的播报区。
export const threadAnatomy = createAnatomy('thread', [
  'root',
  'viewport',
  'content',
  'scroll-button',
  'live-region',
])
