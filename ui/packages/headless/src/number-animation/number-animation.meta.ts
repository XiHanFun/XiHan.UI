import type { ComponentMeta } from '../spec/types'

export const numberAnimationMeta: ComponentMeta = {
  component: 'number-animation',
  // 只有一个部件，数字就写在它里面；缺了它这个组件没有任何可显示的地方
  requiredParts: ['root'],
}
