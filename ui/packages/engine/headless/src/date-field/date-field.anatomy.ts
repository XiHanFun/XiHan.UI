import { createAnatomy } from '@xihan-ui/kernel'

// segment 是多实例 part：一段一个节点，文档序即段序，段序随 locale 变。
// control 单独一层：它是 role=group 的分段容器，与 root 合成一个节点会把标题也圈进组里。
export const dateFieldAnatomy = createAnatomy('date-field', [
  'root',
  'label',
  'control',
  'segment',
  'clear-trigger',
  'hidden-input',
])
