import type { Scope } from '@xihan-ui/kernel'
import { createAnatomy } from '@xihan-ui/kernel'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// 一行分两半：item-content 装作者自己的控件，item-action 装这一行的把手。
export const dynamicInputAnatomy = createAnatomy('dynamic-input', [
  'root',
  'item',
  'item-content',
  'item-action',
  'add-trigger',
  'remove-trigger',
  'move-up-trigger',
  'move-down-trigger',
])

/**
 * 把手的 id。删除与换序之后由机器按它捞回节点还焦点，connect 与机器两处算法必须逐字一致。
 * 行内把手带行下标；新增把手整份只有一个，不带下标。
 */
export function dynamicInputTriggerId(scope: Scope, part: string, index?: number): string {
  return scope.partId(dynamicInputAnatomy.name, index == null ? part : `${part}:${index}`)
}
