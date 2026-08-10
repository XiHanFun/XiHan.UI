import type { ComponentMeta } from '../spec/types'

export const countdownMeta: ComponentMeta = {
  component: 'countdown',
  // 只有一个部件，时间就写在它里面；缺了它这个组件没有任何可显示的地方
  requiredParts: ['root'],
}
