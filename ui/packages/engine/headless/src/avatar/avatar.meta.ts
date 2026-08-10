import type { ComponentMeta } from '../spec/types'

// image 可省，只给回退内容也成立
export const avatarMeta: ComponentMeta = {
  component: 'avatar',
  requiredParts: ['fallback'],
}
