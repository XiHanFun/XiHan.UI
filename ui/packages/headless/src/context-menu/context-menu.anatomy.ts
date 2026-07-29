import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/core'

export const contextMenuAnatomy = createAnatomy('context-menu', [
  'root',
  'trigger',
  'positioner',
  'content',
  'item',
  'item-text',
  'item-indicator',
  'separator',
  'group',
  'group-label',
  'arrow',
])

const parts = contextMenuAnatomy.build()

// 集合只认 item；分组里的条目照样查得到（归属判据是父链上最近的 content 是不是本容器）。
export const contextMenuItemQuery: ItemQuery = { scope: contextMenuAnatomy.name, part: 'item' }

/**
 * 条目用于连打检索的文本：优先取 item-text 部件，缺省退回条目自身文本。
 * 直接取 textContent 会把 item-indicator 这类装饰节点的文字一并算进来。
 */
export function contextMenuItemText(el: HTMLElement): string {
  const text = el.querySelector<HTMLElement>(parts['item-text'].selector)
  return (text?.textContent ?? el.textContent ?? '').trim()
}
