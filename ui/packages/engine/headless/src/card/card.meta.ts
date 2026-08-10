import type { ComponentMeta } from '../spec/types'

export const cardMeta: ComponentMeta = {
  component: 'card',
  // 只有根是必备的：封面、头、身、脚按需摆，一个不写也是一张合法的卡片
  requiredParts: ['root'],
}
