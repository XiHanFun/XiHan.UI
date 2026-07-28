import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
//
// 两侧面板各是一个独立的 part（source-panel / target-panel），面板内部的角色节点
// 则两侧共用同一个 part 名（panel-header / list / item ……），由 data-side 区分。
// 这样写是因为两侧的骨架完全一样：分成 source-list / target-list 会把每条样式抄两遍，
// 而"哪一侧"本来就是一个状态维度，不是两种结构。
export const transferAnatomy = createAnatomy('transfer', [
  'root',
  'source-panel',
  'target-panel',
  'panel-header',
  'panel-title',
  'panel-count',
  'search',
  'list',
  'item',
  'item-text',
  'item-checkbox',
  'to-target-trigger',
  'to-source-trigger',
  'select-all-trigger',
])

// 集合只认 item：item-text / item-checkbox 同样带 data-scope，但不入导航，
// 方向键与焦点转投都不会停在它们身上。
// 归属判据是「父链上最近的 list 是不是本容器」，所以两侧列表互不吞并——
// 一侧的方向键绝不会走进另一侧。
export const transferItemQuery: ItemQuery = { scope: transferAnatomy.name, part: 'item' }
