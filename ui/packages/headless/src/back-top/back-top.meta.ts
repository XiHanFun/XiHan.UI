import type { ComponentMeta } from '../spec/types'

// 两个都必备：root 是定位壳并承载显隐，trigger 是唯一可点、可聚焦的部件。
export const backTopMeta: ComponentMeta = {
  component: 'back-top',
  requiredParts: ['root', 'trigger'],
}
