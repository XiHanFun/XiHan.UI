import type { ComponentMeta } from '../spec/types'

// root/label 与分组三件套可缺省。
export const listboxMeta: ComponentMeta = {
  component: 'listbox',
  requiredParts: ['content', 'item'],
}
