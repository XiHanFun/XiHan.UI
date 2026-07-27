import type { Scope } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// 一个标签底下分两套：item-preview 是平常那一套（文本 + 删除按钮），
// item-input 是就地编辑时才露面的输入框。两者常挂、靠 hidden 互斥，绝不卸载作者写的节点。
export const tagsInputAnatomy = createAnatomy('tags-input', [
  'root',
  'label',
  'control',
  'input',
  'item',
  'item-preview',
  'item-text',
  'item-delete-trigger',
  'item-input',
  'clear-trigger',
  'hidden-input',
])

/**
 * 就地编辑框的 id。机器的聚焦副作用与 connect 各自算一次，两处必须逐字一致——
 * 副作用是靠这个 id 从 scope 里把节点捞出来的，算歪了焦点就永远进不了编辑框。
 */
export function tagsInputEditInputId(scope: Scope, value: string): string {
  return scope.partId(tagsInputAnatomy.name, `item-input:${value}`)
}
