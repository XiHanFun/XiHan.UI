import type { ComponentMeta } from '../spec/types'

// 无条目的 radiogroup 无从选择；root/label 由组件外壳自行渲染。
export const radioGroupMeta: ComponentMeta = {
  component: 'radio-group',
  requiredParts: ['item'],
}
