import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const menuAnatomy = createAnatomy('menu', [
  'trigger',
  'positioner',
  'content',
  'item',
  'item-text',
  'item-indicator',
  'item-description',
  'separator',
  'group',
  'group-label',
  'arrow',
])

const parts = menuAnatomy.build()

// 导航集合只认 item。
export const menuItemQuery: ItemQuery = { scope: menuAnatomy.name, part: 'item' }

/**
 * 条目用于连打检索的文本：优先取 item-text 部件，缺省退回条目自身文本。
 * 直接取 textContent 会把 item-indicator 这类装饰节点的文字一并算进来。
 */
export function menuItemText(el: HTMLElement): string {
  const text = el.querySelector<HTMLElement>(parts['item-text'].selector)
  return (text?.textContent ?? el.textContent ?? '').trim()
}
