import { createAnatomy } from '@xihan-ui/core'
import { tagAnatomy } from '../tag/tag.anatomy'

// root 是整块容器，label 收住组标题，list 是那排标签本身，cell 是标签里那一格。
// 一枚标签本身是库里 tag 的 root，标签文字是 tag 的 label，摘除钮是 tag 的 close-trigger：
// 三者戴 tag 的 scope，不进本解剖。
//
// cell 单独一层是因为摘除钮可聚焦：可聚焦的东西不许待在 option 这类控件角色里，
// 而 gridcell 允许，摘除钮只能落在它下面。
export const tagGroupAnatomy = createAnatomy('tag-group', [
  'root',
  'label',
  'list',
  'cell',
])

const parts = tagGroupAnatomy.build()
const tagParts = tagAnatomy.build()

/**
 * 按文档序取列表里的条目：直接套在 list 下、担着 row 角色的 tag 根。
 * 作者塞进格子里的独立标签没有 row 角色，靠这一道排除；
 * 嵌套的标签组各认各的 list，互不吞并。
 */
export function tagGroupItems(list: HTMLElement): HTMLElement[] {
  const all = [...list.querySelectorAll<HTMLElement>(`${tagParts.root.selector}[role="row"]`)]
  return all.filter(el => el.parentElement?.closest<HTMLElement>(parts.list.selector) === list)
}

/**
 * 条目用于连打检索的文本：优先取 tag 的 label 部件，缺省退回条目自身文本。
 * 不能直接取条目 textContent，摘除钮里的字形文字会混进来、首字母就匹配不上。
 */
export function tagGroupItemText(el: HTMLElement): string {
  const text = el.querySelector<HTMLElement>(tagParts.label.selector)
  return (text?.textContent ?? el.textContent ?? '').trim()
}
