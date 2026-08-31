import type { ComponentMeta } from '../spec/types'

// 两颗按钮缺一就只剩一半出口，故与 root 一并必需；其余按用法取舍。
export const approvalMeta: ComponentMeta = {
  component: 'approval',
  requiredParts: ['root', 'approve-trigger', 'deny-trigger'],
}
