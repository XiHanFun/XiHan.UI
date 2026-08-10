import type { ComponentMeta } from '../spec/types'

export const dynamicInputMeta: ComponentMeta = {
  component: 'dynamic-input',
  // 只有根是必备的：一行都没有也是一份合法的空列表，行与把手按当前值铺
  requiredParts: ['root'],
}
