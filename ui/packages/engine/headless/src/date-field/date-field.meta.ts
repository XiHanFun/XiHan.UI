import type { ComponentMeta } from '../spec/types'

// label 与 hidden-input 由作者按需要挂。
export const dateFieldMeta: ComponentMeta = {
  component: 'date-field',
  requiredParts: ['root', 'control', 'segment'],
}
