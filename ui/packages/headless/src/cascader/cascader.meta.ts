import type { ComponentMeta } from '../spec/types'

// trigger 与 content 缺一即违约（role=combobox 与浮层的两端无从对接）；
// column 缺了则一个 role=listbox 容器都没有，条目的 role=option 无处安放；
// item 缺了这份级联里就一个可挑的东西都没有。
// label/positioner/indicator/clear-trigger 与两个条目子部件可缺省。
export const cascaderMeta: ComponentMeta = {
  component: 'cascader',
  requiredParts: ['trigger', 'content', 'column', 'item'],
}
