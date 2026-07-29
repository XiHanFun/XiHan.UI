import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const menubarAnatomy = createAnatomy('menubar', [
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
])

const parts = menubarAnatomy.build()

/** 触发器集合，查询容器取 root。 */
export const menubarTriggerQuery: ItemQuery = { scope: menubarAnatomy.name, part: 'trigger' }

/** 各菜单的浮层内容，查询容器取 root。 */
export const menubarContentQuery: ItemQuery = { scope: menubarAnatomy.name, part: 'content' }

/** 菜单内的条目，查询容器取 content。 */
export const menubarItemQuery: ItemQuery = { scope: menubarAnatomy.name, part: 'item' }

/** 条目用于连打检索的文本：优先取 item-text 部件，缺省退回条目自身文本。 */
export function menubarItemText(el: HTMLElement): string {
  const text = el.querySelector<HTMLElement>(parts['item-text'].selector)
  return (text?.textContent ?? el.textContent ?? '').trim()
}
