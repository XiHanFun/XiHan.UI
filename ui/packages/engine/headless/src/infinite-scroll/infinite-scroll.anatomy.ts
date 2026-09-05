import { createAnatomy } from '@xihan-ui/core'

// sentinel 是摆在列表末尾的哨兵：它一进可视区就说明快滚到底了，该取下一页。
// load-more-trigger 是同一条通路的另一个入口：一个真按钮，点它与哨兵进可视区走同一段。
export const infiniteScrollAnatomy = createAnatomy('infinite-scroll', ['root', 'sentinel', 'load-more-trigger'])
