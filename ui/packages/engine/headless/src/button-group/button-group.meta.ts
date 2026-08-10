import type { ComponentMeta } from '../spec/types'

export const buttonGroupMeta: ComponentMeta = {
  component: 'button-group',
  // 只有根：组内每一段是作者自己的按钮，不是本组件的角色节点
  requiredParts: ['root'],
}
