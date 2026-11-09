// 密集展开（侧导航内联子层、树、树选择、JSON 查看器）：子层按实测高度补间，展开从 0 长到自己的高度、同帧淡入；
// 收起时原处的替身从原高度缩到 0、同帧淡出，播完即移除；收起中途再展开从替身此刻的高度接着长。
// 高度、透明度与替身的去留只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhJsonViewerRoot,
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchIndicator,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavInput,
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
  XhTreeSelectRoot,
  XhTreeTree,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function frames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

/** 宿主上把展开与收起拉长到 10s：按键与点击经 CDP 往返，默认 200ms 回来时早就播完了。 */
function mountHost(): HTMLElement {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  host.style.setProperty('--xh-motion-duration-expand', '10s')
  host.style.setProperty('--xh-motion-duration-collapse', '10s')
  document.body.append(host)
  return host
}

/** 子层上那一段补间（脚本动画，不是 CSS 关键帧与过渡）。 */
function tween(el: Element): Animation | undefined {
  return el.getAnimations().find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

function ghostOf(scope: string): HTMLElement | null {
  return host!.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='branch-content'][data-xh-ghost]`)
}

function live(scope: string): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='branch-content']:not([data-xh-ghost])`)]
}

/** 把某一段补间推进到给定进度（0–1）。 */
function seek(animation: Animation, progress: number): void {
  animation.currentTime = Number(animation.effect!.getComputedTiming().duration) * progress
}

const NAV = [
  { value: 'home', label: '工作台', href: '#home' },
  { value: 'user', label: '用户管理', children: [
    { value: 'user-list', label: '用户列表', href: '#user-list' },
    { value: 'user-role', label: '角色权限', href: '#user-role' },
    { value: 'user-log', label: '登录日志', href: '#user-log' },
  ] },
  { value: 'order', label: '订单管理', children: [{ value: 'order-list', label: '订单列表', href: '#order-list' }] },
]

async function mountNav(expanded: string[] = []): Promise<void> {
  mountHost()
  const link = (value: string, label: string) => h(XhSideNavItem, { key: value }, () =>
    h(XhSideNavLink, { value }, () => h(XhSideNavLinkText, null, () => label)))
  app = createApp({
    render: () => h(XhSideNavRoot, { collection: NAV, defaultExpandedValue: expanded } as Record<string, unknown>, () => [
      h(XhSideNavInput, { placeholder: '搜索导航' }),
      h(XhSideNavList, null, () => [
        link('home', '工作台'),
        ...NAV.slice(1).map(branch => h(XhSideNavBranch, { key: branch.value, value: branch.value }, () => [
          h(XhSideNavBranchTrigger, null, () => [h(XhSideNavBranchText, null, () => branch.label), h(XhSideNavBranchIndicator)]),
          h(XhSideNavBranchContent, null, () => branch.children!.map(leaf => link(leaf.value, leaf.label))),
        ])),
      ]),
    ]),
  })
  app.mount(host!)
  await frames()
}

function navTrigger(index: number): HTMLElement {
  return host!.querySelectorAll<HTMLElement>(`[data-scope='side-nav'][data-part='branch-trigger']`)[index]!
}

