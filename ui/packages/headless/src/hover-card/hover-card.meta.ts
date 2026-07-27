import type { ComponentMeta } from '../spec/types'

// trigger 缺省则无从悬停/聚焦，content 缺省则没有卡片可言（aria-controls 也无从指向）；
// root/positioner/arrow 可缺省。
export const hoverCardMeta: ComponentMeta = {
  component: 'hover-card',
  requiredParts: ['trigger', 'content'],
}
