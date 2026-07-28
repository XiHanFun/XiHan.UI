import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const tableAnatomy = createAnatomy('table', [
  'root',
  'header',
  'body',
  'footer',
  'row',
  'column-header',
  'cell',
  'caption',
  'select-all-trigger',
  'row-select-trigger',
  'sort-trigger',
  'expand-trigger',
  'expanded-row',
  'empty-state',
  'loading-state',
])

/**
 * 行级 roving 的导航集合只认 row 部件，且**查询容器取 body 而不是 root**：
 * 表头行与脚注行同样是 role=row、同样写成 row 部件，但它们不是数据行，
 * 方向键停上去就等于把焦点丢进一行标题里。queryItems 的归属判据是
 * 「父链上最近的同名容器是不是本容器」，以 body 为容器一查，两者天然出局。
 *
 * 详情行另立 expanded-row 部件（不是 row）：它虽然也报 role=row、也占一个行号，
 * 承载的却是业务内容而非数据行。分成两个部件，集合查询不必再过滤一遍，
 * 两种行也就不必在 DOM 上抢同一个 data-value。
 */
export const tableRowQuery: ItemQuery = { scope: tableAnatomy.name, part: 'row' }
