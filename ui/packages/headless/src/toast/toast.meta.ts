import type { ComponentMeta } from '../spec/types'

// 只有 root 是非它不可的：它承载 role/aria-live，缺了这一层读屏根本不会宣读这条通知。
// 其余部件按内容可省——只有描述没有标题、不带操作、不可关闭，都是成立的形态。
export const toastMeta: ComponentMeta = {
  component: 'toast',
  requiredParts: ['root'],
}
