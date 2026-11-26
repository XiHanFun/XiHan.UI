// @vitest-environment jsdom
// 不写默认插槽时照 sideNavStructure 铺：平铺与图标栏两种排布，铺出的 DOM 都与手写全套部件逐节点相同；
// 给了 icon 的入口在行文字前是一枚 XhIcon。
import type { SideNavNode } from '@xihan-ui/headless'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { XhIcon, XhSideNavBranch, XhSideNavBranchContent, XhSideNavBranchIndicator, XhSideNavBranchText, XhSideNavBranchTrigger, XhSideNavItem, XhSideNavLink, XhSideNavLinkText, XhSideNavList, XhSideNavRoot } from '../src'
import { flush, mountRender, structureSnapshot } from './structure-snapshot'

const HOME = { name: 'home', viewBox: '0 0 24 24', nodes: [{ tag: 'path', attrs: { d: 'M3 10l9-7 9 7' } }] } as const
const USERS = { name: 'users', viewBox: '0 0 24 24', nodes: [{ tag: 'circle', attrs: { cx: '9', cy: '8', r: '3.5' } }] } as const

const COLLECTION: SideNavNode[] = [
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

function leaf(node: SideNavNode) {
  return h(XhSideNavItem, { key: node.value }, () => h(XhSideNavLink, { value: node.value }, () => [
    node.icon ? h(XhIcon, { icon: node.icon }) : null,
    h(XhSideNavLinkText, () => node.label),
  ]))
}

function branch(node: SideNavNode): ReturnType<typeof h> {
  return h(XhSideNavBranch, { key: node.value, value: node.value }, () => [
    h(XhSideNavBranchTrigger, () => [
      node.icon ? h(XhIcon, { icon: node.icon }) : null,
      h(XhSideNavBranchText, () => node.label),
      h(XhSideNavBranchIndicator),
    ]),
    h(XhSideNavBranchContent, () => node.children!.map(child => (child.children ? branch(child) : leaf(child)))),
  ])
}

function manual(props: Record<string, unknown>) {
  return () => h(XhSideNavRoot, props, () => h(XhSideNavList, () => COLLECTION.map(node => (node.children ? branch(node) : leaf(node)))))
}

describe('side-nav 的标准结构', () => {
  it('平铺：只给 collection 铺出的树与手写全套部件逐节点相同，当前页与展开态都在', async () => {
    const props = { collection: COLLECTION, defaultValue: 'user-list', defaultExpandedValue: ['user'] }
    const auto = mountRender(() => h(XhSideNavRoot, props))
    const hand = mountRender(manual(props))
    await flush()
    expect(structureSnapshot(auto)).toEqual(structureSnapshot(hand))
    expect(auto.querySelector('[aria-current="page"]')?.textContent).toBe('用户列表')
    expect(auto.querySelector('[data-part="link"] > [data-scope="icon"]')).not.toBeNull()
    expect(auto.querySelector('[data-part="branch-trigger"]')?.getAttribute('aria-expanded')).toBe('true')
  })

  it('图标栏：顶层分支的子层成了弹出面板，铺出的树同样与手写全套部件逐节点相同', async () => {
    const props = { collection: COLLECTION, collapsed: true }
    const auto = mountRender(() => h(XhSideNavRoot, props))
    const hand = mountRender(manual(props))
    await flush()
    expect(structureSnapshot(auto)).toEqual(structureSnapshot(hand))
  })
})
