import type { KeyboardTable } from '../spec/types'

const SPEC = 'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission'

// Form 一个按键都不接管，键盘表因此是空的——这不是漏写：
// · 回车提交走的是 `<form>` 的隐式提交，浏览器自己会派 submit 事件，组件在那里收口；
// · 提交/重置两颗键是原生 type=submit / type=reset 的 button，空格与回车归浏览器；
// · 错误摘要里的每一条是原生 `<a href>`，回车激活也归浏览器（组件只在 click 上把焦点接过来）。
// 凡是浏览器已经做对的事都不再拦一遍：拦了就得自己重做一份，且必然与原生行为漂移
// （输入法、组合键、按住连发这些都要重新对一遍）。
export const formKeyboard: KeyboardTable = {
  component: 'form',
  source: SPEC,
  rows: [],
}
