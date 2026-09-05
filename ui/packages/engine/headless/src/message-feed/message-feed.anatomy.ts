import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// root 是最外层，承载容器兜底的 Tab 位与键盘模型；viewport 是 overflow:auto 的那层；
// list 是内容包裹层，条目必须是它的直接子节点；item 是一条消息（role=article）；
// item-label 是作者名那一格，渲了它就成为该条消息的可访问名；
// scroll-to-end-trigger 是回到底部；live-region 是视觉隐藏的原子播报区。
export const messageFeedAnatomy = createAnatomy('message-feed', [
  'root',
  'viewport',
  'list',
  'item',
  'item-label',
  'scroll-to-end-trigger',
  'live-region',
])

/** 条目集合的查询式，导航与锚点都以它取活 DOM。 */
export const messageFeedItemQuery: ItemQuery = { scope: 'message-feed', part: 'item' }
