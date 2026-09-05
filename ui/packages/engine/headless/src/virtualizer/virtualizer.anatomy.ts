import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// viewport 是真正 overflow:auto 的那层；content 撑出总尺寸让滚动行程与整份列表等长；
// item 是被渲出来的那几条，位移由连接层写进内联样式；root 是外壳，承载方向与正在滚的标记。
export const virtualizerAnatomy = createAnatomy('virtualizer', [
  'root',
  'viewport',
  'content',
  'item',
])
