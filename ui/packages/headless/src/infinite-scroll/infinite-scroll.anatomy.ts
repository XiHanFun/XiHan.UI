import { createAnatomy } from '@xihan-ui/kernel'

// sentinel 是摆在列表末尾的哨兵：它一进可视区就说明快滚到底了，该取下一页。
export const infiniteScrollAnatomy = createAnatomy('infinite-scroll', ['root', 'sentinel'])
