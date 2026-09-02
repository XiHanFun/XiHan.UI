import type { ComponentMeta } from '../spec/types'

// input 是输入口，submit-trigger 是指针用户的发送与停止入口，root 承载 data-state，三者必需。
export const composerMeta: ComponentMeta = {
  component: 'composer',
  requiredParts: ['root', 'input', 'submit-trigger'],
}
