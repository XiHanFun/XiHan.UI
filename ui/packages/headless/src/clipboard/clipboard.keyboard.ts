import type { KeyboardTable } from '../spec/types'

// 键盘全归平台：复制按钮与只读展示框都是原生元素，本组件不接任何键，表为空。
const SPEC = 'https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element'

export const clipboardKeyboard: KeyboardTable = {
  component: 'clipboard',
  source: SPEC,
  rows: [],
}
