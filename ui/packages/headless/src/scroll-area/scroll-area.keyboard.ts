import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

// 组件不监听任何按键：滚动条被藏起来另画了一套，滚动本身仍是浏览器的。
// 这张表因此记的是"平台替我们做了什么"，以及我们唯一动过的那一处（视口占一个 Tab 位）。
// 每一行都对应一条"不许接管"的约束——哪天有人在视口上加了 keydown 处理器并 preventDefault，
// 一致性用例会当场变红。
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
