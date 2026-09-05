import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// tag 是控件里表示一个已选值的那枚小片，由本组件自己画；它与 tag 组件同名不同物——
// scope 名（data-scope）标识的是组件，部件名（data-part）标识的是组件里的位置，两把尺子不交叉。
export const selectAnatomy = createAnatomy('select', [
  'root',
  'label',
  'control',
  'trigger',
  'value-text',
  'indicator',
  'clear-trigger',
  'tag',
  'item-delete-trigger',
  'positioner',
  'content',
  'list',
  'footer',
  'item',
  'item-text',
  'item-indicator',
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
