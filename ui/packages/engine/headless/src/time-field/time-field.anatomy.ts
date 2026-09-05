import { createAnatomy } from '@xihan-ui/core'

// segment 是多实例 part（时/分/秒/上下午各一个），身份由作者写在节点上；
// control 把各段兜成一个整体，clear-trigger 一键清空全部段，hidden-input 是表单出口。
// segment-group 把全部段位与作者写的分隔符兜成一块，占满盒里剩下的宽度，清空钮靠在末端。
export const timeFieldAnatomy = createAnatomy('time-field', [
  'root',
  'label',
  'control',
  'segment-group',
  'segment',
  'clear-trigger',
  'hidden-input',
])
