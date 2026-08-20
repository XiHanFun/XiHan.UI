import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/kernel'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const jsonViewerAnatomy = createAnatomy('json-viewer', [
  'root',
  'tree',
  'item',
  'item-key',
  'item-value',
  'branch',
  'branch-control',
  'branch-trigger',
  'branch-indicator',
  'branch-text',
  'branch-content',
  'preview',
])

/**
 * 叶子行与分支行都是 role=treeitem、都自报 data-value，因此两类都要进导航集合：
 * item 装标量值，branch 装对象与数组。
 * queryItems 按最近的 tree 部件归属过滤，中间隔多少层 branch-content 都不影响。
 */
export const jsonViewerItemQuery: ItemQuery = { scope: jsonViewerAnatomy.name, part: 'item' }
export const jsonViewerBranchQuery: ItemQuery = { scope: jsonViewerAnatomy.name, part: 'branch' }
