import type { ComponentMeta } from '../spec/types'

// 只有 root 是必需的：图标、说明、操作都可以不给，只写一行标题也是一个合法结果。
export const resultMeta: ComponentMeta = {
  component: 'result',
  requiredParts: ['root'],
}
