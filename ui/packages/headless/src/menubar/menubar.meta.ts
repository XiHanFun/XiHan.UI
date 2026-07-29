import type { ComponentMeta } from '../spec/types'

// positioner/separator/group/item-text/item-indicator 可缺省。
export const menubarMeta: ComponentMeta = {
  component: 'menubar',
  requiredParts: ['root', 'trigger', 'content', 'item'],
}
