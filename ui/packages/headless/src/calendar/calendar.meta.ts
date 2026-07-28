import type { ComponentMeta } from '../spec/types'

// grid 缺一即违约（role=grid、可及名字与键盘入口全在它身上）；
// 没有 cell/cell-trigger 的日历不成其为日历——前者是表格语义，后者是唯一可点可聚焦的落点。
// header/prev-trigger/next-trigger/heading 可缺省：只读的月视图不需要翻月按钮；
// grid-head/week-day 同理，紧凑形态可以不画表头。
export const calendarMeta: ComponentMeta = {
  component: 'calendar',
  requiredParts: ['grid', 'cell', 'cell-trigger'],
}
