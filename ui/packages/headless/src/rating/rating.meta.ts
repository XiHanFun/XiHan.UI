import type { ComponentMeta } from '../spec/types'

// label 与 hidden-input 可选，control 与 item 必需。
export const ratingMeta: ComponentMeta = {
  component: 'rating',
  requiredParts: ['root', 'control', 'item'],
}
