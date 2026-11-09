// 密集展开（侧导航内联子层、树、JSON 查看器）：子层按实测高度补间，展开从 0 长到自己的高度、同帧淡入；
// 收起时原处的替身从原高度缩到 0、同帧淡出，播完即移除；收起中途再展开从替身此刻的高度接着长。
// 宿主带着 [hidden]{display:none!important}（Tailwind preflight 同款）：替身不靠撤 hidden 留在屏上。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import {
  XhJsonViewerRoot,
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeItem,
  XhTreeItemText,
  XhTreeRoot,
  XhTreeTree,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import './hidden-important-host'

let root: Root | null = null
let host: HTMLElement | null = null
const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

async function settle(): Promise<void> {
  for (let index = 0; index < 4; index++) {
    await inAct(async () => {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    })
  }
}

/** 宿主上把展开与收起拉长到 10s：按键与点击经 CDP 往返，默认 200ms 回来时早就播完了。 */
async function mount(node: ReactNode): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  host.style.setProperty('--xh-motion-duration-expand', '10s')
  host.style.setProperty('--xh-motion-duration-collapse', '10s')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(node))
  await settle()
}

afterEach(async () => {
  if (root)
    await inAct(() => root!.unmount())
  root = null
  host?.remove()
  host = null
})

function tween(el: Element): Animation | undefined {
  return el.getAnimations().find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

function ghostOf(scope: string): HTMLElement | null {
  return host!.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='branch-content'][data-xh-ghost]`)
}

function live(scope: string): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='branch-content']:not([data-xh-ghost])`)]
}

function seek(animation: Animation, progress: number): void {
  animation.currentTime = Number(animation.effect!.getComputedTiming().duration) * progress
}

const NAV = [
  { value: 'user', label: '用户管理', children: [
    { value: 'user-list', label: '用户列表', href: '#user-list' },
    { value: 'user-role', label: '角色权限', href: '#user-role' },
  ] },
  { value: 'order', label: '订单管理', children: [{ value: 'order-list', label: '订单列表', href: '#order-list' }] },
]

function Nav({ expanded = [] }: { expanded?: string[] }): ReactNode {
  return (
    <XhSideNavRoot collection={NAV} defaultExpandedValue={expanded}>
      <XhSideNavList>
        {NAV.map(branch => (
          <XhSideNavBranch key={branch.value} value={branch.value}>
            <XhSideNavBranchTrigger><XhSideNavBranchText>{branch.label}</XhSideNavBranchText></XhSideNavBranchTrigger>
            <XhSideNavBranchContent>
              {branch.children.map(leaf => (
                <XhSideNavItem key={leaf.value}>
                  <XhSideNavLink value={leaf.value}><XhSideNavLinkText>{leaf.label}</XhSideNavLinkText></XhSideNavLink>
                </XhSideNavItem>
              ))}
            </XhSideNavBranchContent>
          </XhSideNavBranch>
        ))}
      </XhSideNavList>
    </XhSideNavRoot>
  )
}

function navTrigger(index: number): HTMLElement {
  return host!.querySelectorAll<HTMLElement>(`[data-scope='side-nav'][data-part='branch-trigger']`)[index]!
}

