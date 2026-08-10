import type { ComponentMeta } from '../spec/types'

export const flexMeta: ComponentMeta = {
  component: 'flex',
  // 解剖只有根：子项是作者自己的内容，不属于本组件的角色节点
  requiredParts: ['root'],
}
