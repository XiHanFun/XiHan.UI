import type { ComponentMeta } from '../spec/types'

export const gradientTextMeta: ComponentMeta = {
  component: 'gradient-text',
  // 解剖只有根：被上色的是作者自己的文字，不属于本组件的角色节点
  requiredParts: ['root'],
}
