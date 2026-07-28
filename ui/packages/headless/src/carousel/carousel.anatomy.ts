import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const carouselAnatomy = createAnatomy('carousel', [
  'root',
  'viewport',
  'item-group',
  'item',
  'prev-trigger',
  'next-trigger',
  'indicator-group',
  'indicator',
])
