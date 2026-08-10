import type { KeyboardTable } from '../spec/types'

// 跑马灯是容器，不接收焦点、不接管按键；轨道里放的控件自己响应键盘。
// 焦点落进轨道时轨道停住，那条是皮肤里的 :focus-within 规则，不经按键。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const marqueeKeyboard: KeyboardTable = {
  component: 'marquee',
  source: APG,
  rows: [],
}
