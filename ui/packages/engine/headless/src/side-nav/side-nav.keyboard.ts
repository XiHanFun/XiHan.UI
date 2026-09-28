/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 side nav 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/'

export const sideNavKeyboard: KeyboardTable = {
  component: 'side-nav',
  source: APG,
  rows: [
    { id: 'side-nav.kbd.press', keys: ['Enter', 'Space'], when: 'held on link / branch-trigger, 侧栏未禁用且入口未禁用', does: '按住期间链接行或分支行投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，弹出面板随选中收起时一并撤下。导航当前（aria-current）与按压互相独立，激活与展开语义照旧由这一次按键承担' },
    { id: 'side-nav.kbd.activate', keys: ['Enter', 'Space'], when: 'focus in branch-trigger', does: '展开/收起该枝（原生按钮激活）' },
    { id: 'side-nav.kbd.link', keys: ['Enter'], when: 'focus in link', does: '激活链接（原生行为）并落选中' },
    { id: 'side-nav.kbd.down', keys: ['ArrowDown'], when: 'focus in 行', does: '下一可见行（roving tabindex）' },
    { id: 'side-nav.kbd.up', keys: ['ArrowUp'], when: 'focus in 行', does: '上一可见行' },
    { id: 'side-nav.kbd.expand', keys: ['ArrowRight'], when: 'focus in 收起的分支行', does: '展开该枝；已展开时进第一个子行（RTL 与 ArrowLeft 对调）' },
    { id: 'side-nav.kbd.collapse', keys: ['ArrowLeft'], when: 'focus in 展开的分支行', does: '收起该枝；叶子或已收起时回父分支（RTL 与 ArrowRight 对调）' },
    { id: 'side-nav.kbd.home', keys: ['Home'], when: 'focus in 行', does: '第一可见行' },
    { id: 'side-nav.kbd.end', keys: ['End'], when: 'focus in 行', does: '最后一可见行' },
    { id: 'side-nav.kbd.popout-open', keys: ['ArrowRight', 'Enter', 'Space'], when: 'focus in 折叠态顶层分支行', does: '弹出子级面板并落焦第一行（RTL 与 ArrowLeft 对调）' },
    { id: 'side-nav.kbd.popout-close', keys: ['ArrowLeft', 'Escape'], when: 'focus in 弹出面板', does: '收回面板，焦点还给触发按钮（RTL 与 ArrowRight 对调；Escape 归消解层）', restoresFocus: true },
    { id: 'side-nav.kbd.search-type', keys: ['可打印字符'], when: 'focus in input', does: '改写检索词：导航树裁到只剩命中的那几枝，命中入口的祖先自动展开、其余收起；搜索里的展开收起只记在搜索视图里，不改写 expandedValue' },
    { id: 'side-nav.kbd.search-to-list', keys: ['ArrowDown', 'Enter'], when: 'focus in input', does: '焦点交给导航行：搜索中落在剩下的第一行，不在搜索中落在 Tab 锚点' },
    { id: 'side-nav.kbd.tooltip-show', keys: ['Tab', 'ArrowDown', 'ArrowUp', 'Home', 'End'], when: 'collapsed 落成图标栏、放了 tooltip 部件，焦点落到只剩图标的行（顶层叶子；collapsedPopout 关掉时也含顶层分支）', does: '立即显示该行的名称提示，不走悬停延时；焦点离开即收。提示对读屏隐藏，可及名仍由行文字承担' },
    { id: 'side-nav.kbd.tooltip-escape', keys: ['Escape'], when: '名称提示显示中', does: '收起名称提示，焦点留在行上（Escape 归消解层按层栈仲裁）' },
    { id: 'side-nav.kbd.search-escape', keys: ['Escape'], when: 'focus in input, 检索词非空', does: '清空检索词，回到整棵树与原来的展开态，焦点留在搜索框；检索词已空时不拦截这一下' },
  ],
}
