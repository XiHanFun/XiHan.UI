import type { ComponentMeta } from '../spec/types'

export const typographyMeta: ComponentMeta = {
  component: 'typography',
  // 只有根是必备的：标题、段落、行内文字、链接各写各的，数量不限，一个不写也是一块合法的正文
  requiredParts: ['root'],
}
