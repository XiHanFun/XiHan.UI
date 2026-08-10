import type { ComponentMeta } from '../spec/types'

export const timeMeta: ComponentMeta = {
  component: 'time',
  // 只有一个部件，缺了它 datetime 无处可落
  requiredParts: ['root'],
}
