// @vitest-environment jsdom
//
// 导航与工具条这一族的 connect 派了三个不冒泡的事件：focus、pointerenter、pointerleave。
// React 的合成事件全部委派在根容器上、只在冒泡阶段派发：onFocus 挂的是 focusin，
// onPointerEnter / onPointerLeave 是从 pointerover / pointerout 合出来的，直接送到节点上的
// 那一种一个都到不了。共用的一致性套件走的是真实 el.focus()（focusin 会冒泡），核不到这一路。
// 这里按 DOM 的送达路径直接派发，核的是「处理器装在它自己点名的那个事件上」。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhMenubarRoot,
  XhNavigationMenuRoot,
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchIndicator,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => {
    root?.unmount()
  })
  host?.remove()
  root = null
  host = null
})

/** 机器的效应排在提交之后，多催几拍让 DOM 落定。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await Promise.resolve()
    })
  }
}

async function mount(tree: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    root!.render(tree)
  })
  await settle()
}

function parts(scope: string, part: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)]
}

/** 按 DOM 的送达路径派：这三样都不冒泡。 */
async function fire(el: HTMLElement, event: Event): Promise<void> {
  await act(async () => {
    el.dispatchEvent(event)
  })
  await settle()
}

/** 等一段真实时间：悬停弹出是 100ms 的延时，催几拍微任务等不到它。 */
async function wait(ms: number): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  })
  await settle()
}

describe('menubar 的不冒泡事件按 DOM 语义送达', () => {
  const MENUS = [
    { value: 'file', label: '文件', items: [{ value: 'new', label: 'New' }, { value: 'open', label: 'Open' }] },
    { value: 'edit', label: '编辑', items: [{ value: 'cut', label: 'Cut' }] },
  ]

  it('菜单栏自己得焦：焦点转投给入口，容器让出 Tab 位', async () => {
    await mount(<XhMenubarRoot collection={MENUS} />)
    const bar = parts('menubar', 'root')[0]!
    expect(bar.getAttribute('tabindex')).toBe('0')

    await fire(bar, new Event('focus'))

    expect(bar.getAttribute('tabindex')).toBe('-1')
    expect(parts('menubar', 'trigger')[0]!.getAttribute('tabindex')).toBe('0')
  })

  it('条目自己得焦：锚点改记它，roving tabindex 跟着换人', async () => {
    await mount(<XhMenubarRoot collection={MENUS} defaultValue="file" />)
    const [first, second] = parts('menubar', 'item')

    await fire(second!, new Event('focus'))

    expect(second!.getAttribute('tabindex')).toBe('0')
    expect(first!.getAttribute('tabindex')).toBe('-1')
  })
})

describe('navigation-menu 的不冒泡事件按 DOM 语义送达', () => {
  const NODES = [
    { value: 'products', label: 'Products' },
    { value: 'docs', label: 'Docs' },
  ]

  it('指针离开整个 nav：展开的面板收起', async () => {
    await mount(
      <XhNavigationMenuRoot collection={NODES} defaultValue="products" renderPanel={() => '面板'} />,
    )
    const nav = parts('navigation-menu', 'root')[0]!
    expect(parts('navigation-menu', 'trigger')[0]!.getAttribute('aria-expanded')).toBe('true')

    await fire(nav, new Event('pointerleave'))

    expect(parts('navigation-menu', 'trigger')[0]!.getAttribute('aria-expanded')).toBe('false')
  })
})