describe('react 侧导航内联子层', () => {
  it('展开：子层从 0 长到实测高度，第一帧下面的分支一点不动', async () => {
    await mount(<Nav />)
    const belowTop = navTrigger(1).getBoundingClientRect().top
    await userEvent.click(navTrigger(0))
    await expect.poll(() => tween(live('side-nav')[0]!) !== undefined).toBe(true)
    const content = live('side-nav')[0]!
    const animation = tween(content)!
    animation.pause()
    seek(animation, 0)
    expect(content.getBoundingClientRect().height).toBeLessThan(1)
    expect(Math.abs(navTrigger(1).getBoundingClientRect().top - belowTop)).toBeLessThan(1)
    animation.finish()
    expect(content.getBoundingClientRect().height).toBeGreaterThan(1)
  })

  it('收起：替身留在原处缩回去、播完即移除；键盘越过替身', async () => {
    await mount(<Nav expanded={['user']} />)
    const height = live('side-nav')[0]!.getBoundingClientRect().height
    await userEvent.click(navTrigger(0))
    await expect.poll(() => ghostOf('side-nav') !== null).toBe(true)
    const ghost = ghostOf('side-nav')!
    expect(ghost.hasAttribute('inert')).toBe(true)
    const animation = tween(ghost)!
    animation.pause()
    seek(animation, 0)
    expect(Math.abs(ghost.getBoundingClientRect().height - height)).toBeLessThan(1)
    navTrigger(0).focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(navTrigger(1))
    animation.finish()
    await expect.poll(() => ghost.isConnected).toBe(false)
  })

  it('收起中途再展开：从替身此刻的高度接着长', async () => {
    await mount(<Nav expanded={['user']} />)
    await userEvent.click(navTrigger(0))
    await expect.poll(() => ghostOf('side-nav') !== null).toBe(true)
    const ghost = ghostOf('side-nav')!
    const collapsing = tween(ghost)!
    collapsing.pause()
    seek(collapsing, 0.5)
    const partway = ghost.getBoundingClientRect().height
    await userEvent.click(navTrigger(0))
    await expect.poll(() => ghost.isConnected).toBe(false)
    const content = live('side-nav')[0]!
    const expanding = tween(content)!
    expanding.pause()
    seek(expanding, 0)
    expect(Math.abs(content.getBoundingClientRect().height - partway)).toBeLessThan(1.5)
  })
})

describe('react 树与 JSON 查看器', () => {
  it('树：右键展开补间，左键收起由替身缩回去', async () => {
    await mount(
      <XhTreeRoot collection={[{ value: 'docs', label: 'docs', children: [{ value: 'a', label: 'a.md' }, { value: 'b', label: 'b.md' }] }]}>
        <XhTreeTree>
          <XhTreeBranch value="docs">
            <XhTreeBranchControl><XhTreeBranchText>docs</XhTreeBranchText></XhTreeBranchControl>
            <XhTreeBranchContent>
              <XhTreeItem value="a"><XhTreeItemText>a.md</XhTreeItemText></XhTreeItem>
              <XhTreeItem value="b"><XhTreeItemText>b.md</XhTreeItemText></XhTreeItem>
            </XhTreeBranchContent>
          </XhTreeBranch>
        </XhTreeTree>
      </XhTreeRoot>,
    )
    host!.querySelector<HTMLElement>(`[data-scope='tree'][data-part='branch']`)!.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.poll(() => tween(live('tree')[0]!) !== undefined).toBe(true)
    tween(live('tree')[0]!)!.finish()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.poll(() => ghostOf('tree') !== null).toBe(true)
    const ghost = ghostOf('tree')!
    tween(ghost)!.finish()
    await expect.poll(() => ghost.isConnected).toBe(false)
  })

  it('jSON 查看器：子层收起即卸下，替身在原处缩回去；再展开插进来的子层从 0 补间', async () => {
    await mount(<XhJsonViewerRoot value={{ user: { name: 'Ada', role: 'admin', city: 'London' } }} />)
    const branch = (): HTMLElement => host!.querySelector<HTMLElement>(`[data-scope='json-viewer'][data-part='branch'][aria-expanded]`)!
    branch().focus()
    if (branch().getAttribute('aria-expanded') === 'true') {
      await userEvent.keyboard('{ArrowLeft}')
      await expect.poll(() => ghostOf('json-viewer') !== null).toBe(true)
      const ghost = ghostOf('json-viewer')!
      tween(ghost)!.finish()
      await expect.poll(() => ghost.isConnected).toBe(false)
    }
    await userEvent.keyboard('{ArrowRight}')
    await expect.poll(() => live('json-viewer').some(el => tween(el) !== undefined)).toBe(true)
  })
})
