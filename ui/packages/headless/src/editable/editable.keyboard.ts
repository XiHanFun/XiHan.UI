import type { KeyboardTable } from '../spec/types'

// 就地编辑不在 APG 的模式清单里：它是"一段文字"与"一个文本框"轮流上场，
// 两者各自的键盘行为本来就归浏览器管（光标、选区、撤销全是原生的）。
// 组件只额外定义"编辑态怎么收尾"这三下，故出处指向 HTML 规范的文本输入状态。
const SPEC = 'https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)'

export const editableKeyboard: KeyboardTable = {
  component: 'editable',
  source: SPEC,
  rows: [
    {
      id: 'editable.kbd.submit',
      keys: ['Enter'],
      when: 'focus in input, submitMode 为 enter 或 both',
      does: '提交当下的值并回到预览态；其余模式不接管该键，交回给浏览器与外层表单',
    },
    {
      id: 'editable.kbd.cancel',
      keys: ['Escape'],
      when: 'focus in input',
      does: '撤销回上一次提交的值并回到预览态',
    },
    {
      id: 'editable.kbd.leave',
      keys: ['Tab', 'Shift+Tab'],
      when: 'focus in input',
      does: '按 submitMode 收尾（blur/both 提交，enter/none 撤销）；不拦默认行为，焦点照常移出',
    },
  ],
}
