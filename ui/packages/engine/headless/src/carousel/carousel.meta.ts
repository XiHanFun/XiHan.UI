import type { ComponentMeta } from '../spec/types'

// item、两端按钮、指示点均可缺省。
export const carouselMeta: ComponentMeta = {
  component: 'carousel',
  requiredParts: ['root', 'viewport', 'item-group'],
}
