import type { ComponentMeta } from '../spec/types'

// control 是浮层的定位锚点，content 是浮层本体与消解层的根节点，calendar 是内嵌日历的挂载点，
// 三者缺一浮层就落不了位、关不掉或空着——都算违约。
// input 可缺省：只用图标按钮弹日历、不给分段输入的形态是成立的。
// label / trigger / clear-trigger / positioner 同理可缺省。
export const datePickerMeta: ComponentMeta = {
  component: 'date-picker',
  requiredParts: ['control', 'content', 'calendar'],
}
