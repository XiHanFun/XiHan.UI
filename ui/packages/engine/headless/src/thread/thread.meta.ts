import type { ComponentMeta } from '../spec/types'

// 粘底需要滚动容器与内容容器，故两者必需；scroll-button 与 live-region 可选。
export const threadMeta: ComponentMeta = {
  component: 'thread',
  requiredParts: ['root', 'viewport', 'content'],
}
