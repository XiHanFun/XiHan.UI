import type { KeyboardTable } from '../spec/types'

// 输入框里的光标、选区与撤销全归浏览器；组件自己只多出一个明暗切换钮。
// 那个钮是原生 button，键盘约定取自 APG 的按钮模式。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'

export const passwordInputKeyboard: KeyboardTable = {
  component: 'password-input',
  source: APG,
  rows: [
    {
      id: 'password-input.kbd.toggle',
      keys: ['Enter', 'Space'],
      when: 'focus on visibility-trigger, 控件未禁用',
      does: '切换明暗；切换钮是原生 button，这两个键由平台翻成 click。焦点留在按钮上，框里的光标与选中范围原样放回',
    },
    {
      id: 'password-input.kbd.caps-lock',
      keys: ['CapsLock'],
      when: 'focus in input',
      does: '每次按键都重读一次大写锁定状态：开着就亮起提示，焦点离开输入框即熄灭',
    },
  ],
}
