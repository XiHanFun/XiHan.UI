import type { KeyboardTable } from '../spec/types'

// APG 没有"聊天输入框"这个模式，能对上的只有多行文本域的通用约定：
// 键盘交互绝大部分归浏览器，组件只额外接一个 Enter。故出处指向模式总览页而非某一章。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/'

export const composerKeyboard: KeyboardTable = {
  component: 'composer',
  source: APG,
  rows: [
    {
      id: 'composer.kbd.enter',
      keys: ['Enter'],
      when: '焦点在输入框、未处于 IME 组合态、submitOnEnter 为真且可提交',
      does: '提交当前输入并清空',
    },
    {
      id: 'composer.kbd.shift-enter',
      keys: ['Shift+Enter'],
      when: '焦点在输入框',
      does: '不归组件管：原样放行，浏览器插入换行',
    },
    {
      id: 'composer.kbd.ime-enter',
      keys: ['Enter'],
      when: '处于 IME 组合态（isComposing 为真）',
      does: '不提交：交给输入法确认候选词',
    },
    {
      id: 'composer.kbd.submit-press',
      keys: ['Space', 'Enter'],
      when: '焦点在发送/停止按钮上',
      does: '按 data-mode 触发提交或停止',
    },
  ],
}
