import type { ComponentMeta } from '../spec/types'

// trigger、content、item 必需；label / positioner / indicator 可缺省，
// hidden-select 由根部件自行装配，不需要作者渲染。
export const selectMeta: ComponentMeta = {
  component: 'select',
  requiredParts: ['trigger', 'content', 'item'],
}
