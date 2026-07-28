import { createAnatomy } from '@xihan-ui/core'

/**
 * data-part 直接用 kebab-case，与 CSS 选择器一致。
 *
 * 这九个只是本组件**自己**的角色节点。日期选择器是编排机：
 * - input 之内挂的是 DateField 的段位（data-scope="date-field"），
 * - calendar 之内挂的是 Calendar 的整张网格（data-scope="calendar"）。
 *
 * 内嵌那两套 DOM 刻意保留各自的 scope，不改写成本组件的：
 * 日历的「翻月后把焦点送回落点那一格」是在日历机器里按 calendar 的 cell-trigger 查活 DOM 的，
 * 改了 scope 那条路当场断掉，而它没有对外的替代入口。既然日历这边只能原样保留，
 * 段位那边也照同一条规矩走，免得同一棵树里两套做法。
 *
 * 因此 input 与 calendar 都是「挂载点」：它们自己戴本组件的标记，
 * 里面的段位/日期格由内嵌那两份解剖认领。
 */
export const datePickerAnatomy = createAnatomy('date-picker', [
  'root',
  'label',
  'control',
  'input',
  'trigger',
  'clear-trigger',
  'positioner',
  'content',
  'calendar',
])
