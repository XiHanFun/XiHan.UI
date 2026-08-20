import type { KeyboardTable } from '../spec/types'

// 分组容器的语义与禁用连坐都由 HTML 的 fieldset 元素定义，规格出处指向那一节。
const SPEC = 'https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element'

// Fieldset 是容器，不接收焦点；里面放什么控件、怎么响应键盘，归那些控件自己。
export const fieldsetKeyboard: KeyboardTable = {
  component: 'fieldset',
  source: SPEC,
  rows: [],
}
