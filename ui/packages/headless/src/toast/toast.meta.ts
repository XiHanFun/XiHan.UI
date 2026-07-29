import type { ComponentMeta } from '../spec/types'

// 只有 root 必需：它承载 role/aria-live，缺了这一层读屏不会宣读这条通知。
// 其余部件按内容可省。
export const toastMeta: ComponentMeta = {
  component: 'toast',
  requiredParts: ['root'],
}
