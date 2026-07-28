import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
//
// 分工：viewport 是真正 overflow:auto 的那层，滚动本身全归浏览器；
// content 只是内容包裹层（横向溢出要靠它撑出宽度，尺寸变化也观察它）；
// scrollbar / thumb 是自绘的视觉替身，位置与长度由连接层写进内联样式；
// corner 是两条滚动条同时在场时右下角那块补丁。
export const scrollAreaAnatomy = createAnatomy('scroll-area', [
  'root',
  'viewport',
  'content',
  'scrollbar',
  'thumb',
  'corner',
])
