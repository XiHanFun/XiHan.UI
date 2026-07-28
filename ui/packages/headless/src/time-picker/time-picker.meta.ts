import type { ComponentMeta } from '../spec/types'

// control 与 input 缺一即没有可编辑的东西（control 还是浮层的定位锚点，也是段的读屏归属）；
// trigger 是浮层唯一的指针入口；content 是消解层与焦点域的根节点，缺了它浮层无处落脚。
// column / option 不列为必备：可选值是按 min/max 裁过的，某一列被裁空是正常态。
// label / clear-trigger / positioner / hidden-input 都可缺省。
export const timePickerMeta: ComponentMeta = {
  component: 'time-picker',
  requiredParts: ['root', 'control', 'input', 'trigger', 'content'],
}
