import type { ComponentMeta } from '../spec/types'

// trigger 与 content 缺一即违约（aria-haspopup/aria-controls 无从指向）；
// 没有 item 的 menu 不成其为菜单。positioner/separator/arrow 可缺省。
export const menuMeta: ComponentMeta = {
  component: 'menu',
  requiredParts: ['trigger', 'content', 'item'],
}
