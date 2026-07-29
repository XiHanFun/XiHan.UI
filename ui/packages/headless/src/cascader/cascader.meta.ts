import type { ComponentMeta } from '../spec/types'

// label/positioner/indicator/clear-trigger 与两个条目子部件可缺省。
export const cascaderMeta: ComponentMeta = {
  component: 'cascader',
  requiredParts: ['trigger', 'content', 'column', 'item'],
}