describe('侧导航内联子层', () => {
  it('首帧就展开着的子层直接呈现，不补间', async () => {
    await mountNav(['user'])
    expect(tween(live('side-nav')[0]!)).toBeUndefined()
  })

  it('展开：子层从 0 长到实测高度、同帧淡入，下面的分支跟着一路挪下去', async () => {
    await mountNav()
    const below = navTrigger(1)
    const belowTop = below.getBoundingClientRect().top
    await userEvent.click(navTrigger(0))
    await expect.poll(() => tween(live('side-nav')[0]!) !== undefined).toBe(true)
    const content = live('side-nav')[0]!
    const animation = tween(content)!
    animation.pause()
    seek(animation, 0)
    expect(content.getBoundingClientRect().height).toBeLessThan(1)
    expect(Number(getComputedStyle(content).opacity)).toBeLessThan(0.05)
    expect(Math.abs(below.getBoundingClientRect().top - belowTop)).toBeLessThan(1)
    seek(animation, 0.5)
    const mid = content.getBoundingClientRect().height
    expect(mid).toBeGreaterThan(1)
    animation.finish()
    const full = content.getBoundingClientRect().height
    expect(mid).toBeLessThan(full)
    expect(below.getBoundingClientRect().top - belowTop).toBeCloseTo(full + Number.parseFloat(getComputedStyle(content.parentElement!).rowGap || '0'), 0)
    expect(tween(content)).toBeUndefined()
  })

  it('收起：替身留在原处从原高度缩到 0、同帧淡出，播完即移除；替身不可交互、不进键盘导航', async () => {
    await mountNav(['user'])
    const content = live('side-nav')[0]!
    const height = content.getBoundingClientRect().height
    const top = content.getBoundingClientRect().top
    await userEvent.click(navTrigger(0))
    await expect.poll(() => ghostOf('side-nav') !== null).toBe(true)
    const ghost = ghostOf('side-nav')!
    expect(content.hidden).toBe(true)
    expect(ghost.previousElementSibling).toBe(content)
    expect(ghost.hasAttribute('inert')).toBe(true)
    expect(ghost.getAttribute('aria-hidden')).toBe('true')
    expect(ghost.querySelector('[id]'), '替身里摘掉了 id').toBeNull()
    const animation = tween(ghost)!
    animation.pause()
    seek(animation, 0)
    expect(Math.abs(ghost.getBoundingClientRect().top - top)).toBeLessThan(1)
    expect(Math.abs(ghost.getBoundingClientRect().height - height)).toBeLessThan(1)
    // 键盘从这一枝往下走，越过替身直接到下一枝
    navTrigger(0).focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(navTrigger(1))
    animation.finish()
    await expect.poll(() => ghost.isConnected).toBe(false)
  })

  it('收起中途再展开：从替身此刻的高度接着长，不先跳回 0', async () => {
    await mountNav(['user'])
    await userEvent.click(navTrigger(0))
    await expect.poll(() => ghostOf('side-nav') !== null).toBe(true)
    const ghost = ghostOf('side-nav')!
    const collapsing = tween(ghost)!
    collapsing.pause()
    seek(collapsing, 0.5)
    const partway = ghost.getBoundingClientRect().height
    expect(partway).toBeGreaterThan(1)
    await userEvent.click(navTrigger(0))
    await expect.poll(() => ghost.isConnected).toBe(false)
    const content = live('side-nav')[0]!
    const expanding = tween(content)!
    expanding.pause()
    seek(expanding, 0)
    expect(Math.abs(content.getBoundingClientRect().height - partway)).toBeLessThan(1.5)
  })

  it('搜索换枝当场落定：输入检索词时子层不补间、不放替身', async () => {
    await mountNav()
    await userEvent.click(host!.querySelector<HTMLElement>(`[data-scope='side-nav'][data-part='input']`)!)
    await userEvent.keyboard('列表')
    await frames()
    expect(ghostOf('side-nav')).toBeNull()
    for (const el of live('side-nav'))
      expect(tween(el)).toBeUndefined()
  })
})

