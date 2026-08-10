import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// indicator 是事件那一刻的圆点，connector 是圆点与圆点之间的那截线，
// content 装这一条的文字（title / description / time 三块）。
export const timelineAnatomy = createAnatomy('timeline', [
  'root',
  'item',
  'indicator',
  'connector',
  'content',
  'title',
  'description',
  'time',
])
