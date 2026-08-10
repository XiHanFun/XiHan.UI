import type { ComponentMeta } from '../spec/types'

// root 缺省则分组语义（radiogroup / group）与键盘收口都无处安放；无条目的一组开关无从操作。
export const toggleGroupMeta: ComponentMeta = {
  component: 'toggle-group',
  requiredParts: ['root', 'item'],
}
