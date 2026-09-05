import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// root 是整块容器，label 收住组标题，list 是那排标签本身，item 是一枚标签，
// cell 是标签里那一格，item-text 收住标签文字，item-delete-trigger 是那颗摘除钮。
//
// cell 单独一层是因为摘除钮可聚焦：可聚焦的东西不许待在 option 这类控件角色里，
// 而 gridcell 允许，摘除钮只能落在它下面。
export const tagGroupAnatomy = createAnatomy('tag-group', [
  'root',
  'label',
  'list',
  'item',
  'cell',
  'item-text',
  'item-delete-trigger',
])

const parts = tagGroupAnatomy.build()

// 导航、连打检索与摘除都只认 item 部件。
export const tagGroupItemQuery: ItemQuery = { scope: tagGroupAnatomy.name, part: 'item' }

/**
 * 条目用于连打检索的文本：优先取 item-text 部件，缺省退回条目自身文本。
 * 不能直接取条目 textContent，摘除钮里的字形文字会混进来、首字母就匹配不上。
 */
export function tagGroupItemText(el: HTMLElement): string {
  const text = el.querySelector<HTMLElement>(parts['item-text'].selector)
  return (text?.textContent ?? el.textContent ?? '').trim()
}
