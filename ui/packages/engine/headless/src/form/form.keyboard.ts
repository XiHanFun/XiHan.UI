import type { KeyboardTable } from '../spec/types'

const SPEC = 'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission'

// Form 一个按键都不接管，键盘表为空不是漏写：
// · 回车提交走 `<form>` 的隐式提交，浏览器派出 submit 事件后组件在那里收口；
// · 提交/重置两颗键是原生 type=submit / type=reset 的 button，空格与回车归浏览器；
// · 错误摘要的每一条是原生 `<a href>`，回车激活归浏览器，组件只在 click 上接管焦点。
export const formKeyboard: KeyboardTable = {
  component: 'form',
  source: SPEC,
  rows: [],
}
