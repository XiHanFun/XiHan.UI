import type { ComponentMeta } from '../spec/types'

export const buttonGroupMeta: ComponentMeta = {
  component: 'button-group',
  // root 是唯一部件；分隔线由适配器按属性自动生成，不进入作者部件面。
  requiredParts: ['root'],
}
