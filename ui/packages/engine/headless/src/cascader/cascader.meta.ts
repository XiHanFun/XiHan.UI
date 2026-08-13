import type { ComponentMeta } from '../spec/types'

// label/positioner/indicator/clear-trigger、两个条目子部件与空态占位 empty 可缺省。
export const cascaderMeta: ComponentMeta = {
  component: 'cascader',
  requiredParts: ['trigger', 'content', 'column', 'item'],
}
