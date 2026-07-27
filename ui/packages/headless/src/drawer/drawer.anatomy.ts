import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// 比对话框多一个 root：滑出边（data-side）需要一个不跟着浮层搬走的落点——
// content 会被 portal 到 body，作者写在页面里的样式选不到它的祖先，
// 而 root 始终留在原地，"这个抽屉从哪边出来"这句话在收起态也说得出口。
export const drawerAnatomy = createAnatomy('drawer', [
  'root',
  'trigger',
  'backdrop',
  'positioner',
  'content',
  'title',
  'description',
  'close-trigger',
])
