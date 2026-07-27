import type { ComponentMeta } from '../spec/types'

// 没有格子就没有可输入的东西；label 与 hidden-input 由作者按需要挂。
export const pinInputMeta: ComponentMeta = {
  component: 'pin-input',
  requiredParts: ['root', 'input'],
}
