import type { ComponentMeta } from '../spec/types'

// root 承载 role=group 与组标题的指向，缺了它这堆复选框对读屏就是一盘散沙；
// 无条目的组则无从勾选。trigger 是可选件——不接全选就不必写。
export const checkboxGroupMeta: ComponentMeta = {
  component: 'checkbox-group',
  requiredParts: ['root', 'item'],
}
