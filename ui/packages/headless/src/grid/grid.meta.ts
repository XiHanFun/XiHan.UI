import type { ComponentMeta } from '../spec/types'

export const gridMeta: ComponentMeta = {
  component: 'grid',
  // 只有根是必备的：一格都不摆也是一个合法的容器
  requiredParts: ['root'],
}
