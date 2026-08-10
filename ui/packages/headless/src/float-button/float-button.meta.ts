import type { ComponentMeta } from '../spec/types'

// 三个都必备：root 是定位壳并承载悬停进出，trigger 是唯一可点、可聚焦的部件，
// list 是 aria-controls 指向的那个节点，缺了它触发器就指向了不存在的 id。
export const floatButtonMeta: ComponentMeta = {
  component: 'float-button',
  requiredParts: ['root', 'trigger', 'list'],
}
