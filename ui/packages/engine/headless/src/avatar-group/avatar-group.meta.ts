import type { ComponentMeta } from '../spec/types'

export const avatarGroupMeta: ComponentMeta = {
  component: 'avatar-group',
  // 只有根是必备的：没超出上限时就没有「+N」，overflow-item 不写也是一组合法的头像
  requiredParts: ['root'],
}
