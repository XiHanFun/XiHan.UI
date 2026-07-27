import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const comboboxAnatomy = createAnatomy('combobox', [
  'root',
  'label',
  'control',
  'input',
  'trigger',
  'clear-trigger',
  'positioner',
  'content',
  'item',
  'item-text',
  'item-indicator',
  'item-group',
  'item-group-label',
  'empty',
])

const parts = comboboxAnatomy.build()

// 集合只认 item：item-text / item-indicator / empty 同样带 data-scope，但不入导航，
// 方向键不会停在它们身上，空态节点也不会被算进候选数。
// 分组里的条目照样查得到：queryItems 的归属判据是「父链上最近的 content 是不是本容器」，
// 中间隔着 item-group 不影响。
export const comboboxItemQuery: ItemQuery = { scope: comboboxAnatomy.name, part: 'item' }

/**
 * 条目用于回填输入串的文本：优先取 item-text 部件，缺省退回条目自身文本。
 * 条目内常挂着 item-indicator 这类装饰节点，直接取 textContent 会把勾选符号一并算进来，
 * 选中后输入框里就会多出一个勾。
 */
export function comboboxItemText(el: HTMLElement): string {
  const text = el.querySelector<HTMLElement>(parts['item-text'].selector)
  return (text?.textContent ?? el.textContent ?? '').trim()
}
