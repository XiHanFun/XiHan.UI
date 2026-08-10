import type { ComponentMeta } from '../spec/types'

// 只有根是必备的：头、侧栏、内容、脚与折叠把手按需摆，只放一段也是一副合法的骨架。
export const layoutMeta: ComponentMeta = {
  component: 'layout',
  requiredParts: ['root'],
}
