import type { ComponentMeta } from '../spec/types'

// trigger 与 content 缺一即违约：前者是右键手势的落点与可及名字的来源，
// 后者是 role=menu 容器（aria-controls/aria-labelledby 无从指向）。
// 没有 item 的右键菜单不成其为菜单。root/positioner/separator/group/arrow 可缺省。
export const contextMenuMeta: ComponentMeta = {
  component: 'context-menu',
  requiredParts: ['trigger', 'content', 'item'],
}
