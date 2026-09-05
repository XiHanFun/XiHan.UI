import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// 三个角色节点：root 是整副瀑布流的容器，column 是一列，item 是落在某一列里的一项。
// 列由适配器按当前档位铺出来，项由适配器按量到的高度放进某一列。
export const masonryAnatomy = createAnatomy('masonry', ['root', 'column', 'item'])

/** 项集合的查询式。量高度时才查活 DOM，归属过滤保证嵌套的两副瀑布流互不吞并。 */
export const masonryItemQuery: ItemQuery = { scope: masonryAnatomy.name, part: 'item' }
