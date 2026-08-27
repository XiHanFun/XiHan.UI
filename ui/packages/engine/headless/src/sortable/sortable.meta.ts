import type { ComponentMeta } from '../spec/types'

export const sortableMeta: ComponentMeta = {
  component: 'sortable',
  // item-handle 不列：不给手柄时整项可拖，是正当形态
  requiredParts: ['root', 'item'],
}
