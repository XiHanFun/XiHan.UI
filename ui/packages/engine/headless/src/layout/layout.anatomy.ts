import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const layoutAnatomy = createAnatomy('layout', [
  'root',
  'header',
  // 遮罩排在侧栏之前：两层同一个层号，先渲染的那层在下面
  'sider-backdrop',
  'sider',
  'content',
  'footer',
  'sider-trigger',
])
