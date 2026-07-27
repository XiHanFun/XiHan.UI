import type { ComponentMeta } from '../spec/types'

// trigger 与 content 缺一即违约（aria-haspopup/aria-controls 无从指向）；
// 没有 item 的 select 不成其为列表框。label/positioner/indicator 这些可缺省，
// hidden-select 由根部件自行装配、不需要作者渲染。
export const selectMeta: ComponentMeta = {
  component: 'select',
  requiredParts: ['trigger', 'content', 'item'],
}
