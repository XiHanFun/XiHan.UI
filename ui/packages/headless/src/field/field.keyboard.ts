import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'

// Field 只做标注装配，键盘交互全部属于作者渲染的控件本身。
export const fieldKeyboard: KeyboardTable = {
  component: 'field',
  source: APG,
  rows: [],
}
