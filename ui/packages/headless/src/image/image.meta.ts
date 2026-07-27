import type { ComponentMeta } from '../spec/types'

// 图片本身是这个组件存在的理由，root 是状态属性的落点；
// fallback 可省（不给回退内容时加载失败就只剩空位，这是作者的选择）。
export const imageMeta: ComponentMeta = {
  component: 'image',
  requiredParts: ['root', 'image'],
}
