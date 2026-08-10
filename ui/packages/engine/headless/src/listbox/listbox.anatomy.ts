import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/kernel'

export const listboxAnatomy = createAnatomy('listbox', [
  'root',
  'label',
  'content',
  'item',
  'item-text',
  'item-indicator',
  'item-group',
  'item-group-label',
])

const parts = listboxAnatomy.build()

// 导航与连打检索只认 item 部件。
export const listboxItemQuery: ItemQuery = { scope: listboxAnatomy.name, part: 'item' }

/**
 * 条目用于连打检索的文本：优先取 item-text 部件，缺省退回条目自身文本。
 * 不能直接取条目 textContent，item-indicator 一类装饰节点的文字会混进来、首字母就匹配不上。
 */
export function listboxItemText(el: HTMLElement): string {
  const text = el.querySelector<HTMLElement>(parts['item-text'].selector)
  return (text?.textContent ?? el.textContent ?? '').trim()
}