describe('树', () => {
  const NODES = [
    { value: 'docs', label: 'docs', children: [{ value: 'a', label: 'a.md' }, { value: 'b', label: 'b.md' }] },
    { value: 'src', label: 'src', children: [{ value: 'c', label: 'c.ts' }] },
  ]

  async function mountTree(): Promise<void> {
    mountHost()
    const renderNode = (node: (typeof NODES)[number] | { value: string, label: string }): ReturnType<typeof h> => 'children' in node
      ? h(XhTreeBranch, { key: node.value, value: node.value }, () => [
          h(XhTreeBranchControl, null, () => h(XhTreeBranchText, null, () => node.label)),
          h(XhTreeBranchContent, null, () => node.children.map(renderNode)),
        ])
      : h(XhTreeItem, { key: node.value, value: node.value }, () => h(XhTreeItemText, null, () => node.label))
    app = createApp({ render: () => h(XhTreeRoot, { collection: NODES }, () => h(XhTreeTree, null, () => NODES.map(renderNode))) })
    app.mount(host!)
    await frames()
  }

  it('右键展开从 0 补到实测高度；左键收起由替身缩回去、播完即移除', async () => {
    await mountTree()
    // 树节点（treeitem）是分支本身，键盘落在它上面
    host!.querySelector<HTMLElement>(`[data-scope='tree'][data-part='branch']`)!.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.poll(() => tween(live('tree')[0]!) !== undefined).toBe(true)
    const expanding = tween(live('tree')[0]!)!
    expanding.pause()
    seek(expanding, 0)
    expect(live('tree')[0]!.getBoundingClientRect().height).toBeLessThan(1)
    expanding.finish()
    const height = live('tree')[0]!.getBoundingClientRect().height
    expect(height).toBeGreaterThan(1)

    await userEvent.keyboard('{ArrowLeft}')
    await expect.poll(() => ghostOf('tree') !== null).toBe(true)
    const ghost = ghostOf('tree')!
    expect(live('tree')[0]!.getAttribute('data-state')).toBe('closed')
    const collapsing = tween(ghost)!
    collapsing.pause()
    seek(collapsing, 0)
    expect(Math.abs(ghost.getBoundingClientRect().height - height)).toBeLessThan(1)
    collapsing.finish()
    await expect.poll(() => ghost.isConnected).toBe(false)
  })
})

describe('树选择', () => {
  it('浮层里的子层同样补间', async () => {
    mountHost()
    const collection = [{ value: 'east', label: '华东', children: [{ value: 'sh', label: '上海' }, { value: 'hz', label: '杭州' }] }]
    app = createApp({
      // 不写默认插槽：照整套结构铺开，树节点也由组件按集合生成
      render: () => h(XhTreeSelectRoot, { collection, defaultOpen: true } as Record<string, unknown>),
    })
    app.mount(host!)
    await frames(3)
    // 浮层挂在 body 下，不在宿主里
    await userEvent.click(document.querySelector<HTMLElement>(`[data-scope='tree-select'][data-part='branch-trigger']`)!)
    await expect.poll(() => {
      const content = document.querySelector(`[data-scope='tree-select'][data-part='branch-content']`)
      return content !== null && tween(content) !== undefined
    }).toBe(true)
  })
})

describe('jSON 查看器', () => {
  it('子层收起即卸下：替身在原处缩回去；再展开插进来的子层从 0 补间', async () => {
    mountHost()
    app = createApp({ render: () => h(XhJsonViewerRoot, { value: { user: { name: 'Ada', role: 'admin', city: 'London' } } }) })
    app.mount(host!)
    await frames(3)
    const branch = (): HTMLElement => host!.querySelector<HTMLElement>(`[data-scope='json-viewer'][data-part='branch'][aria-expanded]`)!
    const before = live('json-viewer').length
    expect(before).toBeGreaterThan(0)
    branch().focus()
    if (branch().getAttribute('aria-expanded') === 'true') {
      await userEvent.keyboard('{ArrowLeft}')
      await expect.poll(() => ghostOf('json-viewer') !== null).toBe(true)
      const ghost = ghostOf('json-viewer')!
      expect(tween(ghost)).toBeDefined()
      tween(ghost)!.finish()
      await expect.poll(() => ghost.isConnected).toBe(false)
    }
    await userEvent.keyboard('{ArrowRight}')
    await expect.poll(() => live('json-viewer').some(el => tween(el) !== undefined)).toBe(true)
  })
})
