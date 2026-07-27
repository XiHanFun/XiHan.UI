import type { ComponentMeta } from '../spec/types'

// content 未渲染即违约；root 同样必备——滑出边的样式钩子（data-side）挂在它身上，
// 缺了它，收起态就没有任何地方说得出这个抽屉从哪边来。
// backdrop / positioner / title / description 可缺省（缺省时不输出对应 aria 引用）。
export const drawerMeta: ComponentMeta = {
  component: 'drawer',
  requiredParts: ['root', 'content'],
}
