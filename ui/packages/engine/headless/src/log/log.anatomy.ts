import { createAnatomy } from '@xihan-ui/kernel'

// viewport 是滚动容器，content 是所有行的包裹层与尺寸观察目标，line 是一行日志，
// scroll-to-end-trigger 是回到底部按钮，live-region 是视觉隐藏的播报区。
export const logAnatomy = createAnatomy('log', [
  'root',
  'viewport',
  'content',
  'line',
  'scroll-to-end-trigger',
  'live-region',
])
