import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/kernel'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const popselectAnatomy = createAnatomy('popselect', [
  'root',
  'trigger',
  'positioner',
  'content',
  'item',
  'item-text',
  'item-indicator',
])

const parts = popselectAnatomy.build()

// 导航与连打检索只认 item 部件。
export const popselectItemQuery: ItemQuery = { scope: popselectAnatomy.name, part: 'item' }

/**
 * 条目用于连打检索的文本：优先取 item-text 部件，缺省退回条目自身文本。
 * 不能直接取条目 textContent，item-indicator 一类装饰节点的文字会混进来、首字母就匹配不上。
 */
export function popselectItemText(el: HTMLElement): string {
  const text = el.querySelector<HTMLElement>(parts['item-text'].selector)
  return (text?.textContent ?? el.textContent ?? '').trim()
}
