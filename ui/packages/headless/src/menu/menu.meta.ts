import type { ComponentMeta } from '../spec/types'

// positioner/separator/arrow 可缺省。
export const menuMeta: ComponentMeta = {
  component: 'menu',
  requiredParts: ['trigger', 'content', 'item'],
}
