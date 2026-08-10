import type { ComponentMeta } from '../spec/types'

export const highlightMeta: ComponentMeta = {
  component: 'highlight',
  // mark 是算出来的，作者写不出也不必写；只有 root 是必备的
  requiredParts: ['root'],
}
