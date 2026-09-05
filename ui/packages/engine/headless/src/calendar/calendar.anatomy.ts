import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const calendarAnatomy = createAnatomy('calendar', [
  'root',
  'header',
  'prev-year-trigger',
  'prev-trigger',
  'next-trigger',
  'next-year-trigger',
  'heading',
  // 标题里的年与月各是一个可点的钮：点年进十年格、点月进月格，逐级钻上去。
  // 两个都是可选部件——只写 heading 就是从前那条不可点的路
  'heading-year-trigger',
  'heading-month-trigger',
  'grid',
  'grid-head',
  'week-day',
  'grid-body',
  'week-row',
  'week-number',
  'cell',
  'cell-trigger',
])

/** 落焦点是 cell-trigger 不是 cell（cell 承担 role=gridcell 与选中态）；翻月后按它在活 DOM 里找回落点。 */
export const calendarCellTriggerQuery: ItemQuery = { scope: calendarAnatomy.name, part: 'cell-trigger' }
