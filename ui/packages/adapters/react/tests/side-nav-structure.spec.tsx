// @vitest-environment jsdom
// 不给 children 时照 sideNavStructure 铺：平铺与图标栏两种排布，铺出的 DOM 都与手写全套部件逐节点相同；
// 给了 icon 的入口在行文字前是一枚 XhIcon。
import type { SideNavNode } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import type { XhSideNavRootProps } from '../src'
import { describe, expect, it } from 'vitest'
import { XhIcon, XhSideNavBranch, XhSideNavBranchContent, XhSideNavBranchIndicator, XhSideNavBranchText, XhSideNavBranchTrigger, XhSideNavItem, XhSideNavLink, XhSideNavLinkText, XhSideNavList, XhSideNavRoot } from '../src'
import { renderInto, structureSnapshot } from './structure-snapshot'

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

function row(node: SideNavNode): ReactNode {
  if (!node.children) {
    return (
      <XhSideNavItem key={node.value}>
        <XhSideNavLink value={node.value}>
          {node.icon ? <XhIcon icon={node.icon} /> : null}
          <XhSideNavLinkText>{node.label}</XhSideNavLinkText>
        </XhSideNavLink>
      </XhSideNavItem>
    )
  }
  return (
    <XhSideNavBranch key={node.value} value={node.value}>
      <XhSideNavBranchTrigger>
        {node.icon ? <XhIcon icon={node.icon} /> : null}
        <XhSideNavBranchText>{node.label}</XhSideNavBranchText>
        <XhSideNavBranchIndicator />
      </XhSideNavBranchTrigger>
      <XhSideNavBranchContent>{node.children.map(row)}</XhSideNavBranchContent>
    </XhSideNavBranch>
  )
}

function Manual(props: XhSideNavRootProps) {
  return (
    <XhSideNavRoot {...props}>
      <XhSideNavList>{COLLECTION.map(row)}</XhSideNavList>
    </XhSideNavRoot>
  )
}

describe('side-nav 的标准结构', () => {
  it('平铺：只给 collection 铺出的树与手写全套部件逐节点相同，当前页与展开态都在', async () => {
    const auto = await renderInto(<XhSideNavRoot collection={COLLECTION} defaultValue="user-list" defaultExpandedValue={['user']} />)
    const hand = await renderInto(<Manual collection={COLLECTION} defaultValue="user-list" defaultExpandedValue={['user']} />)
    expect(structureSnapshot(auto.host)).toEqual(structureSnapshot(hand.host))
    expect(auto.host.querySelector('[aria-current="page"]')?.textContent).toBe('用户列表')
    expect(auto.host.querySelector('[data-part="link"] > [data-scope="icon"]')).not.toBeNull()
    expect(auto.host.querySelector('[data-part="branch-trigger"]')?.getAttribute('aria-expanded')).toBe('true')
  })

  it('图标栏：顶层分支的子层成了弹出面板，铺出的树同样与手写全套部件逐节点相同', async () => {
    const auto = await renderInto(<XhSideNavRoot collection={COLLECTION} collapsed />)
    const hand = await renderInto(<Manual collection={COLLECTION} collapsed />)
    expect(structureSnapshot(auto.host)).toEqual(structureSnapshot(hand.host))
  })
})
