import type { ComponentMeta } from '../spec/types'

// 图片取不到时 fallback 是唯一还看得见的内容，缺它即违约；image 可省（只给回退内容也成立）。
export const avatarMeta: ComponentMeta = {
  component: 'avatar',
  requiredParts: ['fallback'],
}
