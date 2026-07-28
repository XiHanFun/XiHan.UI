import type { ItemQuery } from '@xihan-ui/behavior'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const anchorAnatomy = createAnatomy('anchor', [
  'root',
  'list',
  'item',
  'link',
  'indicator',
])

// 集合只认 link：item 只是排版用的行容器、indicator 是装饰，两者同样带 data-scope，
// 但滚动结算与指示条定位都只查 link。
// 归属过滤保证嵌套的另一个 Anchor 不会被外层吞并。
export const anchorItemQuery: ItemQuery = { scope: anchorAnatomy.name, part: 'link' }
