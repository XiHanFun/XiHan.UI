import type { ComponentMeta } from '../spec/types'

// 只有 root 是必需的：图标、说明、操作都可以不给，标题也允许由作者直接写在 root 里。
export const emptyStateMeta: ComponentMeta = {
  component: 'empty-state',
  requiredParts: ['root'],
}
