import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

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
  'group',
  'group-label',
  'empty',
  'hidden-input',
])

const parts = comboboxAnatomy.build()

// 集合只认 item；分组里的条目照样查得到（归属判据是父链上最近的 content 是不是本容器）。
export const comboboxItemQuery: ItemQuery = { scope: comboboxAnatomy.name, part: 'item' }

/**
 * 条目用于回填输入串的文本：优先取 item-text 部件，缺省退回条目自身文本。
 * 直接取 textContent 会把 item-indicator 这类装饰节点的文字一并算进来。
 */
export function comboboxItemText(el: HTMLElement): string {
  const text = el.querySelector<HTMLElement>(parts['item-text'].selector)
  return (text?.textContent ?? el.textContent ?? '').trim()
}
