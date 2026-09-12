import type { ComponentMeta } from '../spec/types'

export const buttonGroupMeta: ComponentMeta = {
  component: 'button-group',
  // root 是唯一必需部件；separator 是可选装饰线，组内按钮不是本组件的角色节点。
  requiredParts: ['root'],
}
