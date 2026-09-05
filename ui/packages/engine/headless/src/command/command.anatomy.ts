import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

export const commandAnatomy = createAnatomy('command', [
  'trigger',
  'backdrop',
  'positioner',
  'content',
  'input',
  'list',
  'group',
  'group-label',
  'item',
  'item-text',
  'empty',
  'loading',
  'footer',
])

const parts = commandAnatomy.build()

// 集合只认 item；分组里的条目照样查得到（归属判据是父链上最近的 list 是不是本容器）。
export const commandItemQuery: ItemQuery = { scope: commandAnatomy.name, part: 'item' }

/**
 * 条目用于回传给宿主的文本：优先取 item-text 部件，缺省退回条目自身文本。
 * 直接取 textContent 会把行尾快捷键这类装饰节点的文字一并算进来。
 */
export function commandItemText(el: HTMLElement): string {
  const text = el.querySelector<HTMLElement>(parts['item-text'].selector)
  return (text?.textContent ?? el.textContent ?? '').trim()
}
