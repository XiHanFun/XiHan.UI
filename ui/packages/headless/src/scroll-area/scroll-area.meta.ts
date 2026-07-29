import type { ComponentMeta } from '../spec/types'

// root 承载指针进出的判据，viewport 是真正滚动的那层，content 是内容包裹层，三者必需。
// scrollbar / thumb / corner 可缺省，缺省时没有自绘滚动条。
export const scrollAreaMeta: ComponentMeta = {
  component: 'scroll-area',
  requiredParts: ['root', 'viewport', 'content'],
}
