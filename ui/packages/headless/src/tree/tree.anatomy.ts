import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const treeAnatomy = createAnatomy('tree', [
  'root',
  'label',
  'tree',
  'item',
  'item-indicator',
  'item-text',
  'branch',
  'branch-control',
  'branch-trigger',
  'branch-indicator',
  'branch-text',
  'branch-content',
])

/**
 * 两类节点部件都是 role=treeitem，都自报 data-value，因此都要进导航集合：
 * item 是叶子，branch 是分支（它还裹着自己的 branch-content 子树）。
 *
 * queryItems 的归属判据是「父链上最近的 tree 部件是不是本容器」，
 * item/branch 与 tree 之间隔着多少层 branch/branch-content 都不影响；
 * 嵌套的另一棵 tree 才会被切开，各认各的节点。
 */
export const treeItemQuery: ItemQuery = { scope: treeAnatomy.name, part: 'item' }
export const treeBranchQuery: ItemQuery = { scope: treeAnatomy.name, part: 'branch' }
