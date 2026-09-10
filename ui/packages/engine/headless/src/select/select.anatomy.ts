import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// tag-list 是触发器里收着已选值标签的那一行；行里每一枚标签（含折起来的那些合成的 +N）
// 都是库里的 tag 组件（data-scope="tag"），由连接层套 tag 的连接层产出，本组件不另立部件。
// 标签里的删除钮同样是 tag 的 close-trigger，标签摆在触发器外时才用得上（按钮不能套按钮）。
export const selectAnatomy = createAnatomy('select', [
  'root',
  'label',
  'control',
  'trigger',
  'value-text',
  'indicator',
  'clear-trigger',
  'tag-list',
  'positioner',
  'content',
  'list',
  'footer',
  'group',
  'group-label',
  'item',
  'item-text',
  'item-indicator',
  'empty',
  'loading',
  'hidden-select',
])

const parts = selectAnatomy.build()

// 集合只认 item：item-text / item-indicator 虽带 data-scope 但不入导航。
export const selectItemQuery: ItemQuery = { scope: selectAnatomy.name, part: 'item' }

/**
 * 条目用于显示与检索的文本：优先取 item-text 部件，缺省退回条目自身文本。
 * 直接取条目 textContent 会把 item-indicator 的勾选符号一并算进来。
 */
export function selectItemText(el: HTMLElement): string {
  const text = el.querySelector<HTMLElement>(parts['item-text'].selector)
  return (text?.textContent ?? el.textContent ?? '').trim()
}
