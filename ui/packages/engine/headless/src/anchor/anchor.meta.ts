import type { ComponentMeta } from '../spec/types'

// indicator 是纯装饰，可以不渲染
export const anchorMeta: ComponentMeta = {
  component: 'anchor',
  requiredParts: ['root', 'list', 'item', 'link'],
}
