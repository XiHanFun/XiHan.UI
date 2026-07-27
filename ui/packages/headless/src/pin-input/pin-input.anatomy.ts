import { createAnatomy } from '@xihan-ui/core'

// input 是多实例 part：一格一个，文档序即下标序。
// hidden-input 是整份验证码的表单出口，与逐格的 input 分开，两者互不承担对方的职责。
export const pinInputAnatomy = createAnatomy('pin-input', [
  'root',
  'label',
  'input',
  'hidden-input',
])
