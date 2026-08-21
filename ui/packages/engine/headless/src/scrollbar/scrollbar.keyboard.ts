import type { KeyboardTable } from '../spec/types'

// 自绘滚动条在 APG 里没有对应模式，出处取 WCAG 那条「键盘可达」的通用技法。
// 表里全是滑块进 Tab 序（focusable）之后才有的键：缺省不进序，滚动仍归滚动容器自己。
const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

export const scrollbarKeyboard: KeyboardTable = {
  component: 'scrollbar',
  source: WCAG,
  rows: [
    { id: 'scrollbar.kbd.back', keys: ['ArrowUp', 'ArrowLeft'], when: 'focus in thumb, focusable, 与本轴同向', does: '往回滚一步（step，默认 40px）；交叉轴的那一个不拦，照常交给页面' },
    { id: 'scrollbar.kbd.forward', keys: ['ArrowDown', 'ArrowRight'], when: 'focus in thumb, focusable, 与本轴同向', does: '往前滚一步' },
    { id: 'scrollbar.kbd.page-back', keys: ['PageUp'], when: 'focus in thumb, focusable', does: '往回滚一屏（按滚动容器的可视长度）' },
    { id: 'scrollbar.kbd.page-forward', keys: ['PageDown'], when: 'focus in thumb, focusable', does: '往前滚一屏' },
    { id: 'scrollbar.kbd.start', keys: ['Home'], when: 'focus in thumb, focusable', does: '滚到起点' },
    { id: 'scrollbar.kbd.end', keys: ['End'], when: 'focus in thumb, focusable', does: '滚到终点' },
    { id: 'scrollbar.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focusable', does: '滑块是一个 Tab 停靠点；不开 focusable 时整条退出 Tab 序，也对读屏隐藏' },
  ],
}
