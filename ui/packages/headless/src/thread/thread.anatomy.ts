import { createAnatomy } from '@xihan-ui/core'

// 分工：viewport 是真正 overflow:auto 的那层，粘底的监听与归位都落在它身上；
// content 只是内容包裹层，尺寸变化观察它（消息一段段长出来就是它在变高）；
// scroll-button 是脱离底部后才露出的"回到底部"；
// live-region 是一块视觉上藏起来的播报区，与 viewport 分开正是为了让播报可控——
// viewport 自己恒不播报，整段最终文本由宿主在流结束时写进 live-region。
export const threadAnatomy = createAnatomy('thread', [
  'root',
  'viewport',
  'content',
  'scroll-button',
  'live-region',
])
