import { createAnatomy } from '@xihan-ui/core'

// 只有一个角色节点：那个 <time>。它同时承载给人看的文本与给机器读的 datetime。
export const timeAnatomy = createAnatomy('time', ['root'])
