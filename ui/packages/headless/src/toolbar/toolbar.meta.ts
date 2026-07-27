import type { ComponentMeta } from '../spec/types'

// root 缺省则 role=toolbar、aria-orientation 与键盘收口都无处安放；
// 没有条目的工具条无从操作。group 与 separator 是可选结构：
// 一条只放三个按钮的工具条既不必分组，也不必划线。
export const toolbarMeta: ComponentMeta = {
  component: 'toolbar',
  requiredParts: ['root', 'item'],
}
