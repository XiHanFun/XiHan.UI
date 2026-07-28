import type { ComponentMeta } from '../spec/types'

// 没有段就没有可编辑的东西；control 是这几段的读屏归属，缺了它读屏只看得到几个孤立的数。
// label 与 hidden-input 由作者按需要挂。
export const timeFieldMeta: ComponentMeta = {
  component: 'time-field',
  requiredParts: ['root', 'control', 'segment'],
}
