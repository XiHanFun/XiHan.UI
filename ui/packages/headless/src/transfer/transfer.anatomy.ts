import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// 两侧面板各是一个独立的 part（source-panel / target-panel），面板内部的角色节点
// 则两侧共用同一个 part 名（panel-header / list / item ……），由 data-side 区分。
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

// 集合只认 item：item-text / item-checkbox 虽带 data-scope 但不入导航。
// 归属按最近的 list 判定，两侧列表互不吞并。
export const transferItemQuery: ItemQuery = { scope: transferAnatomy.name, part: 'item' }
