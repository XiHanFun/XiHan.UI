import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/'

export const sideNavKeyboard: KeyboardTable = {
  component: 'side-nav',
  source: APG,
  rows: [
    { id: 'side-nav.kbd.activate', keys: ['Enter', 'Space'], when: 'focus in branch-trigger', does: '展开/收起该枝（原生按钮激活）' },
    { id: 'side-nav.kbd.link', keys: ['Enter'], when: 'focus in link', does: '激活链接（原生行为）并落选中' },
    { id: 'side-nav.kbd.down', keys: ['ArrowDown'], when: 'focus in 行', does: '下一可见行（roving tabindex）' },
    { id: 'side-nav.kbd.up', keys: ['ArrowUp'], when: 'focus in 行', does: '上一可见行' },
    { id: 'side-nav.kbd.expand', keys: ['ArrowRight'], when: 'focus in 收起的分支行', does: '展开该枝；已展开时进第一个子行（RTL 与 ArrowLeft 对调）' },
    { id: 'side-nav.kbd.collapse', keys: ['ArrowLeft'], when: 'focus in 展开的分支行', does: '收起该枝；叶子或已收起时回父分支（RTL 与 ArrowRight 对调）' },
    { id: 'side-nav.kbd.home', keys: ['Home'], when: 'focus in 行', does: '第一可见行' },
    { id: 'side-nav.kbd.end', keys: ['End'], when: 'focus in 行', does: '最后一可见行' },
  ],
}
