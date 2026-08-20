import type { ComponentMeta } from '../spec/types'

// positioner 缺席则位置与尺寸没有落脚点，面板摆不出来；content 缺席则 role=dialog、
// 可及名与 Esc 收口都无处安放。其余角色节点（触发器、标题栏、把手、按钮）都可以不写。
export const floatingPanelMeta: ComponentMeta = {
  component: 'floating-panel',
  requiredParts: ['positioner', 'content'],
}
