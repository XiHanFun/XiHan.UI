import type { ComponentMeta } from '../spec/types'

// 触发器与浮层缺一即违约（aria-controls 无从指向）；两颗按钮缺一，「确认 / 取消」就只剩一半。
// 根框住触发器并承载整组状态，也必备。title / description 可按内容取舍。
export const popconfirmMeta: ComponentMeta = {
  component: 'popconfirm',
  requiredParts: ['root', 'trigger', 'content', 'confirm-trigger', 'cancel-trigger'],
}
