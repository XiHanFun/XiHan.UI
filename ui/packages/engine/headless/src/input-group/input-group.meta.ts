import type { ComponentMeta } from '../spec/types'

export const inputGroupMeta: ComponentMeta = {
  component: 'input-group',
  // 只有根是必备的：item 是前后缀块，一组只有控件、没有固定文本时不出现
  requiredParts: ['root'],
}