describe('side-nav 的不冒泡事件按 DOM 语义送达', () => {
  const COLLECTION = [
    { value: 'home', label: 'Home', href: '#home' },
    {
      value: 'user',
      label: 'User',
      children: [{ value: 'user-list', label: 'User list', href: '#user-list' }],
    },
  ]

  const TREE = (
    <XhSideNavRoot collection={COLLECTION}>
      <XhSideNavList>
        <XhSideNavItem>
          <XhSideNavLink value="home"><XhSideNavLinkText>Home</XhSideNavLinkText></XhSideNavLink>
        </XhSideNavItem>
        <XhSideNavBranch value="user">
          <XhSideNavBranchTrigger>
            <XhSideNavBranchText>User</XhSideNavBranchText>
            <XhSideNavBranchIndicator />
          </XhSideNavBranchTrigger>
          <XhSideNavBranchContent>
            <XhSideNavItem>
              <XhSideNavLink value="user-list"><XhSideNavLinkText>User list</XhSideNavLinkText></XhSideNavLink>
            </XhSideNavItem>
          </XhSideNavBranchContent>
        </XhSideNavBranch>
      </XhSideNavList>
    </XhSideNavRoot>
  )

  it('分支入口自己得焦：锚点改记它', async () => {
    await mount(TREE)
    const trigger = parts('side-nav', 'branch-trigger')[0]!

    await fire(trigger, new Event('focus'))

    expect(trigger.getAttribute('data-highlighted')).toBe('')
    expect(trigger.getAttribute('tabindex')).toBe('0')
  })

  it('链接自己得焦：锚点从分支入口挪到它身上', async () => {
    await mount(TREE)
    const trigger = parts('side-nav', 'branch-trigger')[0]!
    const link = parts('side-nav', 'link')[0]!

    await fire(trigger, new Event('focus'))
    await fire(link, new Event('focus'))

    expect(link.getAttribute('data-highlighted')).toBe('')
    expect(trigger.getAttribute('data-highlighted')).toBeNull()
  })

  /** 折叠成图标栏时顶层分支换装浮层，指针掠过即弹出。 */
  const COLLAPSED = (
    <XhSideNavRoot collection={COLLECTION} collapsed>
      <XhSideNavList>
        <XhSideNavBranch value="user">
          <XhSideNavBranchTrigger>
            <XhSideNavBranchText>User</XhSideNavBranchText>
          </XhSideNavBranchTrigger>
          <XhSideNavBranchContent>
            <XhSideNavItem>
              <XhSideNavLink value="user-list"><XhSideNavLinkText>User list</XhSideNavLinkText></XhSideNavLink>
            </XhSideNavItem>
          </XhSideNavBranchContent>
        </XhSideNavBranch>
      </XhSideNavList>
    </XhSideNavRoot>
  )

  it('指针掠过折叠态的分支入口：延时到点后弹出面板', async () => {
    await mount(COLLAPSED)
    const trigger = parts('side-nav', 'branch-trigger')[0]!
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    await fire(trigger, new PointerEvent('pointerenter', { pointerType: 'mouse' }))
    await wait(200)

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('指针在延时到点前离开：那次弹出被撤销', async () => {
    await mount(COLLAPSED)
    const trigger = parts('side-nav', 'branch-trigger')[0]!

    await fire(trigger, new PointerEvent('pointerenter', { pointerType: 'mouse' }))
    await fire(trigger, new PointerEvent('pointerleave', { pointerType: 'mouse' }))
    await wait(200)

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })
})

describe('toolbar 的不冒泡事件按 DOM 语义送达', () => {
  const TREE = (
    <XhToolbarRoot>
      <XhToolbarItem value="bold">粗体</XhToolbarItem>
      <XhToolbarSeparator />
      <XhToolbarItem value="italic">斜体</XhToolbarItem>
    </XhToolbarRoot>
  )

  it('工具条自己得焦：焦点转投给条目，容器让出 Tab 位', async () => {
    await mount(TREE)
    const bar = parts('toolbar', 'root')[0]!
    expect(bar.getAttribute('tabindex')).toBe('0')

    await fire(bar, new Event('focus'))

    expect(bar.getAttribute('tabindex')).toBe('-1')
    expect(parts('toolbar', 'item')[0]!.getAttribute('tabindex')).toBe('0')
  })

  it('条目自己得焦：锚点改记它，roving tabindex 跟着换人', async () => {
    await mount(TREE)
    const [first, second] = parts('toolbar', 'item')

    await fire(second!, new Event('focus'))

    expect(second!.getAttribute('tabindex')).toBe('0')
    expect(first!.getAttribute('tabindex')).toBe('-1')
  })
})
