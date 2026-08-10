import type { ComponentMeta } from '../spec/types'

export const descriptionsMeta: ComponentMeta = {
  // 只有根是必备的：一组都不摆也是一份合法的描述列表
  component: 'descriptions',
  requiredParts: ['root'],
}
