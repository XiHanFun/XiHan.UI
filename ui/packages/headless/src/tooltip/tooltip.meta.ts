import type { ComponentMeta } from '../spec/types'

// trigger 缺省则无从悬停/聚焦，content 缺省则无描述可读；positioner/arrow 可缺省。
export const tooltipMeta: ComponentMeta = {
  component: 'tooltip',
  requiredParts: ['trigger', 'content'],
}
