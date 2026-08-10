import type { ComponentMeta } from '../spec/types'

export const qrCodeMeta: ComponentMeta = {
  // logo 可选：没写这个部件时整张码照画，root 上也不落 data-logo
  component: 'qr-code',
  requiredParts: ['root'],
}
