import type { ComponentMeta } from '../spec/types'

// 只有一个部件，缺了它就既没有夹字的盒子也没有可量的对象。
export const truncateMeta: ComponentMeta = {
  component: 'truncate',
  requiredParts: ['root'],
}
