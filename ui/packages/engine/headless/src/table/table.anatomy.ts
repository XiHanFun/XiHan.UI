import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// empty 与 loading 是表体的两个占位节点，成对命名：一个装「一行都没有」、一个装「还在取」。
export const tableAnatomy = createAnatomy('table', [
  'root',
  'header',
  'body',
  'footer',
  'row',
  'column-header',
  'cell',
  'caption',
  // 工具条与列设置区都摆在 root 之外：root 是 grid 系角色，它的子节点只能是 row 与 rowgroup。
  'toolbar',
  'column-list',
  'column-visibility-trigger',
  'select-all-trigger',
  'row-select-trigger',
  'sort-trigger',
  'column-resize-trigger',
  'column-drag-trigger',
  'row-drag-trigger',
  'expand-trigger',
  'expanded-row',
  'empty',
  'loading',
  'load-more-trigger',
  'live-region',
])

/**
 * 行级 roving 的导航集合只认 row 部件，查询容器取 body 而不是 root：
 * 表头行与脚注行同样写成 row 部件，以 body 为容器查询才把它们排除在外。
 * 详情行另立 expanded-row 部件，不与数据行抢同一个 data-value。
 */
export const tableRowQuery: ItemQuery = { scope: tableAnatomy.name, part: 'row' }
