import type { ComponentMeta } from '../spec/types'

// root 缺了就没有 menubar 语义，也没有 roving tabindex 的作用域；
// trigger 与 content 缺一即违约（aria-controls/aria-labelledby 无从指向）；
// 没有 item 的菜单不成其为菜单。positioner/separator/group/item-text/item-indicator 可缺省。
export const menubarMeta: ComponentMeta = {
  component: 'menubar',
  requiredParts: ['root', 'trigger', 'content', 'item'],
}
