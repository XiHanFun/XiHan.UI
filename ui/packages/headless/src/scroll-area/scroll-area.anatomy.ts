import { createAnatomy } from '@xihan-ui/kernel'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// viewport 是真正 overflow:auto 的那层；content 是内容包裹层，横向溢出靠它撑出宽度；
// scrollbar / thumb 是自绘的视觉替身，位置与长度由连接层写进内联样式；corner 是右下角那块补丁。
export const scrollAreaAnatomy = createAnatomy('scroll-area', [
  'root',
  'viewport',
  'content',
  'scrollbar',
  'thumb',
  'corner',
])
