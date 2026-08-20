import type { KeyboardTable } from '../spec/types'

// 组件自己就是键盘装置：它接的是作者用 keys 指定的那一组组合，不属于任何 APG 模式。
// 组合怎么从一次按键上读出来，归 UI Events 里的 keydown。
const SPEC = 'https://www.w3.org/TR/uievents/#event-type-keydown'

export const hotkeysKeyboard: KeyboardTable = {
  component: 'hotkeys',
  source: SPEC,
  rows: [
    {
      id: 'hotkeys.kbd.trigger',
      keys: ['keys 指定的组合'],
      when: 'enabled 未关，且不在输入法组合期',
      does: '触发 onHotKey；preventDefault 开启（默认）时同时拦下浏览器的默认动作',
    },
    {
      id: 'hotkeys.kbd.typing',
      keys: ['keys 指定的组合'],
      when: '组合里没有 Ctrl / Meta / Alt，且按键落在输入框、文本域或可编辑区里',
      does: '不触发也不拦：这类组合与打字撞车，输入优先',
    },
  ],
}
