import { createAnatomy } from '@xihan-ui/core'

// viewport 是滚动容器，content 是所有行的包裹层与尺寸观察目标，line 是一行日志。
export const logAnatomy = createAnatomy('log', [
  'root',
  'viewport',
  'content',
  'line',
])
