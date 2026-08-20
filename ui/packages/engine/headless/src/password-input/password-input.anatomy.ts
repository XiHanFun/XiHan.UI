import type { Scope } from '@xihan-ui/kernel'
import { createAnatomy } from '@xihan-ui/kernel'

// control 是唯一的视觉盒：输入框、明暗切换钮与大写锁定提示都排在它里面，
// 描边、底色与聚焦环画在它身上，整枚控件从头到尾只有一道边。
export const passwordInputAnatomy = createAnatomy('password-input', [
  'root',
  'label',
  'control',
  'input',
  'visibility-trigger',
  'caps-lock-indicator',
])

/**
 * 输入框的 DOM id。
 * 机器在切换明暗之后要把光标放回原处，得先找到这个节点；connect 写 id 时用的也是这个函数。
 */
export function passwordInputInputId(scope: Scope): string {
  return scope.partId(passwordInputAnatomy.name, 'input')
}
