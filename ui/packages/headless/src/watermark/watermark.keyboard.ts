import type { KeyboardTable } from '../spec/types'

// 水印只往内容上盖一层印子，不可聚焦、不接管按键；被盖住的内容照常用键盘操作。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const watermarkKeyboard: KeyboardTable = {
  component: 'watermark',
  source: APG,
  rows: [],
}
