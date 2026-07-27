import type { KeyboardTable } from '../spec/types'

// 单行文本框的键盘交互本来就归浏览器管（光标移动、选区、撤销全是原生的），
// 组件自己只额外接一个键。Escape 清空是搜索框沿用下来的惯例，APG 里没有对应条目，
// 故出处指向 HTML 规范的文本输入状态而不是 APG 模式页。
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
