import type { Scope } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// 一个标签底下分两套：预览是库里 tag 的 root（文字落在 tag 的 label，删除钮是 tag 的 close-trigger），
// item-input 是就地编辑时才露面的输入框。两者常挂、靠 hidden 互斥，绝不卸载作者写的节点。
export const tagsInputAnatomy = createAnatomy('tags-input', [
  'root',
  'label',
  'control',
  'input',
  'item',
  'item-input',
  'clear-trigger',
  'count',
  'hidden-input',
])

/**
 * 就地编辑框的 id。机器的聚焦副作用靠它从 scope 里捞节点，与 connect 两处算法必须逐字一致。
 */
export function tagsInputEditInputId(scope: Scope, value: string): string {
  return scope.partId(tagsInputAnatomy.name, `item-input:${value}`)
}
