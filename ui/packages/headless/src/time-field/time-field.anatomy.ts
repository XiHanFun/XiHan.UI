import { createAnatomy } from '@xihan-ui/core'

// segment 是多实例 part：时/分/秒/上下午各一个，段的身份由作者写在节点上，connect 据此产出属性。
// control 把这些段兜成一个读屏可识别的整体；hidden-input 是整份时间的表单出口，
// 与逐段的展示节点分开，两者互不承担对方的职责。
export const timeFieldAnatomy = createAnatomy('time-field', [
  'root',
  'label',
  'control',
  'segment',
  'hidden-input',
])
