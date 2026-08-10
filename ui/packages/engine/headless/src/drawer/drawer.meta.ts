import type { ComponentMeta } from '../spec/types'

// root 与 content 必需（root 承载 data-side 样式钩子）。
// backdrop / positioner / title / description 可缺省。
export const drawerMeta: ComponentMeta = {
  component: 'drawer',
  requiredParts: ['root', 'content'],
}
