import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
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

// 集合只认 item：separator / group-label / item-text / item-indicator 同样带 data-scope，
// 但不入导航，方向键与连打检索都不会停在它们身上。
// 分组里的条目照样查得到：queryItems 的归属判据是「父链上最近的 content 是不是本容器」，
// 中间隔着 group 不影响，嵌套的另一个右键菜单才会被切开。
export const contextMenuItemQuery: ItemQuery = { scope: contextMenuAnatomy.name, part: 'item' }

/**
 * 条目用于连打检索的文本：优先取 item-text 部件，缺省退回条目自身文本。
 * 条目内常挂着 item-indicator 这类装饰节点，直接取 textContent 会把勾选符号一并算进来，
 * 连打检索便再也匹配不上首字母。
 */
export function contextMenuItemText(el: HTMLElement): string {
  const text = el.querySelector<HTMLElement>(parts['item-text'].selector)
  return (text?.textContent ?? el.textContent ?? '').trim()
}
