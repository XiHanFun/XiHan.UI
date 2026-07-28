import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const calendarAnatomy = createAnatomy('calendar', [
  'root',
  'header',
  'prev-trigger',
  'next-trigger',
  'heading',
  'grid',
  'grid-head',
  'week-day',
  'grid-body',
  'week-row',
  'cell',
  'cell-trigger',
])

/**
 * 日期格子的真正落焦点是 cell-trigger，不是 cell：
 * cell 只承担 role=gridcell 的表格语义，能点能聚焦的那一层在它里面。
 * 翻月之后要把焦点送到新月份的某一天，靠的就是按这个查询在活 DOM 里找回落点。
 */
export const calendarCellTriggerQuery: ItemQuery = { scope: calendarAnatomy.name, part: 'cell-trigger' }
