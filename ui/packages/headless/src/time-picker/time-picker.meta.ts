import type { ComponentMeta } from '../spec/types'

// control 是浮层定位锚点与段的读屏归属，input 是可编辑的段，trigger 是浮层的指针入口，
// content 是消解层与焦点域的根节点，四者必需。
// column / option 不列为必备（某一列被 min/max 裁空是正常态）；
// label / clear-trigger / positioner / hidden-input 都可缺省。
export const timePickerMeta: ComponentMeta = {
  component: 'time-picker',
  requiredParts: ['root', 'control', 'input', 'trigger', 'content'],
}
