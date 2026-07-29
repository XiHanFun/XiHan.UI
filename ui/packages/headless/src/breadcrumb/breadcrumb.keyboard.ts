import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/'

export const breadcrumbKeyboard: KeyboardTable = {
  component: 'breadcrumb',
  source: APG,
  rows: [
    { id: 'breadcrumb.kbd.link', keys: ['Enter'], when: 'focus in link, 非当前页', does: '跟随链接（原生 <a href> 的激活行为，面包屑自己不监听按键）' },
    { id: 'breadcrumb.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus in root', does: '逐条走过可点的链接；面包屑不做 roving tabindex，当前页那条带 tabindex=-1 自动脱序' },
  ],
}
