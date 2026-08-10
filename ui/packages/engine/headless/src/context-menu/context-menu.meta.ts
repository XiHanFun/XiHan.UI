import type { ComponentMeta } from '../spec/types'

// root / positioner / separator / group / arrow 可缺省。
export const contextMenuMeta: ComponentMeta = {
  component: 'context-menu',
  requiredParts: ['trigger', 'content', 'item'],
}
