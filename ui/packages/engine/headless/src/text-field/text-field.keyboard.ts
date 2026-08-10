import type { KeyboardTable } from '../spec/types'

// 单行文本框的键盘交互归浏览器管，组件只额外接一个 Escape 清空。
// APG 里没有对应条目，故出处指向 HTML 规范的文本输入状态。
const SPEC = 'https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)'

export const textFieldKeyboard: KeyboardTable = {
  component: 'text-field',
  source: SPEC,
  rows: [
    {
      id: 'text-field.kbd.clear',
      keys: ['Escape'],
      when: 'focus in input, clearable 且值非空, not disabled/readOnly',
      does: '清空值；三个条件缺一即不接管该键，交回给外层与浏览器',
    },
  ],
}
