import type { ComponentMeta } from '../spec/types'

// control 是浮层的定位锚点，content 是浮层本体与消解层的根节点，calendar 是内嵌日历的挂载点。
// input / label / trigger / clear-trigger / positioner 可缺省。
export const datePickerMeta: ComponentMeta = {
  component: 'date-picker',
  requiredParts: ['control', 'content', 'calendar'],
}
