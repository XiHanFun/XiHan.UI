import type { ComponentMeta } from '../spec/types'

// 只有 root 必备：文字可以直接落在 root 里，关闭钮只在 closable 时才需要，
// 两者都不是"缺了就没处安放语义"的节点。
export const tagMeta: ComponentMeta = {
  component: 'tag',
  requiredParts: ['root'],
}
