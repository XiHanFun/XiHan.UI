import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
//
// 分工：viewport 是真正 overflow:auto 的那层，滚动全归浏览器；
// content 只负责撑出总尺寸（内联样式给主轴长度），让滚动条的行程与整份列表等长；
// item 是被渲出来的那几条，位移由连接层写进内联样式，落在 content 的定位上下文里。
// root 是外壳：承载方向与"正在滚"的标记，供皮肤取用。
export const virtualizerAnatomy = createAnatomy('virtualizer', [
  'root',
  'viewport',
  'content',
  'item',
])
