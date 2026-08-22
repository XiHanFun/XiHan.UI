import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/kernel'

export const cascaderAnatomy = createAnatomy('cascader', [
  'root',
  'label',
  'control',
  'trigger',
  'value-text',
  'indicator',
  'clear-trigger',
  'positioner',
  'content',
  'input',
  'search-list',
  'search-item',
  'column',
  'item',
  'item-text',
  'item-indicator',
  'empty',
])

/**
 * 集合只认 item：item-text / item-indicator 同样带 data-scope，但不入导航，
 * 方向键不会停在它们身上。
 *
 * 查询容器一律传 content 而不是某一列：条目要跨列按值取（右方向键进的是**下一列**的条目），
 * 逐列查等于把这件事拆成两步。queryItems 的归属判据是「父链上最近的 content 是不是本容器」，
 * 中间隔着 column 不影响，而嵌套的另一个级联会被切开，各认各的条目。
 */
export const cascaderItemQuery: ItemQuery = { scope: cascaderAnatomy.name, part: 'item' }
