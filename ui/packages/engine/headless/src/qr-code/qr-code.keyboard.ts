import type { KeyboardTable } from '../spec/types'

// 二维码是一张图，不可聚焦、不接任何按键。
const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'

export const qrCodeKeyboard: KeyboardTable = {
  component: 'qr-code',
  source: APG,
  rows: [],
}
