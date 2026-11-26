// @vitest-environment jsdom
// xh-side-nav 不写部件时按标准结构生成：平铺与图标栏两种排布，生成的节点都与作者手写全套部件逐节点相同；
// 给了 icon 的入口在行文字前生成一枚 xh-icon。
import { describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'
import { mountElement, settle, structureSnapshot } from './structure-snapshot'

defineXhElements()

const HOME = { name: 'home', viewBox: '0 0 24 24', nodes: [{ tag: 'path', attrs: { d: 'M3 10l9-7 9 7' } }] }
const USERS = { name: 'users', viewBox: '0 0 24 24', nodes: [{ tag: 'circle', attrs: { cx: '9', cy: '8', r: '3.5' } }] }

const COLLECTION = [
  { value: 'dashboard', label: '工作台', href: '#/dashboard', icon: HOME },
  {
    value: 'user',
    label: '用户管理',
    icon: USERS,
    children: [
      { value: 'user-list', label: '用户列表', href: '#/user/list' },
      { value: 'user-audit', label: '审计', children: [{ value: 'user-log', label: '操作日志', href: '#/user/log' }] },
    ],
  },
]

/** 手写全套部件；popout 时顶层分支的子层外面套定位层。图标的 icon 只走 property，挂上之后再赋。 */
function manual(popout: boolean): string {
  const content = '<ul data-xh-part="branch-content"><li data-xh-part="item"><a data-xh-part="link" value="user-list"><span data-xh-part="link-text">用户列表</span></a></li><li data-xh-part="branch" value="user-audit"><button data-xh-part="branch-trigger"><span data-xh-part="branch-text">审计</span><span data-xh-part="branch-indicator"></span></button><ul data-xh-part="branch-content"><li data-xh-part="item"><a data-xh-part="link" value="user-log"><span data-xh-part="link-text">操作日志</span></a></li></ul></li></ul>'
  return `<nav data-xh-part="root"><ul data-xh-part="list">${[
    '<li data-xh-part="item"><a data-xh-part="link" value="dashboard"><xh-icon data-icon-slot="home"></xh-icon><span data-xh-part="link-text">工作台</span></a></li>',
    `<li data-xh-part="branch" value="user"><button data-xh-part="branch-trigger"><xh-icon data-icon-slot="users"></xh-icon><span data-xh-part="branch-text">用户管理</span><span data-xh-part="branch-indicator"></span></button>${popout ? `<div data-xh-part="positioner">${content}</div>` : content}</li>`,
  ].join('')}</ul></nav>`
}

function withIcons(container: Element): void {
  for (const el of Array.from(container.querySelectorAll<HTMLElement & { icon?: unknown }>('xh-icon[data-icon-slot]'))) {
    el.icon = el.getAttribute('data-icon-slot') === 'home' ? HOME : USERS
    el.removeAttribute('data-icon-slot')
  }
}

describe('xh-side-nav 生成结构', () => {
  it('平铺：只给 collection 生成的节点与手写全套部件逐节点相同，当前页与展开态都在', async () => {
    const props = { collection: COLLECTION, expandedValue: ['user'] }
    const auto = mountElement('xh-side-nav', { attrs: { 'default-value': 'user-list' }, props })
    const hand = mountElement('xh-side-nav', { attrs: { 'default-value': 'user-list' }, props, inner: manual(false) })
    withIcons(hand.container)
    await settle(auto.container)
    await settle(hand.container)
    expect(structureSnapshot(auto.container)).toEqual(structureSnapshot(hand.container))
    expect(auto.container.querySelector('[aria-current="page"]')?.textContent).toBe('用户列表')
    expect(auto.container.querySelector('[data-part="link"] > xh-icon [data-scope="icon"]')).not.toBeNull()
    expect(auto.container.querySelector('[data-part="branch-trigger"]')?.getAttribute('aria-expanded')).toBe('true')
  })

  it('图标栏：顶层分支的子层外面生成定位层，与手写全套部件逐节点相同；展开回平铺时定位层撤掉', async () => {
    const auto = mountElement('xh-side-nav', { attrs: { collapsed: '' }, props: { collection: COLLECTION } })
    const hand = mountElement('xh-side-nav', { attrs: { collapsed: '' }, props: { collection: COLLECTION }, inner: manual(true) })
    withIcons(hand.container)
    await settle(auto.container)
    await settle(hand.container)
    expect(structureSnapshot(auto.container)).toEqual(structureSnapshot(hand.container))
    expect(auto.container.querySelectorAll('[data-part="positioner"]')).toHaveLength(1)
    auto.host.removeAttribute('collapsed')
    await settle(auto.container)
    expect(auto.container.querySelectorAll('[data-part="positioner"]')).toHaveLength(0)
    expect(auto.container.querySelector('[data-part="branch"] > [data-part="branch-content"]')).not.toBeNull()
  })
})
