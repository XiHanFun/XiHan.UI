import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

// 组件不监听任何按键，滚动仍归浏览器；表里记的是平台行为，以及唯一动过的视口 Tab 位。
export const scrollAreaKeyboard: KeyboardTable = {
  component: 'scroll-area',
  source: APG,
  rows: [
    { id: 'scroll-area.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: '焦点走到滚动区', does: '视口带 tabindex=0，键盘用户能停在滚动区上；组件只在这一处动过 Tab 序列' },
    { id: 'scroll-area.kbd.page', keys: ['PageUp', 'PageDown'], when: 'focus in viewport', does: '按视口高度翻页滚动；组件不监听、不拦截' },
    { id: 'scroll-area.kbd.arrow', keys: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'], when: 'focus in viewport', does: '逐行/逐列滚动；组件不监听、不拦截' },
    { id: 'scroll-area.kbd.edge', keys: ['Home', 'End'], when: 'focus in viewport', does: '滚到内容两端；组件不监听、不拦截' },
    { id: 'scroll-area.kbd.space', keys: ['Space', 'Shift+Space'], when: 'focus in viewport', does: '整屏翻页；组件不监听、不拦截' },
  ],
}
