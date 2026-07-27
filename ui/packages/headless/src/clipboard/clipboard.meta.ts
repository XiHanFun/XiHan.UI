import type { ComponentMeta } from '../spec/types'

// 没有 trigger 就没有"复制"这件事，root 是状态属性的落点；
// label / control / input / indicator 都可省（只放一个复制按钮同样成立）。
export const clipboardMeta: ComponentMeta = {
  component: 'clipboard',
  requiredParts: ['root', 'trigger'],
}
