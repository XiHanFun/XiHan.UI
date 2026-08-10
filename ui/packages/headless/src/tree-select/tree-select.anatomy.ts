import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/kernel'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// 前半截（trigger/value-text/indicator/positioner/content）是浮层那一套，
// 后半截（tree 与两类节点部件）是树那一套，两者在 content 里接上。
export const treeSelectAnatomy = createAnatomy('tree-select', [
  'root',
  'label',
  'trigger',
  'value-text',
  'indicator',
  'clear-trigger',
  'positioner',
  'content',
  'tree',
  'item',
  'item-text',
  'item-indicator',
  'branch',
  'branch-control',
  'branch-trigger',
  'branch-indicator',
  'branch-text',
  'branch-content',
  'hidden-input',
])

/**
 * 两类节点部件都是 role=treeitem、都自报 data-value，因此都要进导航集合：
 * item 是叶子，branch 是分支。
 * queryItems 按最近的同名部件归属过滤，容器传 content 或 tree 都成立，
 * 只有嵌套的另一个 tree-select 会被切开。
 */
export const treeSelectItemQuery: ItemQuery = { scope: treeSelectAnatomy.name, part: 'item' }
export const treeSelectBranchQuery: ItemQuery = { scope: treeSelectAnatomy.name, part: 'branch' }
