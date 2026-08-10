import type { ComponentMeta } from '../spec/types'

export const marqueeMeta: ComponentMeta = {
  component: 'marquee',
  // 两个都是必备的：动画挂在 content 上，缺了它窗口里就是一段不动的内容
  requiredParts: ['root', 'content'],
}
