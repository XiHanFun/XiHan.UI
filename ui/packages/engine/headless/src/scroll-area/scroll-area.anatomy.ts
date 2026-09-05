import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// viewport 是真正 overflow:auto 的那层；content 是内容包裹层，横向溢出靠它撑出宽度；
// scrollbar 是某条轴那台 scrollbar 的挂载点，同时充当它的根节点——
// 里面的 track / thumb / corner 归 scrollbar 那套解剖（data-scope="scrollbar"），两个组件共用一份滚动条。
export const scrollAreaAnatomy = createAnatomy('scroll-area', [
  'root',
  'viewport',
  'content',
  'scrollbar',
])
