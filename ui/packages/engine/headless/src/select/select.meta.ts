import type { ComponentMeta } from '../spec/types'

// trigger、content、list、item 必需——list 承载 role=listbox 与滚动，缺了它整份列表就没有语义；
// footer 是可选的底部操作区。label / positioner / indicator 可缺省，
// hidden-select 由根部件自行装配，不需要作者渲染。
export const selectMeta: ComponentMeta = {
  component: 'select',
  requiredParts: ['trigger', 'content', 'list', 'item'],
}
