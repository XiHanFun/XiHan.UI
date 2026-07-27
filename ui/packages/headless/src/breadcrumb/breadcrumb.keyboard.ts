import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/'

// 面包屑不接管任何按键：可点的部件是原生 <a href>，激活与 Tab 序列全部由平台提供。
// 这张表因此只记"平台替我们做了什么"，以及我们唯一动过的那一处（当前页脱序）。
export const breadcrumbKeyboard: KeyboardTable = {
  component: 'breadcrumb',
  source: APG,
  rows: [
    { id: 'breadcrumb.kbd.link', keys: ['Enter'], when: 'focus in link, 非当前页', does: '跟随链接（原生 <a href> 的激活行为，面包屑自己不监听按键）' },
    { id: 'breadcrumb.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus in root', does: '逐条走过可点的链接；面包屑不做 roving tabindex，当前页那条带 tabindex=-1 自动脱序' },
  ],
}
