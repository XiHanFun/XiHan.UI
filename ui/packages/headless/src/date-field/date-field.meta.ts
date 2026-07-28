import type { ComponentMeta } from '../spec/types'

// 没有 control 就没有那个把各段兜成一体的 group，没有 segment 就没有可编辑的东西；
// label 与 hidden-input 由作者按需要挂。
export const dateFieldMeta: ComponentMeta = {
  component: 'date-field',
  requiredParts: ['root', 'control', 'segment'],
}
