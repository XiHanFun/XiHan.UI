import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const toolbarAnatomy = createAnatomy('toolbar', [
  'root',
  'group',
  'item',
  'separator',
])

// 集合只认 item：group 与 separator 同样带 data-scope，但不入导航——
// 方向键不会停在分组容器或分隔线上，Home/End 也不会把端点算到它们头上。
// 分组里的条目照样查得到：queryItems 的归属判据是「父链上最近的 root 是不是本容器」，
// 中间隔着 group 不影响，嵌套的另一条工具条才会被切开。
export const toolbarItemQuery: ItemQuery = { scope: toolbarAnatomy.name, part: 'item' }
