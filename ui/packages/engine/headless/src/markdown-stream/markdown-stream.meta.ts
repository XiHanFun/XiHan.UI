import type { ComponentMeta } from '../spec/types'

// root 与 content 必需；block 按数据铺开，空正文时一个都没有；live-region 只在开了播报时渲。
export const markdownStreamMeta: ComponentMeta = {
  component: 'markdown-stream',
  requiredParts: ['root', 'content'],
}
