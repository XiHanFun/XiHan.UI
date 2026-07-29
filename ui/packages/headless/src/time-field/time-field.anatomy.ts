import { createAnatomy } from '@xihan-ui/core'

// segment 是多实例 part（时/分/秒/上下午各一个），身份由作者写在节点上；
// control 把各段兜成一个整体，hidden-input 是表单出口。
export const timeFieldAnatomy = createAnatomy('time-field', [
  'root',
  'label',
  'control',
  'segment',
  'hidden-input',
])
