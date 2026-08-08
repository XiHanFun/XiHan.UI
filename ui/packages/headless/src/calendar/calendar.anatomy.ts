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

/** 落焦点是 cell-trigger 不是 cell（cell 承担 role=gridcell 与选中态）；翻月后按它在活 DOM 里找回落点。 */
export const calendarCellTriggerQuery: ItemQuery = { scope: calendarAnatomy.name, part: 'cell-trigger' }
