import type { ComponentMeta } from '../spec/types'

// root 承载 role=toolbar、aria-orientation 与键盘收口，与 item 同为必需。
// group 与 separator 是可选结构。
export const toolbarMeta: ComponentMeta = {
  component: 'toolbar',
  requiredParts: ['root', 'item'],
}
