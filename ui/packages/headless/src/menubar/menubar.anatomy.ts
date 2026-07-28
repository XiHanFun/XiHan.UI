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

/**
 * 菜单栏那一排触发器。查询容器取 root，因此一次查得到全部 trigger，
 * 方向键在它们之间走的顺序即文档序。
 */
export const menubarTriggerQuery: ItemQuery = { scope: menubarAnatomy.name, part: 'trigger' }

/**
 * 各菜单的浮层内容。同样以 root 为查询容器：连接层要按 value 找到"某一项的那张菜单"，
 * 才能把焦点从 trigger 送进已经展开的菜单里。
 */
export const menubarContentQuery: ItemQuery = { scope: menubarAnatomy.name, part: 'content' }

/**
 * 菜单内的条目。查询容器取 content，一次只看一张菜单——
 * separator / group-label 同样带 data-scope 却不入集合，方向键与连打检索都不会停在它们身上。
 */
export const menubarItemQuery: ItemQuery = { scope: menubarAnatomy.name, part: 'item' }

/**
 * 条目用于连打检索的文本：优先取 item-text 部件，缺省退回条目自身文本。
 * 条目内常挂着 item-indicator 这类装饰节点，直接取 textContent 会把勾选符号与快捷键提示
 * 一并算进来，检索便再也匹配不上首字母。
 */
export function menubarItemText(el: HTMLElement): string {
  const text = el.querySelector<HTMLElement>(parts['item-text'].selector)
  return (text?.textContent ?? el.textContent ?? '').trim()
}
