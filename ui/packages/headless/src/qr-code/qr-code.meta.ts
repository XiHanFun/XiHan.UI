import type { ComponentMeta } from '../spec/types'

export const qrCodeMeta: ComponentMeta = {
  component: 'qr-code',
  // 只有根：模块画在根内部，没有第二个角色节点
  requiredParts: ['root'],
}
