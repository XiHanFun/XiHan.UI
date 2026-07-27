import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const selectAnatomy = createAnatomy('select', [
  'root',
  'label',
  'trigger',
  'value-text',
  'indicator',
  'positioner',
  'content',
  'item',
  'item-text',
  'item-indicator',
  'hidden-select',
])

const parts = selectAnatomy.build()

// 集合只认 item：item-text / item-indicator 同样带 data-scope，但不入导航，
// 方向键与连打检索都不会停在它们身上。
export const selectItemQuery: ItemQuery = { scope: selectAnatomy.name, part: 'item' }

/**
 * 条目用于显示与检索的文本：优先取 item-text 部件，缺省退回条目自身文本。
 * 条目内常挂着 item-indicator 这类装饰节点，直接取 textContent 会把勾选符号一并算进来，
 * 连打检索便再也匹配不上首字母。
 */
export function selectItemText(el: HTMLElement): string {
  const text = el.querySelector<HTMLElement>(parts['item-text'].selector)
  return (text?.textContent ?? el.textContent ?? '').trim()
}
