import { createAnatomy } from '@xihan-ui/kernel'

/**
 * data-part 用 kebab-case，与 CSS 选择器一致。
 *
 * input 与 calendar 是挂载点，内部分别是 DateField 的段位（data-scope="date-field"）
 * 与 Calendar 的网格（data-scope="calendar"）。内嵌 DOM 须保留各自的 scope：
 * 日历翻月后的焦点归位按 calendar 的 cell-trigger 查活 DOM，改了 scope 就查不到。
 *
 * presets 是浮层里的快捷选项列（「今天」「近 7 天」这类），preset 是其中一项；
 * 两者都归本 scope，选项的身份由作者写在节点上。
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
  'presets',
  'preset',
  'calendar',
  'time-column',
  'time-item',
  'confirm-trigger',
])
